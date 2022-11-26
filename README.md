# echarts-demo

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
