/* eslint-disable @typescript-eslint/ban-types */
interface CbMapping {
  [key: string]: Function;
}
interface PostParams {
  action: string;
  socketType: string;
  value: string | boolean;
  chartName?: string;
}

export default class SocketService {
  // 单例模式
  static instance = null as any;
  static get Instance(): SocketService {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }
  ws = null as unknown as WebSocket;
  callBackMapping = <CbMapping>{};
  hasConnected = false; //标识是否连接成功
  sendRetryTimes = 0; //记录失败次数
  connectRetryTimes = 0;
  baseUrl = 'ws://localhost:9000';

  // 定义连接服务器方法
  connect() {
    if (!window.WebSocket) {
      window.alert('您的浏览器不支持websocket！');
    }
    this.ws = new window.WebSocket(this.baseUrl);
    this.ws.onopen = () => {
      console.log('连接成功。。。');
      this.hasConnected = true;
      this.connectRetryTimes = 0;
    };
    this.ws.onclose = () => {
      console.log('connected fail');
      this.hasConnected = false;
      this.connectRetryTimes++;
      window.setTimeout(() => {
        this.connect();
      }, 500 * this.connectRetryTimes);
    };
    this.ws.onmessage = (msg: MessageEvent) => {
      const data = JSON.parse(msg.data);
      const socketType = data.socketType;
      if (this.callBackMapping[socketType]) {
        const action = data.action;
        // this.executeCb(action, data, this);
        if (action === 'getData') {
          const chartData = JSON.parse(data.data);
          this.callBackMapping[socketType].call(this, chartData);
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, data);
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType].call(this, data);
        }
      }
    };
  }

  registerCallback(socketType: string, callback: Function) {
    this.callBackMapping[socketType] = callback;
  }

  removeCallback(socketType: string) {
    this.callBackMapping[socketType] = null as any;
  }

  send(params: PostParams) {
    // 判断是否可以发送，失败重传
    if (this.hasConnected) {
      this.ws.send(JSON.stringify(params));
      this.sendRetryTimes = 0;
    } else {
      this.sendRetryTimes++;
      window.setTimeout(() => {
        this.send(params);
      }, 500 * this.sendRetryTimes);
    }
  }

  /**
   * @name 执行action对应的方法
   */
  private executeCb(action: string, data: any, _this: SocketService) {
    if (action === 'getData') {
      data = JSON.parse(data.data);
    }
    const obj: CbMapping = {
      getData: () => _this.callBackMapping[action].call(_this, data),
      fullScreen: () => _this.callBackMapping[action].call(_this, data),
      themeChange: () => _this.callBackMapping[action].call(_this, data),
    };
    return obj[action];
  }
}
