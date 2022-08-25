import React from 'react';
import { Button, ConfigProvider, message, notification } from 'antd';
import axios, { AxiosResponse } from 'axios';
import _ from 'lodash';
import { reloadClearCache } from '.';

const fetch = axios.create({});

const query = `version=${APP_VERSION}&app_build_time=${APP_BUILD_TIME}`;
console.log(query);
export function registerSW() {
  // 检测到新的版本，推荐您通过 重新加载 来获取更好的体验。忽略
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`/sub-setting/service-worker.js?${query}`)
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // 如果现在脱机，请通知用户
  window.addEventListener('sw.offline', () => {
    alert('当前处于离线状态');
    message.warning('当前处于离线状态');
  });

  // 在页面上弹出一个提示，询问用户是否想使用最新版本
  window.addEventListener('sw.updated', (event: Event) => {
    const e = event as CustomEvent;
    alert('有新内容');
    const reloadSW = async () => {
      // 检查ServiceWorkerRegistration中是否有状态为等待状态的sw
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return true;
      }
      // 用MessageChannel将等待的事件发送到等待的SW
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (msgEvent) => {
          if (msgEvent.data.error) {
            reject(msgEvent.data.error);
          } else {
            resolve(msgEvent.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });
      // 在SW跳过等待之后，刷新当前页面以使用更新的HTML和其他资产
      reloadClearCache(window.location.href);
      return true;
    };
    const key = `open${Date.now()}`;
    const btn = (
      <ConfigProvider prefixCls={__prefixCls__}>
        <Button
          type="primary"
          onClick={() => {
            notification.close(key);
            reloadSW();
          }}
        >
          刷新
        </Button>
      </ConfigProvider>
    );
    notification.open({
      message: '有新内容',
      description: '请点击“刷新”按钮或者手动刷新页面',
      btn,
      key,
      onClose: async () => {},
    });
  });
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    // unregister service worker
    const { serviceWorker } = navigator;
    if (serviceWorker.getRegistrations) {
      serviceWorker.getRegistrations().then((sws) => {
        sws.forEach((sw) => {
          sw.unregister();
        });
      });
    }
    serviceWorker.getRegistration().then((sw) => {
      if (sw) sw.unregister();
    });

    // remove all caches
    if (window.caches && window.caches.keys) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  }
}

export type CacheFile = {
  url: string;
  method?: 'GET' | 'POST';
};
export type CacheFileList = Array<CacheFile>;

export type ChangeArg = {
  total: number;
  success: {
    [url: string]: AxiosResponse;
  };
  failure: {
    [url: string]: AxiosResponse;
  };
};

export type Option = {
  onChange?: (arg: ChangeArg) => void;
  onProgress?: (progress: number) => void;
  onError?: (err: any) => void;
};

export const createCacheFile = async (
  list: CacheFileList,
  option: Option = {},
) => {
  const {
    onChange = () => {},
    onProgress = () => {},
    onError = () => {},
  } = option;

  const changeInfo: ChangeArg = {
    total: list.length,
    success: {},
    failure: {},
  };
  let progress: { [key: string]: number } = {};
  const totalProgress = changeInfo.total * 100;

  const all = list.map(async (item) =>
    fetch({
      url: item.url,
      method: item.method || 'GET',
      onDownloadProgress: (progressEvent) => {
        let tmpProgress = 0;
        const itemProgress =
          100 * ((progressEvent.loaded || 1) / (progressEvent.total || 1));
        progress[JSON.stringify(item)] =
          itemProgress >= 100 ? 100 : itemProgress;
        Object.keys(progress).forEach((p) => {
          tmpProgress += progress[p];
        });
        onProgress(tmpProgress / totalProgress);
      },
    }).catch((err) => {
      return err;
    }),
  );
  await axios
    .all(all)
    .then(
      axios.spread((...args) => {
        args.forEach((item) => {
          const { config = {} } = item;
          const { url } = config;
          if (item.status === 200) {
            changeInfo.success = {
              ...changeInfo.success,
              [url]: {
                ...item,
              },
            };
          } else {
            changeInfo.failure = {
              ...changeInfo.failure,
              [url]: {
                ...item,
              },
            };
          }
        });
        return args;
      }),
    )
    .catch((err) => {
      console.log(123, err);
      onError(err);
    })
    .finally(() => {
      onChange(changeInfo);
    });
  return changeInfo;
};

export default {
  registerSW,
  createCacheFile,
};

// setTimeout(async () => {
//   const appFiles = await axios.get(`/app-manifest.json?${query}`);
//   const files = appFiles.data;
//   if (_.isObject(files)) {
//     const list = Object.values(files).map((item) => {
//       return {
//         url: item,
//       };
//     });
//     const res = await createCacheFile(list, {
//       onChange: (data) => {
//         console.log('onChange: ', data);
//       },
//       onProgress: (progress) => {
//         console.log('onProgress: ', progress);
//       },
//       onError: (data) => {
//         console.log('onError: ', data);
//       },
//     });
//   }
// }, 1000);
