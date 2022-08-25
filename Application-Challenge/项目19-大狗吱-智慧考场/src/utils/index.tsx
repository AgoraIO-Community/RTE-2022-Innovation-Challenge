import lodash from 'lodash';
import appConfg from '../../app.json';
import URLParse from 'url-parse';
import EventEmitter from 'events';
import axios from 'axios';
export function FonHen_JieMa(u: string) {
  var tArr = u.split('*');
  var str = '';
  for (var i = 1, n = tArr.length; i < n; i++) {
    // @ts-ignore
    str += String.fromCharCode(tArr[i]);
  }
  return str;
}

export function getToken() {
  return localStorage.getItem('AUTH_TOKEN');
}
export const adnormalFun = lodash.debounce((cb: Function) => {
  cb && typeof cb === 'function' && cb();
}, 1000);

export enum UserRole {
  '考生' = 10,
  '第二机位' = 11,
  '考生屏幕分享' = 12,
  '主考官' = 20,
  '主考官屏幕分享' = 22,
  '副考官' = 30,
  '副考官屏幕分享' = 32,
  '监考官' = 40,
  '监考官屏幕分享' = 42,
  '候考官' = 60,
  '候考官屏幕分享' = 62,
  '创建者' = 90,
}

export enum Layout_enum {
  'Layout4' = 4,
  'Layout8' = 8,
}

export function getUsersGroup(users: any[]): any[] {
  const listObj: any = {};
  const _list: any[] = [];
  users
    // @ts-ignore
    .filter((i) => {
      /**
       * 判断是否是考生角色
       */
      const isUser =
        `${i.role}`.startsWith(`${UserRole.考生}`) ||
        `${i.role}`.startsWith(`${UserRole.第二机位}`);
      return isUser;
    })
    .forEach((item) => {
      const uid = item.id;
      if (
        `${uid}`.startsWith(`${UserRole.考生}`) ||
        `${uid}`.startsWith(`${UserRole.第二机位}`)
      ) {
        const realUserId = `${item.id}`.substring(2);
        const listObjItem = listObj[`${realUserId}`] || {};
        const firstInfo = `${uid}`.startsWith(`${UserRole.考生}`)
          ? item
          : listObjItem[`${UserRole.考生}`] || {};
        const secondInfo = `${uid}`.startsWith(`${UserRole.第二机位}`)
          ? item
          : listObjItem[`${UserRole.第二机位}`] || {};
        listObj[`${realUserId}`] = {
          ...listObjItem,
          [uid]: uid,
          realUserId: realUserId,
          [UserRole.考生]: {
            ...firstInfo,
          },
          [UserRole.第二机位]: {
            ...secondInfo,
          },
          userInfo: {
            ...firstInfo,
          },
        };
      }
    });
  users.forEach((item) => {
    const realUserId = `${item.id}`.substring(2);
    if (item.id && listObj[realUserId]) {
      _list.push(lodash.cloneDeep(listObj[realUserId]));
      delete listObj[realUserId];
    }
  });
  return _list;
}

/**
 * 倒计时 获取最新服务器时间与本地时间差
 */
export class ServerTimeManager {
  /**
   * 时间差 毫秒
   */
  dateDiff = 0;
  ee: EventEmitter;
  evetName = 'TIME';
  timer = { id: -1 };
  /**
   * @param time 服务端时间
   */
  constructor(time?: number) {
    this.ee = new EventEmitter();
    this.ee.emit(this.evetName);
    time && this.set(time);
    this.animeLoop();
  }
  animeLoop = () => {
    this.ee.emit(this.evetName, this.get());
    this.timer.id = requestAnimationFrame(this.animeLoop);
    return this.timer;
  };
  clearAnimationFrame = () => {
    if (this.timer.id != -1) {
      cancelAnimationFrame(this.timer.id);
    }
  };
  /**
   * 获取当前时间
   * @returns 返回毫秒数字
   */
  get(): number {
    const serverTime = +Date.now() - this.dateDiff;
    return serverTime;
  }
  /**
   * 设置服务端时间
   * @param serverTime 服务器时间
   * @returns
   */
  set(serverTime: number): number {
    const localTime = +Date.now();
    const dateDiff = localTime - serverTime;
    /**
     * 容差 3秒 大于3秒 添加dateDiff
     */
    this.dateDiff = Math.abs(dateDiff) >= 3000 ? dateDiff : 0;
    // console.log('serverTime', serverTime, localTime, this.dateDiff, this.get());
    return this.get();
  }
  /**
   * 监听时间回调
   * @param cb 回调方法
   */
  on(cb: (time: number) => void) {
    this.ee.on(this.evetName, cb);
  }
  /**
   * 取消监听时间回调
   * @param cb 回调方法
   */
  off(cb: (time: number) => void) {
    this.ee.off(this.evetName, cb);
  }
}

export const serverTime = (window.__GLOBAL_SERVER_TIME__ =
  new ServerTimeManager());

export class UserAuthTokenManager {
  static key = `${appConfg.name}__User_Auth_Token__`;
  static getToken(): string | null {
    const st = sessionStorage.getItem(this.key);
    if (!st) return null;
    return st;
  }
  static setToken(data: string): string | null {
    if (data) {
      sessionStorage.setItem(this.key, `${data}`);
    } else {
      sessionStorage.removeItem(this.key);
    }
    return sessionStorage.getItem(this.key);
  }
}
/**
 * 清除缓存刷新
 * @param url
 */
export async function reloadClearCache(url?: string) {
  const urlObj = URLParse(url || window.location.href, true);
  console.log(urlObj, urlObj.toString());
  urlObj.set('query', {
    ...urlObj?.query,
    __RELOAD_TIME__: new Date().getTime(),
  });
  const newUrl = urlObj.toString();
  if (window.caches) {
    try {
      const keys = await caches.keys();
      for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        await caches.delete(element);
      }
    } catch (error) {}
  }
  window.location.href = newUrl;
}

export class ErrTip {
  tipDom?: HTMLDivElement;
  constructor() {}
  showTip() {
    this.tipDom = document.createElement('div');
    this.tipDom.className = '__ErrTipWrap__';
    this.tipDom.innerHTML = `
      <span class="_ErrTipSpan_ _ErrTipSpan_1_"></span><span class="_ErrTipSpan_ _ErrTipSpan_2_"></span><span class="_ErrTipSpan_ _ErrTipSpan_3_"></span><span class="_ErrTipSpan_ _ErrTipSpan_4_"></span>  
      <style>
      .__ErrTipWrap__{
        user-select: none;
      }
      ._ErrTipSpan_ {
        position: fixed;
        z-index: 999999999;
        width: 0;
        height: 0;
        animation:showMove 1s infinite linear;
      }
      ._ErrTipSpan_._ErrTipSpan_1_ {
        top: 0;
        left: 0;
        right: 0;
        height: 30px;
        width: 100%;
        background-image: linear-gradient(to bottom,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_2_ {
        top: 0;
        right: 0;
        width: 30px;
        height: 100vh;
        background-image: linear-gradient(to left,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_3_ {
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        width: 100%;
        background-image: linear-gradient(to top,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      ._ErrTipSpan_._ErrTipSpan_4_ {
        top: 0;
        left: 0;
        width: 30px;
        height: 100vh;
        background-image: linear-gradient(to right,rgba(255,0,0,1), rgba(255,255,255,0));
      }
      @keyframes showMove
      {
        0%{
          opacity: 0;
        }
        50%{
          opacity: 1;
        }
        100%{
          opacity: 0;
        }
      }
      </style>
    `;
    document.getElementsByTagName('body')[0].appendChild(this.tipDom);
  }
  hideTip() {
    if (this.tipDom) {
      this.tipDom?.remove();
      this.tipDom = undefined;
    }
  }
  on() {}
  off() {}
}
