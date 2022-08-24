// miniprogram/pages/tools/tel/tel.js
/**
 * @file 发现页面
 * @author 周江南创建改进！
 * @copyright 武汉网明公司
 * @createDate 2018-8-9
 * @todo ctrl + f 搜索 @todo
 */
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   * todo 
   */
  onLoad: function(options) {

    // pages/tools/tel/tel?phoneNumber=10086
    //todo  后续设置从 微信推送公共账号文章进入 ，还是从 菜单进入该界面 设置一个来源查收
    if (!util.isEmpty(options.phoneNumber)) {
      this.onLoadTelephone(options.phoneNumber)
    }
  },


  /**
   * @method onLoadTelephone
   * @param {Number} phoneNumber
   * @description phoneNumber 为电话号码
   * todo 后续需要通过判断电话号码是否为 数字
   */
  onLoadTelephone: function(phoneNumber) {
    if (!util.isEmpty(phoneNumber)) {
      wx.makePhoneCall({
        phoneNumber: phoneNumber
      })
    } else {
      util.showInfo("电话号码为空，不能拨打")
    }
  },

  /**
   * @method makePhoneCall
   * todo 后续需要通过判断电话号码是否为 数字
   */
  makePhoneCall: function (event) {
      wx.makePhoneCall({
        phoneNumber: event.currentTarget.dataset.number
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let sysInfo = wx.getStorageSync('sysInfo');
    this.setData({
      sysInfo: sysInfo
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '@所有人，盲人出行必备的电话号码，赶快推荐给跟多人，启明行APP整理',
      desc: '@所有人，盲人出行必备的电话号码，赶快推荐给跟多人，启明行APP整理',
      path: 'pages/tools/tel/tel'
    };
  }
})