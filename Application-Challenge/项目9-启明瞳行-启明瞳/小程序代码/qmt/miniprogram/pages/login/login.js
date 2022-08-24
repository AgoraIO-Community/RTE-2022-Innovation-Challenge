var app = getApp();
let config = require('../../config');
const ace = require('../../utils/ace');
Page({
  data: {},
  onLoad: function (e) {},
  onReady: function () {},
  onShow: function () {
    this.setData({
      cameraOn: true,
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
  },
  onHide: function () {},
  onUnload: function () {
    var loginStatus = wx.getStorageSync('userlogin');
    if (!loginStatus) {
      wx.removeStorageSync('userInfo');
    }
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
    });
    /**
     * 缓存中存在用户信息，直接跳转到主界面
     */
    try {
      let _userinfo = wx.getStorageSync('userInfo');
      if (_userinfo) {
        wx.reLaunch({
          url: '../qmt/qmt',
        })
      }
    } catch (e) {
      console.log('get user info from storage failed, ', e);
    }
  },

  /**
   * 获取用户信息的基本信息
   */
  getUserProfile: function () {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    ace.showToast("提示：底部弹框，请点击最底部允许按钮进行授权")
    wx.getUserProfile({
      desc: '注册启明瞳用户', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        //进行注册
        this.registerUser(res.userInfo)
      }
    })
  },

  /**
   * 注册的模块的内容
   * https://developers.weixin.qq.com/miniprogram/dev/framework/plugin/functional-pages/user-info.html
   */
  registerUser: function (userInfo) {
    app.globalData.userInfo['avatarUrl'] = userInfo.avatarUrl; // 头像
    app.globalData.userInfo['nickName'] = userInfo.nickName; // 昵称
    app.globalData.userInfo['gender'] = userInfo.gender; //  性别
    wx.setStorageSync('userInfo', app.globalData.userInfo);

    wx.login({
      success: function (res) {
        app.globalData.code = res.code;
        wx.request({
          url: config.bizAPI.login,
          method: 'get',
          data: {
            appid: 'wxce8e592adfc78ceb',
            wxName: userInfo.nickName,
            sex: userInfo.gender,
            code: res.code,
            loginChannel: 1,
            iconurl: app.globalData.userInfo['avatarUrl'],
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res);
            //登录成功
            if (res.data.code == 1) {
              // 获取解码手机号
             
              app.globalData.userInfo['openid'] = res.data.content.openid;
              app.globalData.userInfo['unionid'] = res.data.content.wxUnionId;
              app.globalData.userInfo['mobile'] = res.data.content.mobile;
              app.globalData.userInfo['qmid'] = res.data.content.qmid;
              //注册新用户或者登录
              //修改缓存写入
              wx.setStorageSync('userInfo', app.globalData.userInfo);
              wx.setStorageSync('userlogin', true);
              wx.setStorageSync("userLoginStatus", 1); //设置登录成功了。
              wx.setStorageSync('appid', 'wxce8e592adfc78ceb');
              ace.showToast('授权成功！');
              setTimeout(function () {
                wx.reLaunch({
                  url: '../qmt/qmt',
                })
              }, 800);
            }
            //登陆失败跳转到绑定手机号页面
            else if (res.data.code == -2) {
              console.log(res);
              ace.showToast('此账号未绑定手机号，请先绑定手机号！');
              app.globalData.userInfo['openid'] = res.data.content.openId;
              app.globalData.userInfo['unionid'] = res.data.content.unionId;
              app.globalData.userInfo['session_key'] = res.data.content.sessionKey;
              setTimeout(function () {
                wx.navigateTo({
                  url: '../bindingphone/bindingphone',
                })
              }, 800);
            }
            // app.globalData.userInfo['openid'] = res.data.user.openid;
            // app.globalData.userInfo['unionid'] = res.data.user.unionid;
            // app.globalData.userInfo['session_key'] = res.data.user.session_key;
            // //判断用户是否绑定手机号接口，直接访问公司服务器
            // if (res.data.status == 1) { // 返回用户信息openid、unionid、session_key方案
            //   setTimeout(function () {
            //     wx.navigateTo({
            //       url: '../bindingphone/bindingphone?openid=' + app.globalData.userInfo['openid'] + '&unionid=' + app.globalData.userInfo['unionid'] + '&nickName=' + app.globalData.userInfo['nickName'] + '&avatarUrl=' + app.globalData.userInfo['avatarUrl'] + '&gender=' + app.globalData.userInfo['gender'],

            //     })
            //   }, 800);
            // }

          },
          fail: function (e) {
            ace.showToast('网络异常！可激活底部联系微信客服说明问题')
          },

        })
      }
    })


  }
})