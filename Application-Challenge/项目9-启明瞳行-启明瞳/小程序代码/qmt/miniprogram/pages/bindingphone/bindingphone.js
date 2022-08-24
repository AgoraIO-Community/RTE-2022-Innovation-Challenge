// pages/bindingphone/bindingphone.js
var app = getApp();
const config = require("../../config");
var ace = require("../../utils/ace");
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      cameraOn: true,
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
  },

  /**
   * 
   * @param {*} e 
   */
  getPhoneNumber: function (e) {
    var that = this;
    console.log(e.detail);
    var iv = e.detail.iv;
    // console.log(iv);
    var encryptedData = e.detail.encryptedData;
    // console.log(encryptedData);
    var sessionKey = app.globalData.userInfo['session_key'];
    console.log(sessionKey);
    var code = e.detail.code;
    if (typeof (code) == "undefined") {
      ace.showToast("请先绑定微信手机号，再进行登录！如果绑定不了，可激活底部联系微信客服说明问题,也可使用启明店APP完成登录");
    } else {
      
      if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '未授权',
          success: function (res) {}
        })
      } else {
        
        wx.request({
          //  传入必要数据，进行小程序登录，解密用户手机号
          url: config.bizAPI.registerByMobile,
          method: 'get',
          data: {
            openid: that.data.openid, 
            unionid: that.data.unionid,
            iv: iv,
            encryptedData: encryptedData,
            sessionKey: sessionKey,
            code: code,
            nickName: app.globalData.userInfo['nickName'],
            iconurl: app.globalData.userInfo['avatarUrl'],
            appid: 'wxce8e592adfc78ceb', //启明店小程序的APPID
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
      }
    }

  },

  getmsg: function() {
    ace.showToast('请点击底部弹框的允许按钮，允许获取你的手机号，方便完成购物！');
  },

  /**
   * 进入输入手机号的界面
   */
  goInputPhone:function(){
    wx.navigateTo({
      url: '../bindingphone/inputphone',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   *  企业微信客服
   */
  openQYWXChat: function () {
    util.openQYWXCustomerServiceChat()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})