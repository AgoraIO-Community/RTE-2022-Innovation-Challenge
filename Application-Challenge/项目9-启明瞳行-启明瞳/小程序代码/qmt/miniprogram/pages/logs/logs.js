// miniprogram/pages/logs.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.request({
     // url: 'https://api.ximalaya.com/operation/recommend_albums', //仅为示例，并非真实的接口地址
      url: 'https://api.ximalaya.com/operation/browse_column_content?app_key=1bb3a9fd2d37e12a43014dc9fdf58bf7&client_os_type=4&nonce=c3ca8a0c3ffbf88dc340fc21a4341dcd&id=3640&server_api_version=1.0.0&sig=c3ca8a0c3ffbf88dc340fc21a4341dcd',
      // https://api.ximalaya.com/operation/batch_get_columns?app_key=b617866c20482d133d5de66fceb37da3&client_os_type=4&nonce=6a23d1377a717ca021b185212833c773&timestamp=1554175748123&server_api_version=1.0.0&ids=2402&sig=11f1ece6dfb0492135074aa92b638589

   //   https://api.ximalaya.com/operation/browse_column_content?app_key=b617866c20482d133d5de66fceb37da3&client_os_type=4&nonce=1a472ee331b3ae3a149aae64673888d9&timestamp=1554175844111&id=1719&page=4&count=1&server_api_version=1.0.0&sig=3300f9a2238223d107c9f723aa778262


      // data: {
      //   app_key: '1bb3a9fd2d37e12a43014dc9fdf58bf7',
      //   client_os_type:2,
      //   ids: 3640
      // },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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