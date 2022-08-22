/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1658846953729_5056';

  // add your middleware config here
  // config.middleware = [];
  config.middleware = ['errorHandler', 'auth'];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',

    host: 'http://localhost:5920',
    // 配置邮箱注册账户是否需要激活
    isNeedActivate: false,
    // 上传文件夹
    uploadDir: 'app/public/uploads',
    // 配置超管账户
    username: 'template',
    email: 'template@vmloft.com',
    password: '123123',
    // 系统信息
    title: '模板服务器',
    desc: '使用 Eggjs 实现自定义模板服务器',
    // 分类配置
    kagoCategoryList: [
      {
        id: 1,
        title: '考研打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 2,
        title: '考公打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 3,
        title: '健康餐打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 4,
        title: '健身打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 5,
        title: '跑步打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 6,
        title: '早睡打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 7,
        title: '建模打卡群',
        desc: '一键创建，开始打卡',
      },
      {
        id: 8,
        title: '提肛打卡群',
        desc: '一键创建，开始打卡',
      },
    ],
  };


  /**
   * 权限认证配置
   */
  config.auth = {
    // 是否启用中间件，默认为 false
    enable: true,
    // 设置符合某些规则的请求不经过这个中间件，和 match 互斥，同时只能配置一个
    ignore: ['/api/admin/init', "/api/sign/", /^\/api\/sign\/(signUpByAccount|in|up|activate)/, '/public/uploads', '/api/test/'],
  };

  /**
   * jwt 配置，这里主要用来生成和解析 token，验证交由上边自定义的 auth 中间件
   */
  config.jwt = {
    // 是否启用中间件，默认为 false
    enable: false,
    // 自定义 JWT 加密 token 需要的 secret
    secret: 'dakago_server_123456',
    // 设置符合某些规则的请求不经过这个中间件，和 match 互斥，同时只能配置一个
    ignore: ['/api/admin/init', /^\/api\/sign\/(in|up|activate)/, '/public/uploads', '/api/test/'],
    // match: '/jwt',
  };

  /**
  * Easemob 配置，后台地址 https://console.easemob.com/app/im-service/detail
  */
  config.easemob = {
    host: 'http://a1.easemob.com', // 环信 API 请求接口，在环信后台查看
    orgName: '', // 环信 appKey 前半段
    appName: 'demo', // 环信 appkey 后半段
    clientId: '', // 替换环信后台 clientId
    clientSecret: '', // 替换环信后台 clientSecret
  };

  config.rtc = {
    clientId: '', // 云信令 clientId
    clientSecret: '', // 云信令 clientSecret
  };

  /**
   * bcrypt 配置
   */
  config.bcrypt = {
    saltRounds: 10, // default 10
  };

  /**
   * 支持文件类型配置
   */
  config.multipart = {
    fileExtensions: ['.apk', '.pptx', '.docx', '.csv', '.doc', '.ppt', '.pdf', '.pages', '.wav', '.mov'], // 增加对 .apk 扩展名的支持
  };


  /**
   * 参数过滤配置
   */
  config.parameters = {
    logParameters: true,
    // param names that you want filter in log.
    filterParameters: ['token'],
  };

  /**
   * 接口安全配置
   */
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:5920'],
  };

  /**
   * 接口安全配置
   */
  config.validate = {
    convert: false,
    widelyUndefined: true,
  };


  /**
  * 接口安全配置
  */
  config.validate = {
    convert: false,
    widelyUndefined: true,
  };

  config.news = {
    pageSize: 5,
    serverUrl: 'https://hacker-news.firebaseio.com/v0',
  };

  // 配置MySQL数据库的连接
  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1', // 替换
    port: 3306,
    database: 'dakago',
    username: 'dakago',
    password: '', // 替换
    // 配置数据库时间为东八区北京时间
    timezone: '+08:00',
    dialectOptions: {//​ 每次查询datetime的字段，显示出来都是这种格式​2022-02-13T01:34:05.000Z
      dateStrings: true,
      typeCast: true
    },
    define: {
      freezeTableName: true, // 强制表名称等于模型名称
      timestamps: false //禁用模型的时间戳
    }
  };

  return {
    ...config,
    ...userConfig,
  };
};
