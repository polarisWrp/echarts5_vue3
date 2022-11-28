<template>
  <div class="com-page">
    <div class="com-container">
      <div class="com-chart" ref="stockRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { StockData } from '@/types/charts';
import { stockCenterPosition, stockColorList } from '@/types/charts/colorConfig';
import SocketService from '@/utils/useWebSocket';
import * as $echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { ref, defineProps, onMounted, onUnmounted, defineExpose, watch, computed } from 'vue';

const store = useStore();
// dom节点
const stockRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
// 定时器
let timer = null as any;

const content = {
  allData: [] as StockData[],
  currentIndex: 0,
};
defineExpose({
  screenAdapter: () => screenAdapter(),
});
const props = defineProps({
  socketInstance: SocketService,
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('stockData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'stockData',
    chartName: 'stock',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  clearInterval(timer);
  props.socketInstance?.removeCallback('stockData');
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
  const titleFontSize = Math.ceil(((stockRef.value?.offsetWidth as number) / 100) * 3.6);
  const fontsizeRes = Math.ceil((titleFontSize / 4) * 2);
  const innerRadius = Math.ceil(titleFontSize * 2);
  const outerRadius = Math.ceil(innerRadius * 1.125);
  let seriesArr = [] as any;
  for (let i = 0; i < 5; i++) {
    seriesArr.push({
      type: 'pie',
      radius: [innerRadius, outerRadius],
      label: {
        fontSize: fontsizeRes,
      },
    });
  }
  const adapterOption: EChartsOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    series: seriesArr,
  };
  chartInstance.setOption(adapterOption);
  chartInstance.resize();
};

/**
 * @name 初始化图表
 * */
const initChart = async () => {
  chartInstance = $echarts.init(stockRef.value as HTMLDivElement, theme.value);
  const option: EChartsOption = {
    title: {
      text: '◐ 北极星库存与销量分析',
      left: 20,
      top: 20,
    },
  };
  await chartInstance.setOption(option);
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
const queryData = async (data: StockData[]) => {
  // console.log(data);
  content.allData.push(...data);
  await updateChart();
  await startInterval();
};

/**
 * @name 向图表插入数据
 * @desc 更新数据
 */
const updateChart = () => {
  // 截取5项展示
  const start = content.currentIndex * 5;
  const end = (content.currentIndex + 1) * 5;
  const showData = content.allData.slice(start, end);
  // console.log(content.allData);
  const seriesArr = showData.map((item, index) => {
    return {
      type: 'pie',
      // radius: [110, 100], //通过设置两个圆半径实现圆环
      center: stockCenterPosition[index],
      // hoverAnimation: false, //关闭鼠标移入饼图时的动画效果
      emphasis: {
        scale: false,
      },
      labelLine: {
        show: false, //隐藏指示线
      },
      label: {
        color: stockColorList[index][0],
        position: 'center', //文字设置在圆环中心
      },
      data: [
        {
          // 销量数据
          name: item.name + '\n' + item.sales,
          value: item.sales,
          itemStyle: {
            color: new $echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: stockColorList[index][0],
              },
              {
                offset: 1,
                color: stockColorList[index][1],
              },
            ]),
          },
        },
        {
          name: item.name + '\n' + item.sales,
          // 库存数据
          value: item.stock,
          itemStyle: {
            color: '#333843',
          },
        },
      ],
    };
  });
  const dataOption = {
    series: seriesArr,
  };
  chartInstance.setOption(dataOption);
};

/**
 * @name 开启定时器分页加载图表数据
 */
const startInterval = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(async () => {
    content.currentIndex++;
    if (content.currentIndex > 1) {
      content.currentIndex = 0;
    }
    await updateChart();
  }, 2000);
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
</style>
