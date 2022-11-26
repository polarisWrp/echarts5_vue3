<template>
  <div class="com-page">
    <div class="com-container">
      <div class="com-chart" ref="sellerRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { Item } from '@/types/charts';
import SocketService from '@/utils/useWebSocket';
import * as $echarts from 'echarts';
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
// 引入自定义主题
// import { sunny } from '@/assets/theme/sunny';

const store = useStore();
// dom节点
const sellerRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
// 定时器
let timer = null as any;
defineExpose({
  screenAdapter: () => screenAdapter(),
});
const content = reactive({
  allData: [] as Item[],
  currentPage: 1,
  totalPage: 0,
  pageSize: 5,
});

const props = defineProps({
  socketInstance: SocketService,
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('sellerData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'sellerData', //数据为seller数据
    chartName: 'seller',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  clearInterval(timer);
  props.socketInstance?.removeCallback('sellerData');
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
  const titleFontSize = ((sellerRef.value?.offsetWidth as number) / 100) * 3.6;
  const adapterOption: EChartsOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          width: titleFontSize,
        },
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
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
  // 使用自定义主题时调用
  // $echarts.registerTheme('sunny', sunny);
  chartInstance = $echarts.init(sellerRef.value as HTMLDivElement, theme.value);
  const option: EChartsOption = {
    title: {
      text: '◐ 北极星销售统计 ◑',
      left: 20,
      top: 20,
    },
    grid: {
      //坐标轴配置
      top: '20%',
      left: '3%',
      right: '6%',
      bottom: '3%',
      containLabel: true, //坐标轴的距离包括坐标轴上的文字
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
    },
    tooltip: {
      trigger: 'axis', //鼠标移入坐标轴时触发
      axisPointer: {
        type: 'line', //移入坐标轴样式
        z: 0, //层级设低
        lineStyle: {
          color: '#2D3443',
        },
      },
    },
    series: [
      {
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          textBorderColor: 'white',
        },
        itemStyle: {
          // 渐变颜色， 1.指定颜色渐变方向 2.指定不同百分比时的颜色
          color: new $echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
              offset: 0, //百分之0
              color: '#3498db',
            },
            {
              offset: 1, //百分之100
              color: '#2ecc71',
            },
          ]),
        },
      },
    ],
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
const queryData = (data: Item[]) => {
  content.allData.push(...data);
  content.allData.sort((a, b) => a.value - b.value);
  content.totalPage =
    content.allData?.length % 5 === 0
      ? content.allData?.length / 5
      : content.allData?.length / 5 + 1;
  updateChart();
  startInterval();
};

/**
 * @name 向图表插入数据
 * @desc 更新数据
 */
const updateChart = () => {
  const start = (content.currentPage - 1) * content.pageSize;
  const end = content.currentPage * content.pageSize;
  // 截取5条数据展示
  const showData = content.allData.slice(start, end);
  const categoryNames = showData?.map((item) => item.name);
  const sellerValues = showData?.map((item) => item.value);
  const dataOption: EChartsOption = {
    yAxis: {
      data: categoryNames,
    },
    series: [
      {
        data: sellerValues,
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
    content.currentPage++;
    if (content.currentPage > content.totalPage) {
      content.currentPage = 1;
    }
    updateChart();
  }, 2500);
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
</style>
