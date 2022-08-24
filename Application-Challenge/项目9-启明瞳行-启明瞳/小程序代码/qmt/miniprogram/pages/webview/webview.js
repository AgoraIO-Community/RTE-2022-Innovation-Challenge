//var urlHead = 'https://mp.weixin.qq.com/s/';
//todo 加载中提示，加载成功进行语音或者震动提示
//todo 第一次使用的时候进行相关内容的播报
Page({
  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    title: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      url:  options.url,
      title: options.title,
    })

    wx.setNavigationBarTitle({
      title: options.title + '启明瞳整理',
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
  onShareAppMessage(options) {
    return {
      title: '有人@我，盲人相关文章' + this.data.title,
      desc: '来自盲人新视界微信公共账号' + this.data.title,
      path: '/pages/webview/webview?url='+this.data.url+'&title='+this.data.title
    }
  }
})