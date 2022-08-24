// pages/setting/setting.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand: "",
    model: '',
    version: '',
    system: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    try {
      var res = wx.getSystemInfoSync()
    } catch (e) {
      // Do something when catch error
    }
    this.setData({
      brand: res.brand,
      model: res.model,
      model: res.model,
      version: res.version,
      system: res.system,
    });

  },
  openSetting: function() {
    wx.openSetting({
      success: (res) => {
        /*
         * res.authSetting = {
         *   "scope.userInfo": true,
         *   "scope.userLocation": true
         * }
         */
      }
    })
  },
  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.lon(res)
      }
    })
  },
  make110Phone: function() {
    wx.makePhoneCall({
      phoneNumber: '110',
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
  onShareAppMessage: function(option) {
    return {
      title: '启明瞳小程序',
      desc: '启明瞳开启新视界',
      path: 'pages/qmt/qmt',
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  },
 
})