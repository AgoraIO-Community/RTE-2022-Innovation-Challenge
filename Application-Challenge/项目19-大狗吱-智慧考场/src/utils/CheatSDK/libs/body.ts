import FingerprintJS from '@fingerprintjs/fingerprintjs';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { EventNames } from '..';

dayjs.extend(advancedFormat)

/**
 * 获取当前浏览器唯一id
 * @returns
 */
export async function getBrowserUUID(): Promise<string> {
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();

  // This is the visitor identifier:
  const visitorId = result.visitorId;
  console.log('============================');
  console.log('');
  console.log('浏览器唯一 id: ', visitorId);
  console.log('');
  console.log('============================');

  return visitorId;
}
let __DEVICEID__: string;
export type MSG = {
  deviceid: string;
  platform: string;
  time: Date | string | number;
  eventname: EventNames;
  screenshots: string[];
  note?: string;
}
export const createMsg = async (eventName: EventNames): Promise<MSG> => {
  if (!__DEVICEID__) {
    __DEVICEID__ = await getBrowserUUID();
  }
  return {
    deviceid: __DEVICEID__,
    platform: 'web',
    time: dayjs().format('X'),
    eventname: eventName,
    screenshots: [],
    note: '',
  }
}