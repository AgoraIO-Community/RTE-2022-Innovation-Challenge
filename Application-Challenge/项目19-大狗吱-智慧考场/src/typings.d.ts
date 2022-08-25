// import { ServerTimeManager } from "./utils";
/// <reference path="../node_modules/@hongtangyun/rooms-sdk/dist/index.d.ts" />

declare module 'slash2';
declare module '*.json';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module '*.mp3';

// google analytics interface
interface GAFieldsObject {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
}

interface Window {
  ga: (
    command: 'send',
    hitType: 'event' | 'pageview',
    fieldsObject: GAFieldsObject | string,
  ) => void;
  reloadAuthorized: () => void;
  setTime: any;
  io: any;
  /**
   * 全局实列化room sdk
   */
  __room_sdk__: any;
  /**
   * 全局时间
   */
  __GLOBAL_SERVER_TIME__: {
    /**
     * 获取当前时间
     * @returns 返回毫秒数字
     */
    get: () => number;
    /**
     * 设置服务端时间
     * @param serverTime 服务器时间 毫秒数字
     * @returns
     */
    set: (serverTime: number) => number;
    /**
     * 监听时间回调
     * @param cb 回调方法 毫秒数字
     */
    on: (cb: (time: number) => void) => void;
    /**
     * 取消监听时间回调
     * @param cb 回调方法 毫秒数字
     */
    off: (cb: (time: number) => void) => void;
  };
}

declare let ga: Function;

/**
 * antd 统一样式前缀。
 */
declare const __prefixCls__: string;

/**
 * app 环境
 */
declare const REACT_APP_ENV: 'dev' | 'qa' | 'master';

/**
 * app 版本号
 */
declare const APP_VERSION: string;

/**
 * app 打包时间
 */
declare const APP_BUILD_TIME: number;
/**
 * 默认域名
 */
declare const baseUrl: string;
declare const mqttUrl: string;
declare const socketUrl: string;

/**
 * 全局时间
 */
declare const __GLOBAL_SERVER_TIME__: {
  /**
   * 获取当前时间
   * @returns 返回毫秒数字
   */
  get: () => number;
  /**
   * 设置服务端时间
   * @param serverTime 服务器时间 毫秒数字
   * @returns
   */
  set: (serverTime: number) => number;
  /**
   * 监听时间回调
   * @param cb 回调方法 毫秒数字
   */
  on: (cb: (time: number) => void) => void;
  /**
   * 取消监听时间回调
   * @param cb 回调方法 毫秒数字
   */
  off: (cb: (time: number) => void) => void;
};

declare interface RoomInfo {
  rtcType: 'agoral' | 'tencent';
  token: string;
  appid: string;
  uid: number;
  channel: string;
}


declare enum Role {
  '考生' = 6,
  '考官' = 7,
}
