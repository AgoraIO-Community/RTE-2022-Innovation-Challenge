// miniprogram/pages/otherreward/otherreward.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "赞赏加油包",
    rewardAmount: '0',
  },

  rewardInput: function(event) {
    this.setData({
      rewardAmount: event.detail.value
    });
  },

  rewardConfirm: function(event) {
    let rewardAmount = event.detail.value;
    console.log(rewardAmount)
    this.toPay(parseInt(rewardAmount));
  },

  rewardSubmit: function(event) {
    let rewardAmount = this.data.rewardAmount;
    if(rewardAmount == '0')
      rewardAmount = '1';
    console.log(rewardAmount)
    this.toPay(parseInt(rewardAmount));
  },

  /**
   * @method toPay
   * @param {int} totalFee 费用。单位元
   * @description 调用支付云函数
   */
  toPay: function (totalFee) {
    let total_fee = totalFee * 100 + ''
    console.log(totalFee, total_fee)
    wx.cloud.callFunction({
      name:"payment",
      data: {
        total_fee: total_fee, // 金额字符串。单位是0.01元
      }
    }).then(res=>{
      let result=res.result
      console.log(res.result)
      wx.requestPayment({
        nonceStr:result.nonceStr,
        package:result.package,
        paySign: result.paySign,
        timeStamp: result.timeStamp,
        signType:result.signType,
        success:res=>{
          console.log("success")
        },
        fail:error=>{
          console.log('Error:toPay:', error.errMsg)
        }
      })
    })
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
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