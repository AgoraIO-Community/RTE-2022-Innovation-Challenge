// miniprogram/pages/tools/contactus/addsocialcircle/addsocialcircle.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '有人@你，下面按钮可以活动邀请',
    groupId:'32a6b3393dfdc1debf48399bfdf8196e',
    groupIntro:'要和全国盲人进行交流沟通,允许获取通知后按照通知提示扫描进入群聊',
    myCardIntro: '加下面联系我们的按钮，允许使用启明瞳按照收到企业微信的通知, 然后会收到邀请通知，收到后就长按扫描图片就可以添加我们了，我们会提供免费助盲应用',
    myCardId:'58478b69a9db372e70f72fdedb3bc889'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title: options.title,
      groupId: options.groupId,
      groupIntro:options.groupIntro,
      myCardIntro:options.myCardIntro,
      myCardId:options.myCardId
    });
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
   *  path: 'pages/fm/album/album?id=' + this.data.listId
   */
  onShareAppMessage: function () {
    return {
      title: '@所有人，盲人圈都在关注盲人自己的媒体，赶快进入添加，获取加入二维码',
      desc: '所有人，盲人圈都在关注盲人自己的媒体，赶快进入添加，获取加入二维码',
      path: 'pages/tools/contactus/addsocialcircle/addsocialcircle?title=' + this.data.title + '&groupId=' + this.data.groupId + '&groupIntro=' + this.data.groupIntro + '&myCardId=' + this.data.myCardId + '&myCardIntro=' + this.data.myCardIntro
    };
  }
})