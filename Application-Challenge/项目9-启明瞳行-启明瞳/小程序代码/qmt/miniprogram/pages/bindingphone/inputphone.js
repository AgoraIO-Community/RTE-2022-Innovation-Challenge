// pages/bindingphone/inputphone.js
var app = getApp();
var ace = require('../../utils/ace.js')
var util = require('../../utils/util.js');
const config = require("../../config");
Page({
  data: {
    ariaHidden: false, //默认不隐藏 无障碍读屏
    code: '',
    openid: '',
    unionid: '',
    nickName: '',
    avatarUrl: '',
    gender: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openid: app.globalData.userInfo['openid'],
      unionid: app.globalData.userInfo['unionid'],
      nickName: app.globalData.userInfo['nickName'],
      avatarUrl: app.globalData.userInfo['avatarUrl'],
      gender: app.globalData.userInfo['gender'],
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   * 显示无障碍支持问题ariaHidden 设置为ture，隐藏
   */
  onHide: function () {
    this.setData({
      ariaHidden: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   * 显示无障碍支持问题 ariaHidden 设置为false，不隐藏
   */
  onShow: function () {
    this.setData({
      ariaHidden: false
    })
    ace.showToast('请输入您要绑定的手机号');
    this.setData({
      cameraOn: true,
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
  },



  /**
   * 保存位置信息
   * @param {信息} e 
   */
  savePhone: function (e) {
    var that = this;
    var code = app.globalData.code;
    if (e.detail.value.mobile.length == 0) {
      ace.showToast('电话不得为空!');
    } else {
      //预处理验证手机号码
      if (e.detail.value.mobile.match(/^1[3456789]{1}\d{9}$/)) {
        var mobile = e.detail.value.mobile;
        // todo  冯桂杰
        wx.request({
          //  传入必要数据，进行小程序登录，解密用户手机号
          url: config.bizAPI.registerByMobile,
          method: 'get',
          data: {
            openid: that.data.openid,
            unionid: that.data.unionid,
            mobile: mobile,
            code: code,
            nickName: app.globalData.userInfo['nickName'],
            iconurl: app.globalData.userInfo['avatarUrl'],
            appid: 'wxce8e592adfc78ceb', //启明瞳小程序的APPID
            loginChannel: 1,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {

            console.log(res);
            // 返回成功
            if (res.data.code == 0) {
              console.log(res.data);
              // 获取解码手机号
              var mobile = res.data.content.mobile;
              app.globalData.userInfo['mobile'] = mobile;
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

            } else {
              ace.showToast('用户手机号获取失败，请重新登录，可激活底部联系微信客服说明问题');
              wx.clearStorageSync("userInfo");
              wx.clearStorageSync("userLogin");
              wx.clearStorageSync("userLoginStatus");
              wx.reLaunch({
                url: '../login/login',
              })
            }
          },
          error: function (e) {
            ace.showToast('网络异常！可激活底部联系微信客服说明问题');
          }
        })
      } else {
        ace.showToast('手机号码格式错误,请重新输入!');
      }
    }
  },

})