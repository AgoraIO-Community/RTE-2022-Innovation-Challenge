import OSS from 'ali-oss';
import { message } from 'antd';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import COS from 'cos-js-sdk-v5';
import lodash from 'lodash';
import {
  RcFile as OriRcFile,
  UploadRequestOption as RcCustomRequestOptions,
  UploadProgressEvent,
} from 'rc-upload/lib/interface';
import {
  HTML_DATA_TYPE,
  QuestionsEnum,
  SubItem,
} from '../components/htmlPaper';
import { UP_CONFIG } from '../components/Editor/libs/upFiles';

export function shuffleHtmlData(data: HTML_DATA_TYPE) {
  const newData = lodash.cloneDeep(data);
  function shuffle(subs: SubItem[]) {
    let newSubs = subs;
    if (newData.questionOrder === 2) {
      newSubs = lodash.shuffle(subs);
    }
    return newSubs?.map((item) => {
      const newItem = lodash.cloneDeep(item);
      if (newItem.options && newItem.options.length) {
        if (newData.optionOrder === 2) {
          newItem.options = lodash.shuffle(newItem.options);
        }
      }
      if (newItem.subs && newItem.subs.length) {
        if (newData.questionOrder === 2) {
          newItem.subs = lodash.shuffle(newItem.subs);
        }
        newItem.subs = shuffle(newItem.subs);
      }
      return newItem;
    });
  }
  let newList: any[] = [];
  if (newData?.list && newData?.list.length) {
    newList = newData.list.map((item) => {
      item.subs = shuffle(item.subs);
      return item;
    });
  }
  lodash.set(newData, `list`, newList);
  return newData;
}

export async function cosHandleUpload(
  options: RcCustomRequestOptions,
  upConfig: UP_CONFIG,
) {
  const { onSuccess, onError, file, onProgress } = options;
  let data: any;
  if (upConfig.type === 'COS') {
    data = upConfig.cosCof;
  }
  if (upConfig.type === 'OSS') {
    data = upConfig.ossCof;
  }
  // @ts-ignore
  const fileName = file?.name;
  if (!data) {
    throw new Error('无上传配置');
  }
  if (data) {
    const prefix = `${data?.prefix}`;
    const filePath = `${prefix}${fileName ? fileName : file}`;
    var cos = new COS({
      getAuthorization: (options, callback) => {
        callback({
          TmpSecretId: data.tmpSecretId,
          TmpSecretKey: data?.tmpSecretKey,
          XCosSecurityToken: data?.sessionToken,
          StartTime: data?.startTime,
          ExpiredTime: data?.expiredTime,
          SecurityToken: data?.sessionToken,
        });
      },
    });
    cos.putObject(
      {
        StorageClass: 'STANDARD',
        Bucket: data?.bucket || 'examination-1259785003', // 存储桶名称
        Region: data?.region || 'ap-shanghai', // 地区
        Key: filePath, // 图片名称
        Body: file, // 上传文件对象
        onProgress: (progressData: { percent: number }) => {
          const progressInfo: any = {
            percent: progressData.percent * 100,
          };
          onProgress && onProgress(progressInfo);
          console.log('上传中', JSON.stringify(progressData));
        },
      },
      (err: any, data: { Location: string }) => {
        console.log('999', err, data);
        if (err) {
          message.error(`文件上传失败,请重新上传(${err})`);
          onError && onError(new Error(`${err}`));
        } else {
          let fileUrl = 'https://' + data.Location;
          console.log(data, '成功');
          onSuccess && onSuccess(fileUrl, cos as any);
          message.success(`文件${fileName ? ` [ ${fileName} ] ` : ''}上传成功`);
        }
      },
    );
  }
}

export async function ossHandleUpload(
  options: RcCustomRequestOptions,
  upConfig: UP_CONFIG,
) {
  const { onSuccess, onError, file, onProgress } = options;

  let data: any;
  if (upConfig.type === 'COS') {
    data = upConfig.cosCof;
  }
  if (upConfig.type === 'OSS') {
    data = upConfig.ossCof;
  }

  if (!data) {
    throw new Error('无上传配置');
  }
  // @ts-ignore
  const fileName = file?.name;
  if (data) {
    const prefix = `${data?.prefix}`;
    const filePath = `${prefix}${fileName ? fileName : file}`;

    const oss = new OSS({
      region: data.region,
      accessKeyId: data.accessKeyId,
      accessKeySecret: data.accessKeySecret,
      bucket: data.bucket,
      stsToken: data.stsToken,
      cname: data.cname,
      endpoint: data.endpoint,
    });
    // const progressInfo: any = {
    //   percent: progressData.percent * 100,
    // };
    // onProgress && onProgress(progressInfo);
    // console.log('上传中', JSON.stringify(progressData));

    oss
      .put(filePath, file)
      .then((data) => {
        console.log('oss: ', data);
        onSuccess && onSuccess(data.url, oss as any);
        message.success(`文件${fileName ? ` [ ${fileName} ] ` : ''}上传成功`);
      })
      .catch((err) => {
        message.error(`文件上传失败,请重新上传(${err})`);
        onError && onError(new Error(`${err}`));
      })
      .finally(() => {});
  }
}

/**
 * @param url
 * @param option
 */
export async function requestJSONFile(
  config: AxiosRequestConfig,
): Promise<AxiosResponse & any> {
  const fetch = axios.create({});
  fetch.defaults.headers.post['Content-Type'] =
    'application/json; charset=UTF-8';
  // 添加响应拦截器
  fetch.interceptors.response.use(
    function (response) {
      return response?.data;
    },
    function (error) {
      // 对响应错误做点什么
      return Promise.reject(error);
    },
  );

  return fetch({
    ...config,
  });
}

/**
 * 数组交换
 * @param arr
 * @param fromIndex
 * @param toIndex
 */
export function swapArrPlaces(arr: any[], fromIndex: number, toIndex: number) {
  [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
}

export enum A_Z {
  'A' = 0,
  'B' = 1,
  'C' = 2,
  'D' = 3,
  'E' = 4,
  'F' = 5,
  'G' = 6,
  'H' = 7,
  'I' = 8,
  'J' = 9,
  'K' = 10,
  'L' = 11,
  'M' = 12,
  'N' = 13,
  'O' = 14,
  'P' = 15,
  'Q' = 16,
  'R' = 17,
  'S' = 18,
  'T' = 19,
  'U' = 20,
  'V' = 21,
  'W' = 22,
  'X' = 23,
  'Y' = 24,
  'Z' = 25,
}

/**
 * @description 数字转中文数码
 *
 * @param {Number|String}   num     数字[正整数]
 * @param {String}          type    文本类型，lower|upper，默认upper
 *
 * @example number2text(100000000) => "壹亿元整"
 */
export const number2text = (
  number: number,
  type: string = 'lower',
): string | boolean => {
  // 配置
  const confs = {
    lower: {
      num: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
      unit: ['', '十', '百', '千', '万'],
      level: ['', '万', '亿'],
    },
    upper: {
      num: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
      unit: ['', '拾', '佰', '仟'],
      level: ['', '万', '亿'],
    },
    decimal: {
      unit: ['分', '角'],
    },
    maxNumber: 999999999999.99,
  };

  // 过滤不合法参数
  if (Number(number) > confs.maxNumber) {
    console.error(
      `The maxNumber is ${confs.maxNumber}. ${number} is bigger than it!`,
    );
    return false;
  }
  // @ts-ignore
  const conf = confs[type];
  const numbers = String(Number(number).toFixed(2)).split('.');
  const integer = numbers[0].split('');
  const decimal = Number(numbers[1]) === 0 ? [] : numbers[1].split('');

  // 四位分级
  const levels = integer.reverse().reduce((pre: any, item, idx) => {
    let level = pre[0] && pre[0].length < 4 ? pre[0] : [];
    let value =
      item === '0' ? conf.num[item] : conf.num[item] + conf.unit[idx % 4];
    level.unshift(value);

    if (level.length === 1) {
      pre.unshift(level);
    } else {
      pre[0] = level;
    }

    return pre;
  }, []);

  // 整数部分
  const _integer = levels.reduce((pre: any, item: any, idx: number) => {
    let _level = conf.level[levels.length - idx - 1];
    let _item = item.join('').replace(/(零)\1+/g, '$1'); // 连续多个零字的部分设置为单个零字

    // 如果这一级只有一个零字，则去掉这级
    if (_item === '零') {
      _item = '';
      _level = '';

      // 否则如果末尾为零字，则去掉这个零字
    } else if (_item[_item.length - 1] === '零') {
      _item = _item.slice(0, _item.length - 1);
    }

    return pre + _item + _level;
  }, '');

  // 小数部分
  let _decimal = decimal
    .map((item, idx) => {
      const unit = confs.decimal.unit;
      const _unit = item !== '0' ? unit[unit.length - idx - 1] : '';

      return `${conf.num[item]}${_unit}`;
    })
    .join('');

  // 如果是整数，则补个整字
  return `${_integer}` + _decimal;
};

