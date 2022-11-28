<template>
  <!-- 饼图 -->
  <div class="com-page">
    <div class="com-container">
      <div class="com-chart" ref="hotRef"></div>
      <span class="iconfont icon-arrow-lift icon-left" @click="toLeft" :style="fontStyle"></span>
      <span class="iconfont icon-arrow-right icon-right" @click="toRight" :style="fontStyle"></span>
      <span class="pie-name" :style="fontStyle">{{ pieName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HotData, Item } from '@/types/charts';
import SocketService from '@/utils/useWebSocket';
import { computed } from '@vue/reactivity';
import { EChartsOption } from 'echarts';
import { ref, defineProps, onMounted, reactive, onUnmounted, defineExpose, watch } from 'vue';
import { useStore } from '@/store/index';
import { getThemeConfig } from '@/utils/themeUtils';

import * as $echarts from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { PieChart } from 'echarts/charts';
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
} from 'echarts/components';
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
$echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  // GridComponent,
  // DatasetComponent,
  // TransformComponent,
  PieChart,
  // LabelLayout,
  // UniversalTransition,
  CanvasRenderer,
]);

const store = useStore();
// dom节点
const hotRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
defineExpose({
  screenAdapter: () => screenAdapter(),
});
const content = reactive({
  allData: [] as HotData[],
  currentIndex: 0, //当前展示的一级分类数据
  titleFontSize: 0,
});

const props = defineProps({
  socketInstance: SocketService,
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('hotData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'hotData',
    chartName: 'hot',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  props.socketInstance?.removeCallback('hotData');
  window.removeEventListener('resize', screenAdapter);
});
const theme = computed(() => {
  return store.theme;
});
const fontStyle = computed(() => {
  return {
    fontSize: content.titleFontSize + 'px',
    color: getThemeConfig(theme).titleColor,
  };
});

// 服装类别名称
const pieName = computed(() => {
  if (!content.allData.length) return '北极星';
  else return content.allData[content.currentIndex]?.name;
});
watch(
  () => theme.value,
  async () => {
    await chartInstance.dispose();
    await initChart();
    await screenAdapter();
    await updateChart();
  },
);

/**
 * @name 初始化图表
 * */
const initChart = () => {
  chartInstance = $echarts.init(hotRef.value as HTMLDivElement, theme.value);
  const option: EChartsOption = {
    series: [
      {
        type: 'pie',
        label: {
          show: false,
        },
        emphasis: {
          // 高亮状态下的样式
          label: {
            show: true,
          },
          labelLine: {
            show: false,
          },
        },
      },
    ],
    legend: {
      left: '38%',
      top: '5%',
      icon: 'circle',
    },
    title: {
      text: '◐ 北极星销售占比',
      left: 20,
      top: 20,
    },
    tooltip: {
      backgroundColor: '#99999',
      show: true,
      formatter: (arg: any) => {
        // 每一块的数据内容来自于我们设置的 series中的data
        const thirdData = arg.data?.children as Item[];
        let total = 0;
        thirdData.forEach((item) => {
          total += item.value;
        });
        let retStr = '';
        thirdData.forEach((item) => {
          retStr += `
          ${item.name}: ${Math.round(Number(item.value / total) * 100)} %
          <br/>
          `;
        });
        return retStr;
      },
    },
  };
  chartInstance.setOption(option);
};

/**
 * @name 图表大小根据屏幕适配
 * @desc 监听图表容器的宽度
 */
const screenAdapter = () => {
  content.titleFontSize = Math.ceil(((hotRef.value?.offsetWidth as number) / 100) * 3.6);
  const legendSize = Math.ceil(content.titleFontSize / 1.8);
  const adapterOption: EChartsOption = {
    title: {
      textStyle: {
        fontSize: content.titleFontSize,
      },
    },
    legend: {
      itemWidth: legendSize,
      itemHeight: legendSize,
      itemGap: legendSize,
      textStyle: {
        fontSize: legendSize,
      },
    },
    series: [
      {
        //饼图大小设置
        radius: Math.ceil(content.titleFontSize * 5),
        center: ['50%', '50%'],
      },
    ],
  };
  chartInstance.setOption(adapterOption);
  chartInstance.resize();
};

/**
 * @name 查询并接收数据
 */
const queryData = (data: HotData[]) => {
  content.allData.push(...data);
  updateChart();
};

/**
 * @name 向图表插入数据
 * @desc 更新数据
 */
const updateChart = () => {
  const legendData = content.allData[content.currentIndex].children?.map((item) => item.name);
  const seriesData = content.allData[content.currentIndex]?.children?.map((item) => {
    return {
      name: item.name,
      value: item.value,
      children: item.children,
    };
  });
  const dataOption: EChartsOption = {
    series: [
      {
        data: seriesData,
      },
    ],
    legend: {
      data: legendData,
    },
  };
  chartInstance.setOption(dataOption);
};

// 饼图的左右切换
const toLeft = () => {
  content.currentIndex--;
  if (content.currentIndex < 0) {
    content.currentIndex = content.allData.length - 1;
  }
  updateChart();
};
const toRight = () => {
  content.currentIndex++;
  if (content.currentIndex > content.allData.length - 1) {
    content.currentIndex = 0;
  }
  updateChart();
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
.icon-arrow-lift {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #fff;
}
.icon-arrow-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #fff;
}
.pie-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
}
</style>
