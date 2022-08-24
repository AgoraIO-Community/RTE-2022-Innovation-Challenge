import { defineConfig, utils } from 'umi';
import zhCN from 'antd/lib/locale/zh_CN';
import packageJSON from './package.json';
import appInfo from './app.json';
import moment from 'moment';
const { winPath } = utils;

// @ts-ignore
import hongtangyunTheme from './src/utils/antd-hongtangyun-theme/index.js';

const { REACT_APP_ENV, app_platform, is_build } = process.env;

/**
 * 环境变量
 * @enum
 * 'master' | 'qa' | 'qa'
 */
const appEnv: 'master' | 'qa' | 'dev' | string = REACT_APP_ENV || 'master';

let baseUrl = '';

let mqttUrl = '';

let cdnUrl = '';

let socketUrl = '';

let layoutComponent = '@/components/HongTangYunLayout/index';

let theme = hongtangyunTheme;

if (app_platform === 'hongtangyun') {
  layoutComponent = '@/components/HongTangYunLayout/index';
  cdnUrl = `${appInfo.cdnPath}/${
    appInfo.id
  }_version_${packageJSON.version.replace(/\./gi, '_')}/`;
  theme = hongtangyunTheme;
}

const publicPath = is_build === 'true' ? `${cdnUrl}` : `/${appInfo.id}/`;
console.log('publicPath: ', publicPath);
export default defineConfig({
  base: `${appInfo.id}`,
  publicPath: publicPath,
  fastRefresh: {},
  mfsu: {},
  theme: {
    ...theme,
    'ant-prefix': appInfo.name,
  },
  runtimePublicPath: false,
  antd: {
    config: {
      prefixCls: appInfo.name,
      locale: zhCN,
    },
  },
  dva: {
    immer: true,
    hmr: false,
  },
  hash: true,
  dynamicImport: {},
  exportStatic: {},
  nodeModulesTransform: {
    type: 'none',
  },
  define: {
    REACT_APP_ENV,
    __appInfo__: JSON.stringify(appInfo),
    __prefixCls__: appInfo.name,
    APP_VERSION: packageJSON.version,
    APP_BUILD_TIME: moment().format('X'),
    baseUrl,
    mqttUrl,
    socketUrl,
  },
  copy: ['app.json', 'app.json'],
  manifest: {
    basePath: `${packageJSON.version}:`,
    // fileName: 'app-manifest.json',
  },
  qiankun: {
    slave: {},
  },
  routes: [
    {
      path: '/',
      component: layoutComponent,
      routes: [
        /**
         * 第一机位
         */
        {
          path: '/first',
          component: '@/pages/first/index',
        },
        /**
         * 第二机位
         */
        {
          path: '/second',
          component: '@/pages/second/index',
        },
        /**
         * 考官端
         */
        {
          path: '/examiner',
          component: '@/pages/examiner/index',
        },
        /**
         * 监控
         */
        {
          path: '/monitor',
          component: '@/pages/monitor/index',
        },
        /**
         * 录制
         */
        {
          path: '/record',
          component: '@/pages/record/index',
        },
      ],
    },
  ],
  chainWebpack(memo, { env, webpack, createCSSRule }) {
    console.log('=======================', env);
    console.log('env', env);
    console.log('=======================', env);

    memo.module
      .rule('media')
      .test(/\.(mp3|4)$/)
      .use('file-loader')
      .loader(require.resolve('file-loader'));

    if (env === 'production') {
      memo.merge({
        optimization: {
          minimize: true,
          splitChunks: {
            chunks: 'all',
            minSize: 30000,
            minChunks: 2,
            maxAsyncRequests: 5, // 按需加载时候最大的并行请求数
            maxInitialRequests: 3, // 最大初始化请求数
            automaticNameDelimiter: '.',
            cacheGroups: {
              vendor: {
                minChunks: 2,
                name: 'vendors',
                test: /^.*node_modules[\\/](?!ag-grid-|lodash|wangeditor|react-virtualized|rc-select|rc-drawer|rc-time-picker|rc-tree|rc-table|rc-calendar|antd).*$/,
                chunks: 'all',
                priority: 10,
              },
              virtualized: {
                name: 'virtualized',
                test: /[\\/]node_modules[\\/]react-virtualized/,
                chunks: 'all',
                priority: 10,
              },
              rcselect: {
                name: 'rc-select',
                test: /[\\/]node_modules[\\/]rc-select/,
                chunks: 'all',
                priority: 10,
              },
              rcdrawer: {
                name: 'rcdrawer',
                test: /[\\/]node_modules[\\/]rc-drawer/,
                chunks: 'all',
                priority: 10,
              },
              rctimepicker: {
                name: 'rctimepicker',
                test: /[\\/]node_modules[\\/]rc-time-picker/,
                chunks: 'all',
                priority: 10,
              },
              // antd: {
              //   name: "antd",
              //   test: /[\\/]node_modules[\\/]antd[\\/]/,
              //   chunks: "all",
              //   priority: 9
              // },
              rctree: {
                name: 'rctree',
                test: /[\\/]node_modules[\\/]rc-tree/,
                chunks: 'all',
                priority: -1,
              },
              rccalendar: {
                name: 'rccalendar',
                test: /[\\/]node_modules[\\/]rc-calendar[\\/]/,
                chunks: 'all',
                priority: -1,
              },
              rctable: {
                name: 'rctable',
                test: /[\\/]node_modules[\\/]rc-table[\\/]es[\\/]/,
                chunks: 'all',
                priority: -1,
              },
              lodash: {
                name: 'lodash',
                test: /[\\/]node_modules[\\/]lodash[\\/]/,
                chunks: 'all',
                priority: -2,
              },
              bizcharts: {
                name: 'bizcharts',
                test: /[\\/]node_modules[\\/]bizcharts[\\/]/,
                chunks: 'all',
                priority: 10,
              },
              pdfjs: {
                name: 'pdfjs',
                test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
                chunks: 'all',
                priority: 30,
              },
              agorasdk: {
                name: 'agorasdk',
                test: /[\\/]node_modules[\\/]agora-rtc-sdk-ng[\\/]/,
                chunks: 'all',
                priority: 40,
              },
              trtcsdk: {
                name: 'trtcsdk',
                test: /[\\/]node_modules[\\/]trtc-js-sdk[\\/]/,
                chunks: 'all',
                priority: 50,
              },
            },
          },
        },
      });
      //过滤掉momnet的那些不使用的国际化文件
      memo
        .plugin('replace')
        .use(require('webpack').ContextReplacementPlugin)
        .tap(() => {
          return [/moment[/\\]locale$/, /zh-cn/];
        });
    }
  },
});
