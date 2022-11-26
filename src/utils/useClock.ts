const formateTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const result =
    addZero(year) +
    '/' +
    addZero(month) +
    '/' +
    addZero(day) +
    ' ' +
    addZero(hours) +
    ':' +
    addZero(minutes) +
    ':' +
    addZero(seconds);
  return result;
};

// 小于两位前面补零
const addZero = (val: number) => {
  const res = val > 9 ? val : '0' + val;
  return String(res);
};

let timer = null as any;

export const useClock = () => {
  if (timer) closeClock();
  // let res = '';
  timer = setInterval(() => {
    return new Promise((reslove) => {
      const curTime = formateTime();
      reslove(curTime);
    });
    // res = formateTime();
  }, 1000);
  // return res;
};

export const closeClock = () => {
  clearInterval(timer);
};
