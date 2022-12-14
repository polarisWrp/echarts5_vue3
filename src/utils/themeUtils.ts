import { ComputedRef } from 'vue';

export type SkinOption = {
  backgroundColor: string;
  titleColor: string;
  headerBorder: string;
  logo: string;
  skinIcon: string;
};
type Option = {
  [key: string]: SkinOption;
};

// 换肤
const dark = {
  backgroundColor: '#161522', // 头部背景
  titleColor: '#fff', // 标题文字颜色
  headerBorder: '/static/img/header_border_dark.png', // 页面背景头部边框
  logo: '/static/img/logo_dark.png', // 左上角图片
  skinIcon: '/static/img/qiehuan_dark.png', // 换肤图片
};

const light = {
  backgroundColor: '#eee',
  titleColor: '#000',
  headerBorder: '/static/img/header_border_light.png',
  logo: '/static/img/logo_light.png',
  skinIcon: '/static/img/qiehuan_light.png',
};

const map: Option = {
  dark,
  light,
};

export function getThemeConfig(themeName: ComputedRef<string>): SkinOption {
  return map[themeName.value];
}
