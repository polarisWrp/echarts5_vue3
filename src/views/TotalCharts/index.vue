<template>
  <div class="home" :style="homeStyle">
    <header class="home-header">
      <div class="header-bg">
        <img :src="themeStyle.headerBorder" alt="" />
      </div>
      <span class="logo">
        <img :src="themeStyle.logo" alt="" />
      </span>
      <span class="title">北极星实时监控系统</span>
      <div class="title-right">
        <img :src="themeStyle.skinIcon" @click="changeTheme" />
        <span class="datetime">{{ curTime }}</span>
      </div>
    </header>
    <div class="home-body">
      <section class="home-left">
        <div id="left-top" :class="{ fullscreen: fullScreenStatus.trend }">
          <!-- 销量趋势图表 -->
          <TrendChart :socketInstance="socketInstance" ref="trendChartRef" />
          <div class="resize" @click="changeSize('trend')">
            <span :class="getScreenStatus('trend')"></span>
          </div>
        </div>
        <div id="left-bottom" :class="{ fullscreen: fullScreenStatus.seller }">
          <!-- 商家销售金额图表 -->
          <SellerChart :socketInstance="socketInstance" ref="sellerRef" />
          <div class="resize" @click="changeSize('seller')">
            <span :class="getScreenStatus('seller')"></span>
          </div>
        </div>
      </section>
      <section class="home-middle">
        <div id="middle-top" :class="{ fullscreen: fullScreenStatus.map }">
          <!-- 商家分布图表 -->
          <ChinaMapChart :socketInstance="socketInstance" ref="chinaMapRef" />
          <div class="resize" @click="changeSize('map')">
            <span :class="getScreenStatus('map')"></span>
          </div>
        </div>
        <div id="middle-bottom" :class="{ fullscreen: fullScreenStatus.rank }">
          <!-- 地区销量排行 -->
          <RankChart :socketInstance="socketInstance" ref="rankRef" />
          <div class="resize" @click="changeSize('rank')">
            <span :class="getScreenStatus('rank')"></span>
          </div>
        </div>
      </section>
      <section class="home-right">
        <div id="right-top" :class="{ fullScreen: fullScreenStatus.hot }">
          <!-- 热销商品占比情况 -->
          <HotChart :socketInstance="socketInstance" ref="hotRef" />
          <div class="resize" @click="changeSize('hot')">
            <span :class="getScreenStatus('hot')"></span>
          </div>
        </div>
        <div id="right-bottom" :class="{ fullScreen: fullScreenStatus.stock }">
          <!-- 库存销量分析图表 -->
          <StockChart :socketInstance="socketInstance" ref="stockRef" />
          <div class="resize" @click="changeSize('stock')">
            <span :class="getScreenStatus('stock')"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getThemeConfig } from '@/utils/themeUtils';
import dayjs from 'dayjs';
import { useStore } from '@/store/index';
import SocketService from '@/utils/useWebSocket';
import {
  onMounted,
  onUnmounted,
  ref,
  computed,
  nextTick,
  reactive,
  defineAsyncComponent,
} from 'vue';
import { FullScreen } from '@/types/socket';
import { AdapterList, ScreenStatus } from '@/types/charts';
import ErrorComponent from '@/views/TotalCharts/common/components/ErrorComponent.vue';

// 异步组件加载
const SellerChart = defineAsyncComponent(
  () => import('@/views/TotalCharts/components/SellerChart.vue'),
);
const TrendChart = defineAsyncComponent(
  () => import('@/views/TotalCharts/components/TrendChart.vue'),
);
const ChinaMapChart = defineAsyncComponent({
  loader: () => import('@/views/TotalCharts/components/ChinaMapChart.vue'),
  delay: 250,
  errorComponent: ErrorComponent,
});
const StockChart = defineAsyncComponent(
  () => import('@/views/TotalCharts/components/StockChart.vue'),
);
const RankChart = defineAsyncComponent(
  () => import('@/views/TotalCharts/components/RankChart.vue'),
);
const HotChart = defineAsyncComponent(() => import('@/views/TotalCharts/components/HotChart.vue'));

// websocket连接
SocketService.Instance.connect();
const socketInstance = SocketService.Instance;

const store = useStore();
// 组件实例
const trendChartRef = ref<InstanceType<typeof TrendChart>>();
const sellerRef = ref<InstanceType<typeof SellerChart>>();
const chinaMapRef = ref<InstanceType<typeof ChinaMapChart>>();
const rankRef = ref<InstanceType<typeof RankChart>>();
const hotRef = ref<InstanceType<typeof HotChart>>();
const stockRef = ref<InstanceType<typeof StockChart>>();

const theme = computed(() => {
  return store.theme;
});
const themeStyle = computed(() => {
  return getThemeConfig(theme);
});
const homeStyle = computed(() => {
  return {
    background: themeStyle.value.backgroundColor,
    color: themeStyle.value.titleColor,
  };
});

// 动态时间
let timer = null as any;
let curTime = ref<string>('');

onMounted(() => {
  socketInstance.registerCallback('fullScreen', fullScreen);
  socketInstance.registerCallback('themeChange', themeChange);
  startClockInterval();
});
onUnmounted(() => {
  socketInstance.removeCallback('fullScreen');
  socketInstance.removeCallback('themeChange');
  closeClockInterval();
});

const startClockInterval = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    curTime.value = dayjs(Date.now()).format('YYYY/MM/DD hh:mm:ss');
  }, 1000);
};
const closeClockInterval = () => {
  clearInterval(timer);
};
const fullScreenStatus: ScreenStatus = reactive({
  trend: false,
  seller: false,
  map: false,
  rank: false,
  hot: false,
  stock: false,
});

const chartAdapterList: AdapterList = {
  trend: () => trendChartRef.value?.screenAdapter(),
  seller: () => sellerRef.value?.screenAdapter(),
  map: () => chinaMapRef.value?.screenAdapter(),
  rank: () => rankRef.value?.screenAdapter(),
  hot: () => hotRef.value?.screenAdapter(),
  stock: () => stockRef.value?.screenAdapter(),
};

// 放大，缩小图表切换
const getScreenStatus = (val: string) => {
  return fullScreenStatus[val] ? 'iconfont icon-compress-alt' : 'iconfont icon-expand-alt';
};

/**
 * @desc 接收服务端返回的消息,对指定图表切换状态
 * */
const fullScreen = (data: FullScreen) => {
  const chartName = data.chartName;
  const target = data.value;
  fullScreenStatus[chartName] = target;
  // 等待dom更新完成执行回调
  nextTick(() => {
    chartAdapterList[chartName]();
  });
};
/**
 * @desc 切换全屏、缩小
 * */
const changeSize = (chartName: string) => {
  const chartStatus = !fullScreenStatus[chartName];
  // 将全屏、缩小消息发送至服务端
  socketInstance.send({
    action: 'fullScreen',
    socketType: 'fullScreen',
    chartName: chartName,
    value: chartStatus,
  });
};
const changeTheme = () => {
  socketInstance.send({
    action: 'themeChange',
    socketType: 'themeChange',
    chartName: '',
    value: theme.value,
  });
};
// 多段主题切换事情
const themeChange = () => {
  store.changeTheme();
};
</script>
<style lang="scss" scoped>
.fullscreen {
  position: fixed !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 auto !important;
  z-index: 100 !important;
  background-color: #fff !important;
}

.home {
  width: 100%;
  height: 100%;
  padding: 0 25px;
  box-sizing: border-box;
  // color: red;

  .home-header {
    position: relative;
    height: 64px;
    font-size: 20px;
    .header-bg {
      img {
        width: 100%;
        // background-color: aqua;
      }
    }
    .logo {
      position: absolute;
      left: 0;
      top: 0;
      img {
        height: 35px;
        width: 128px;
      }
    }
    .title {
      position: absolute;
      top: 16px;
      left: 50%;
      font-size: 24px;
      transform: translateX(-50%);
    }
    .title-right {
      position: absolute;
      right: 0;
      top: 10px;
      img {
        width: 28px;
        height: 21px;
        cursor: pointer;
        vertical-align: middle;
      }
      .datetime {
        margin-left: 10px;
        font-size: 15px;
      }
    }
  }
  .home-body {
    width: 100%;
    height: 100%;
    margin-top: 10px;
    // background-color: antiquewhite;
    .home-left {
      box-sizing: border-box;
      display: inline-block;
      width: 27.6%;
      height: 100%;
      #left-top {
        position: relative;
        height: 53%;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
      #left-bottom {
        position: relative;
        height: 31%;
        margin-top: 25px;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
    }
    .home-middle {
      display: inline-block;
      width: 41.5%;
      margin: 0 1.6%;
      height: 100%;
      #middle-top {
        position: relative;
        height: 56%;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
      #middle-bottom {
        position: relative;
        height: 28%;
        margin-top: 25px;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
    }
    .home-right {
      display: inline-block;
      width: 27.6%;
      height: 100%;
      z-index: 99;
      // background-color: aquamarine;
      // border: 2px solid red;
      #right-top {
        position: relative;
        height: 46%;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
      #right-bottom {
        position: relative;
        height: 38%;
        margin-top: 25px;
        .resize {
          position: absolute;
          right: 15px;
          top: 15px;
          &:hover {
            cursor: pointer;
            color: rgb(33, 81, 203);
          }
        }
      }
    }
  }
}
</style>
