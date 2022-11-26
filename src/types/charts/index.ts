export type Item = {
  name: string;
  value: number;
  children?: Item[];
};
export type TypeItem = {
  key: string;
  text: string;
};
export type MsItem = {
  name: string;
  data: string[];
};
export type MsCommon = {
  base: number;
  data: MsItem[];
  title: string;
  unit: string;
};
export type Common = {
  month: string[];
};

export type TrendData = {
  commodity: MsCommon;
  common: Common;
  map: MsCommon;
  seller: MsCommon;
  type: TypeItem[];
};
export type User = {
  name: string;
  value: number[];
};
export type UserData = {
  children: User;
  name: string;
};
export type RankData = {
  name: string;
  value: number;
};
export type HotData = {
  name: string;
  children?: Item[];
};
export type StockData = {
  name: string;
  sales: number;
  stock: number;
};
export type TypeKey = 'map' | 'commodity' | 'seller';

export type CurType = Record<TypeKey, MsCommon>;

export type ScreenStatus = {
  [key: string]: boolean;
};
export type AdapterList = {
  [key: string]: () => void;
};
