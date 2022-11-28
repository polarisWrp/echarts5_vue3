<template>
  <!-- 销量柱状图 -->
  <div class="com-page">
    <div class="com-container">
      <div class="com-chart" ref="rankRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { RankData } from '@/types/charts';
import { rankColorArr } from '@/types/charts/colorConfig';
import SocketService from '@/utils/useWebSocket';
import { EChartsOption } from 'echarts';
import {
  ref,
  defineProps,
  onMounted,
  reactive,
  onUnmounted,
  defineExpose,
  watch,
  computed,
} from 'vue';
import * as $echarts from 'echarts/core';
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from 'echarts/charts';
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  DataZoomComponent,
} from 'echarts/components';
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
$echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  // DatasetComponent,
  TransformComponent,
  BarChart,
  // LabelLayout,
  // UniversalTransition,
  CanvasRenderer,
]);

const store = useStore();
// dom节点
const rankRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
// 定时器
let timer = null as any;
defineExpose({
  screenAdapter: () => screenAdapter(),
});
const content = reactive({
  allData: [] as RankData[],
  startValue: 0, //区域缩放的起点值
  endValue: 9, //区域缩放的终点值
});

const props = defineProps({
  socketInstance: SocketService,
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('rankData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'rankData',
    chartName: 'rank',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  clearInterval(timer);
  props.socketInstance?.removeCallback('rankData');
  window.removeEventListener('resize', screenAdapter);
});
const theme = computed(() => {
  return store.theme;
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
 * @name 图表大小根据屏幕适配
 * @desc 监听图表容器的宽度
 */
const screenAdapter = () => {
  const titleFontSize = Math.ceil(((rankRef.value?.offsetWidth as number) / 100) * 3.6);
  const adapterOption: EChartsOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          borderRadius: [Math.ceil(titleFontSize / 2), Math.ceil(titleFontSize / 2), 0, 0],
        },
      },
    ],
  };
  chartInstance.setOption(adapterOption);
  chartInstance.resize();
};

/**
 * @name 初始化图表
 * */
const initChart = () => {
  chartInstance = $echarts.init(rankRef.value as HTMLDivElement, theme.value);
  const option: EChartsOption = {
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        type: 'bar',
      },
    ],
    title: {
      text: '◐ 北极星销售统计 ◑',
      left: 20,
      top: 20,
    },
    grid: {
      //坐标轴配置
      top: '40%',
      left: '5%',
      right: '5%',
      bottom: '5%',
      containLabel: true, //坐标轴的距离包括坐标轴上的文字
    },
  };
  chartInstance.setOption(option);
  mouseEventListener();
};

/**
 * @name 对鼠标移入移出监听
 * */
const mouseEventListener = () => {
  chartInstance.on('mouseover', () => {
    clearInterval(timer);
  });
  chartInstance.on('mouseout', () => {
    startInterval();
  });
};

/**
 * @name 查询并接收数据
 */
const queryData = (data: RankData[]) => {
  content.allData.push(...data);
  content.allData.sort((a, b) => b.value - a.value);
  updateChart();
  startInterval();
};

/**
 * @name 向图表插入数据
 * @desc 更新数据
 */
const updateChart = () => {
  const provinceArr = content.allData?.map((item) => item.name);
  const valueArr = content.allData?.map((item) => item.value);

  const dataOption: EChartsOption = {
    xAxis: {
      data: provinceArr,
    },
    dataZoom: {
      show: false, //隐藏底部栏目
      startValue: content.startValue,
      endValue: content.endValue,
    },
    series: [
      {
        data: valueArr,
        itemStyle: {
          // 颜色之可以接收一个回调
          color: (arg: any) => {
            let targetArr = [] as string[];
            if (arg.value > 300) {
              targetArr = rankColorArr[0];
            } else if (arg.value > 200) {
              targetArr = rankColorArr[1];
            } else {
              targetArr = rankColorArr[2];
            }
            return new $echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: targetArr[0],
              },
              {
                offset: 1,
                color: targetArr[1],
              },
            ]);
          },
        },
      },
    ],
  };
  chartInstance.setOption(dataOption);
};

/**
 * @name 开启定时器分页加载图表数据
 */
const startInterval = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    content.startValue++;
    content.endValue++;
    if (content.endValue > content.allData.length - 1) {
      content.startValue = 0;
      content.endValue = 9;
    }
    updateChart();
  }, 2000);
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
</style>
