<template>
  <div class="com-page">
    <div class="title" :style="curOptionStyle">
      <span>◐ {{ curTypeName }}</span>
      <span
        class="iconfont icon-arrow-down"
        @click="content.showOption = !content.showOption"
        :style="curOptionStyle"
      ></span>
      <div class="select-con" v-show="content.showOption" :style="marginStyle">
        <div
          class="select-option"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handleSelectOption(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-container">
      <div class="com-chart" ref="trendRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendData, TypeKey } from '@/types/charts';
import { getThemeConfig } from '@/utils/themeUtils';
import SocketService from '@/utils/useWebSocket';
import * as $echarts from 'echarts';
import { EChartsOption } from 'echarts';
import {
  ref,
  defineProps,
  onMounted,
  reactive,
  onUnmounted,
  computed,
  defineExpose,
  watch,
} from 'vue';
import { useStore } from '@/store/index';
import { trendColorArr1, trendColorArr2 } from '@/types/charts/colorConfig';

const store = useStore();
const trendRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
const content = reactive({
  allData: {} as TrendData,
  titleFontSize: 0,
  curType: 'map' as TypeKey,
  showOption: false,
});

const props = defineProps({
  socketInstance: SocketService,
});

defineExpose({
  screenAdapter: () => screenAdapter(),
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('trendData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'trendData', //数据为seller数据
    chartName: 'trend',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  props.socketInstance?.removeCallback('trendData');
  window.removeEventListener('resize', screenAdapter);
});
// 主题样式
const theme = computed(() => {
  return store.theme;
});
// 动态绑定标题字体样式
const curOptionStyle = computed(() => {
  return {
    fontSize: Math.ceil(content.titleFontSize) + 'px',
    color: getThemeConfig(theme).titleColor,
  };
});

// 标题与左侧间距
const marginStyle = computed(() => {
  return {
    marginLeft: Math.ceil(content.titleFontSize) + 'px',
  };
});

// 标题下拉选项
const selectTypes = computed(() => {
  return !content.allData
    ? []
    : content.allData.type?.filter((item) => item.key !== content.curType);
});

// 图表标题名称
const curTypeName = computed(() => {
  return !content.allData ? '' : content.allData[content.curType]?.title;
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

const handleSelectOption = (type: string) => {
  content.curType = type as TypeKey;
  updateChart();
  content.showOption = false;
};

/**
 * @name 初始化图表
 * */
const initChart = () => {
  chartInstance = $echarts.init(trendRef.value as HTMLDivElement, theme.value);
  const option: EChartsOption = {
    grid: {
      left: '3%',
      right: '4%',
      top: '35%',
      bottom: '1%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      //图例位置和形状设置
      left: 20,
      top: '15%',
      icon: 'circle',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false, //是否需要间隔，也就是折线起点与y轴是否需要间隔
    },
    yAxis: {
      type: 'value',
    },
  };
  chartInstance.setOption(option);
};

/**
 * @name 查询并接收数据
 */
const queryData = (data: TrendData) => {
  content.allData = data;
  updateChart();
};
/**
 * @name 图表大小根据屏幕适配
 * @desc 监听图表容器的宽度
 */
const screenAdapter = () => {
  content.titleFontSize = ((trendRef.value?.offsetWidth as number) / 100) * 3.6;
  const adapterOption: EChartsOption = {
    legend: {
      itemWidth: content.titleFontSize,
      itemHeight: content.titleFontSize,
      itemGap: content.titleFontSize,
      textStyle: {
        fontSize: content.titleFontSize / 2,
      },
    },
  };
  chartInstance.setOption(adapterOption);
  chartInstance.resize();
};

/**
 * @name 向图表插入数据
 * @desc 更新数据
 */
const updateChart = () => {
  // x轴月份数据
  const timeArr = content.allData.common.month;
  // y轴在series的数据
  const valueArr = content.allData[content.curType].data;
  const seriesArr = valueArr.map((item, index) => {
    return {
      name: item.name,
      type: 'line',
      data: item.data,
      stack: content.curType, //以堆叠图的形式展示
      smooth: true, //平滑曲线
      areaStyle: {
        color: new $echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: trendColorArr1[index],
          },
          {
            offset: 1,
            color: trendColorArr2[index],
          },
        ]),
      }, //颜色填充
    };
  });
  // 图例数据
  const legendArr = valueArr.map((item) => item.name);
  const dataOption = {
    xAxis: {
      data: timeArr,
    },
    legend: {
      // 设置图例数据
      data: legendArr,
    },
    series: seriesArr,
  };
  chartInstance.setOption(dataOption);
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
.title {
  position: absolute;
  z-index: 10;
  left: 20px;
  top: 20px;
  .icon-arrow-down {
    cursor: pointer;
    margin-left: 10px;
  }
}
</style>
