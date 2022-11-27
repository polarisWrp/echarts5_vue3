# echarts-demo

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 日期格式化 dayjs
- yarn add dayjs
- 用于与moment类似

## vue3使用调用echarts实例resize方法报错问题
- 根据官方issue, 定义echarts实例的属性应当是普通属性或是shollowRef

## 自定义主题样式
- 官网下载主题后下载为json格式
- 将下载文件json内容放在 静态资源目录下通过 export xx = {} 方式导出
- 组件引入json对象， import xxx from 'xxxx/index.ts'
- echarts实例方法注册使用 $echarts.registerTheme('sunny', sunny);

## 关于柱状图的颜色渐变设置

// 渐变颜色： 1.指定颜色渐变方向 2.指定不同百分比时的颜色
```js
- $echarts.graphic.LinearGradient()(x1,y1,x2,y2, [])
- x1,y1; x2,y2表示两个点，确定一条直线
- [] 接收四个数组，值为0或1；类比为一个矩形四个顶点（上右下左）依次为, (0,0) (1,0)(0,1)(1,1)
```

## 折线图凌乱的处理方式
- 通过堆叠图的方式展示
- 在折线图的配置中 series 属性值为一个数组，实现堆叠图的话需要每项stack的值保持一致，这里使用 map 属性
```js
const dataOption: EChartsOption = {
  xAxis: {
    data: timeArr,
  },
  legend: {
    data: legendArr,
  },
  series: [{name: 'kk', stack: 'map'}, {name: 'pp', stack: 'map'}],
};
```

### 折线样式优化
- 可以在自定义主题时配置， 在line对象中新增 smooth属性
```json
{
  "line": {
    // "itemStyle": .....
    "smooth": true
  }
}
```

## 地图散点展示前提
- 每个name对应的children为该用户的散点
- 在地图中展示散点数据，需要给散点地图每一项添加配置 coordinateSystem:geo
```js
 const seriesArr = content.allData.map((item) => {
    return {
      type: 'effectScatter',
      name: item.name,
      data: item.children,
      coordinateSystem: 'geo',
    };
  });
  const dataOption = {
    series: seriesArr,
  };
```

## 抽离公共样式
- 将图表组件公共样式存放在common下的 chart.scss 文件中
- 组件中使用通过 import导入
```html
<style scoped lang="scss">
@import '../common/chart.scss';
</style>
```

## 全局echarts常用方法
- init 【初始化echarts实例，第二个参数使用主题】
- registerTheme 【用于注册自定义主题】
- registerMap 【注册地图图表】
- connect 【一个页面可以有多个图表，此方法用于关联多个图表】
  以下栗子为使用connect方法后，点击下载图片按钮会下载chart1和chart2的组合图片
```js
const option = {
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  }
}

const echarts = echarts.init('dom')
echarts.setOption(option)
echarts.connect([chart1, chart2])
```

## echarts实例的常用方法
- setOption
  该方法可以被调用多次，并且会**合并**新旧配置
- resize
  重新计算和绘制图表
```js
window.onresize = function() {
  echartsInstance.resize()
}
```
- on/off
  1. 用于绑定或者解绑事件处理函数
  2. 鼠标事件【click, dblick, mouseover, mouseout】
```js
// 回调函数接收事件参数
echartsInstance.on('click', function(e) {
  console.log(e)
})
```
  3. echarts事件【legendselectchanged,datazoom】
    图例发生改变等
```js
const pieData = [{value: 11, name: 'kk'}, {value: 55, name: 'pp'}]
const option = {
  legend: {
    data: ['kk', 'pp']
  },
  series: [{
    type: 'pie',
    data: pieData
  }]
}
echartsInstance.setOption(option)
// 图例变化输出值
echartsInstance.on('legendselectchanged', function(e) {
  console.log(e)
})
echartsInstance.off('legendselectchanged')
```
  4. dispatchAction方法
    触发某些行为，使用代码模拟用户的一些行为
```js
<button id='btn'>点击按钮</button>

// 点击按钮后图表高亮
const btn = document.getElementById('#btn')
btn.onclick = function() {
  // 模拟用户行为
  echartsInstance.dispatchAction({
    type: 'highlight',//事件类型【图表高亮】
    seriesIndex: 0, //图表索引，指向 series数组下标对应值
    dataIndex: 1 //图表那一项高亮，指向data数组下标对应值
  })
  echartsInstance.dispatchAction({
    type: 'showTip',//事件类型 【鼠标移入时提示框】
    seriesIndex: 0, //图表索引，指向 series数组下标对应值
    dataIndex: 1 //图表那一项高亮，指向data数组下标对应值
  })
}

```
  5. clear 清空图表实例， dispose销毁实例
    clear 清除之后可以再次调用 setOption设置数据
    dispose 销毁之后无法设置数据

```js
echartsInstance.clear()
echartsInstance.dispose()
```
