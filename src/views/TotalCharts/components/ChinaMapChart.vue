<template>
  <div class="com-page">
    <div class="com-container" @dblclick="revertMap">
      <div class="com-chart" ref="mapRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  watch,
  defineExpose,
} from 'vue';
import { useStore } from '@/store/index';
import axios from 'axios';
import { UserData } from '@/types/charts';
import { getProvinceMapInfo } from '@/utils/mapUtil';

const store = useStore();
const mapRef = ref<HTMLDivElement>();
// echart实例
let chartInstance = null as unknown as $echarts.ECharts;
const content = reactive({
  allData: [] as UserData[],
  titleFontSize: 0,
  mapCache: new Map<string, any>(), //缓存以获取的地图数据
});
const props = defineProps({
  socketInstance: SocketService,
  themebg: String,
});
defineExpose({
  screenAdapter: () => screenAdapter(),
});

onMounted(async () => {
  await props.socketInstance?.registerCallback('mapData', queryData);
  await initChart();
  // 项服务端发送请求参数
  await props.socketInstance?.send({
    action: 'getData', //操作为获取数据
    socketType: 'mapData', //数据为seller数据
    chartName: 'map',
    value: '',
  });
  window.addEventListener('resize', screenAdapter);
  screenAdapter();
});

onUnmounted(() => {
  props.socketInstance?.removeCallback('mapData');
  window.removeEventListener('resize', screenAdapter);
});
const theme = computed(() => {
  return store.theme;
});

/**
 * @name 监听主题变化重新渲染
 */
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
 * @name 初始化地图矢量数据
 * */
const initChart = async () => {
  chartInstance = $echarts.init(mapRef.value as HTMLDivElement, theme.value);
  // 地图矢量数据存放于 static/map/chartInstance.json
  const { data } = await axios.get('http://localhost:8080/static/map/china.json');
  $echarts.registerMap('china', data);
  const option: EChartsOption = {
    title: {
      text: '◐ 北极星商家分布',
      left: 20,
      top: 20,
    },
    geo: {
      type: 'map',
      map: 'china',
      top: '5%',
      bottom: '5%',
      itemStyle: {
        // 每个省份的颜色
        areaColor: '#2e72bf',
        borderColor: '#333333',
      },
    },
    legend: {
      left: '5%',
      bottom: '5%',
      orient: 'vertical', //垂直排列
    },
  };
  chartInstance.setOption(option);
  // 单击省份获取数据
  chartInstance.on('click', (arg) => {
    // arg.name 得到点击的省份名称是中文的，json存储的是英文，需要转译
    const privinceInfo = getProvinceMapInfo(arg.name);
    // 解决双击时触发的报错
    if (!privinceInfo.key) return;
    // 判断缓存中是否存在
    const mapData = content.mapCache.get(privinceInfo.key);
    if (mapData) {
      registerMap(privinceInfo.key, mapData);
    } else {
      axios.get('http://localhost:8080' + privinceInfo.path).then(({ data }) => {
        // 缓存中存一份
        content.mapCache.set(privinceInfo.key, data);
        registerMap(privinceInfo.key, data);
      });
    }
  });
};

/**
 * @name 设置省份数据
 * */
const registerMap = (key: string, data: any) => {
  $echarts.registerMap(key, data);
  const changeOption = {
    geo: {
      map: key,
    },
  };
  chartInstance.setOption(changeOption);
};

/**
 * @name 返回地图
 * */
const revertMap = () => {
  const option = {
    geo: {
      map: 'china',
    },
  };
  chartInstance.setOption(option);
};

/**
 * @name 查询数据
 */
const queryData = (data: UserData[]) => {
  content.allData.push(...data);
  updateChart();
};
/**
 * @name 图表大小根据屏幕适配
 * @desc 监听图表容器的宽度
 */
const screenAdapter = () => {
  content.titleFontSize = ((mapRef.value?.offsetWidth as number) / 100) * 3.6;
  const adapterOption: EChartsOption = {
    title: {
      textStyle: {
        fontSize: content.titleFontSize,
      },
    },
    legend: {
      itemWidth: Math.ceil(content.titleFontSize / 2),
      itemHeight: Math.ceil(content.titleFontSize / 2),
      itemGap: Math.ceil(content.titleFontSize / 2),
      textStyle: {
        fontSize: Math.ceil(content.titleFontSize / 2),
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
  // 图例数据
  const legendArr = content.allData?.map((item) => item.name);
  // 每个name对应的children为该用户的散点
  // 在地图中展示散点数据，需要给散点地图添加配置 coordinateSystem:geo
  const seriesArr = content.allData.map((item) => {
    return {
      type: 'effectScatter',
      name: item.name,
      data: item.children,
      coordinateSystem: 'geo',
      rippleEffect: {
        //涟漪效果
        scale: 5,
        brushType: 'stroke', //空心涟漪效果
      },
    };
  });
  const dataOption = {
    legend: {
      data: legendArr,
    },
    series: seriesArr,
  };
  chartInstance.setOption(dataOption);
};
</script>

<style scoped lang="scss">
@import '../common/css/chart.scss';
</style>
