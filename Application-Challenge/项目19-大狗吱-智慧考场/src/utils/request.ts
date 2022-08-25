import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'query-string';
import webSDK from '@hongtangyun/web-sdk';

const fetch = axios.create({});

fetch.interceptors.request.use(
  async (config) => {
    config.headers.Authorization = `Bearer ${await webSDK.getToken()}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// 添加响应拦截器
fetch.interceptors.response.use(
  function (response) {
    const { statusCode, code, message, data } = response?.data || {};
    // 对响应数据做点什么
    // 退出登录
    // const dispatch = getDispatch();
    // if (dispatch) {
    //   dispatch({
    //     type: 'g'
    //   })
    // }
    return data;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);

/**
 * @param url
 * @param option
 */
export default async function request(
  config: AxiosRequestConfig,
): Promise<AxiosResponse & any> {
  // fetch.defaults.baseURL = 'https://creditstudio.dagouzhi.com';
  fetch.defaults.headers.post['Content-Type'] =
    'application/json; charset=UTF-8';
  return fetch({
    ...config,
  });
}

/**
 * @param url
 * @param option
 */
export async function requestHTML(
  config: AxiosRequestConfig,
): Promise<AxiosResponse & any> {
  // fetch.defaults.baseURL = 'https://creditstudio.dagouzhi.com';
  fetch.defaults.headers.post['Content-Type'] =
    'application/x-www-form-urlencoded; charset=UTF-8';
  // 设置统一的请求头
  if (config.method === 'POST') {
    config.data = qs.stringify(config.data);
  }
  return fetch({
    ...config,
    responseType: 'blob',
    transformResponse: [
      function (data) {
        return new Promise((r) => {
          var reader = new FileReader();
          reader.readAsText(data, 'GBK');
          reader.onload = function (e) {
            // console.log(reader.result);
            r(reader.result);
          };
        }).then((data) => data);
      },
    ],
  });
}
