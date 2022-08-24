import { ConfigProvider } from 'antd';
import appInfo from '../app.json';
import { globalFun } from './components/GlobalLoading';
import styles from './global.less';
import cheat from './utils/CheatSDK';

console.log(cheat);

// fix styles not wrok
console.log(styles);

ConfigProvider.config({
  prefixCls: appInfo.name,
});

globalFun.showLoading('loading');

export const qiankun = {
  // 应用加载之前
  async bootstrap(props: any) {
    console.log(`app[${appInfo.name}] bootstrap`, props);
  },
  // 应用 render 之前触发
  async mount(props: any) {
    console.log(`app[${appInfo.name}] mount`, props);
    console.log(JSON.stringify(props.roomInfo));
  },
  // 应用卸载之后触发
  async unmount(props: any) {
    console.log(`app[${appInfo.name}] unmount`, props);
  },
};

export async function render(oldRender: () => void) {
  try {
  } catch (err) {
    console.log(err);
  } finally {
    oldRender();
  }
}
