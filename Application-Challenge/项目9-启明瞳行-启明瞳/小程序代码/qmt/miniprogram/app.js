//app.js
import uma from 'umtrack-wx'; //引入友盟分享 Umeng  analysis
// paddlejs初始化
// import * as paddlejs from '@paddlejs/paddlejs-core';
// import '@paddlejs/paddlejs-backend-webgl';
// const plugin = requirePlugin("paddlejs-plugin");
// plugin.register(paddlejs, wx);

var config = require('./config.js')

const innerAudioContext = wx.createInnerAudioContext()
//全局背景音乐播放器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const XMPlugin = requirePlugin('xmly-plugin')
App({
  globalData: {
    userInfo: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : {},
    userlogin: wx.getStorageSync('userlogin'),
    userLoginStatus: 0, // 用户的登录状态 0 没有登录，1已经登录
    hasLogin: false,
    openid: null,
    innerAudioContext: innerAudioContext,
    destination: null,
    distance: null,
    bluetooth: false,
    interval: null,
    isReading: false,
    backgroundAudioManager: backgroundAudioManager,

    xmly: null, // XMLY 实例
    player: null, //  XMplayer 播放器实例
    // pdjs: null, //  paddlejs实例
  },
  umengConfig: {
    appKey: '66666666', //由友盟分配的APP_KEY
    // 使用Openid进行统计，此项为false时将使用友盟+uuid进行用户统计。
    // 使用Openid来统计微信小程序的用户，会使统计的指标更为准确，对系统准确性要求高的应用推荐使用Openid。
    useOpenid: true,
    // 使用openid进行统计时，是否授权友盟自动获取Openid，
    // 如若需要，请到友盟后台"设置管理-应用信息"(https://mp.umeng.com/setting/appset)中设置appId及secret
    autoGetOpenid: true,
    debug: false, //是否打开调试模式
    uploadUserInfo: true // 自动上传用户信息，设为false取消上传，默认为false
  },
  onLaunch: function () {
    innerAudioContext.loop = true
    innerAudioContext.autoplay = false
    innerAudioContext.obeyMuteSwitch = false;
    innerAudioContext.src = config.loadingUrl;


  
    //  ///////////////////////////////////////////////
    //调用API从本地缓存中获取数据
    let res = wx.getSystemInfoSync();
    try {
      let menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      let menuButtonBottom = menuButtonInfo.bottom;
      let menuButtonLeft = menuButtonInfo.left;
      let statusBarHeight = res.statusBarHeight; //状态栏的高度
      res.tabBarHeight = res.screenHeight - res.windowHeight;
      res.paddingTop = statusBarHeight; //navbar的padding-top值
      res.height = menuButtonBottom - statusBarHeight + 10; //navbar的height/line-height值
      res.paddingRight = res.screenWidth - menuButtonLeft + 3; //navbar的padding-right值
    } catch (e) {
      console.log(e)
    }
    wx.setStorageSync('sysInfo', res);


    // 请求分页参数  全局变量
    wx.setStorageSync('pageSize', 50);
    wx.setStorageSync('pageId', 1);
    //查询公众号、app关注情况
    var userInfo = {}
    try {
      userInfo = wx.getStorageSync('userInfo') || {};
    } catch (e) {
      console.log(e)
    }
    if (userInfo.unionid) {
      wx.request({
        url: config.bizAPI.getFollowerFoucus,
        data: {
          unionid: userInfo.unionid
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function (res) {
          console.log(res);
          if (res.data.content.focus) {
            let focusInfo = {};
            for (let i of res.data.content.focus) {
              focusInfo[i.id] = true;
            }
            wx.setStorageSync('focusInfo', focusInfo);
          } else {
            wx.setStorageSync('focusInfo', {
              1: false, //我是你的眼小程序
              2: false, //启明瞳小程序
              3: false, //启明fm
              4: false, //我能帮帮忙小程序
              5: false, //无障碍科技订阅号
              6: false, //启明瞳服务号
              7: false, //我能帮帮忙服务号
              8: false, //启明fm app
              9: false, //启明瞳 app
              10: false, //启明出行
            });
          }
        },
        fail: function (e) {
          console.log('请求关注情况失败')
          console.log(e);
        }
      })
    }
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function (e) {
        // console.log(e)
        // console.log('play success')
      },
      fail: function (e) {
        //  console.log(e)
        //  console.log('play fail')
      }
    })

    wx.cloud.init({
      env: 'qmt-test-869cb2',
      traceUser: true,
    })


  },

  onPageNotFound(res) {
    console.log('页面不存在:' + res.path);
    wx.reLaunch({
      url: 'pages/qmt/qmt'
    })

  },
  onError(error) {
    console.log('qmt小程序初始化错误' + error);
  }
})