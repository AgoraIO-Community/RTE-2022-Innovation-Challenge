// miniprogram/pages/reward/reward.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "赞赏加油包",
    rewardCount: 2,
    rewardMatrix: [
      [1, 5, 10],
      [20, 50, 100]
    ],
    selectedIndex0: -1,
    selectedIndex1: -1,
    selectedRewardAmount: 0,

    isOtherTap: false,
  },

  selectRewardAmount: function(event) {
    // console.log(event.currentTarget.dataset)
    let selectedIndexes = event.currentTarget.dataset.index.split("_");
    let selectedRewardAmount = event.currentTarget.dataset.rewardamount;
    this.setData({
      selectedIndex0: selectedIndexes[0],
      selectedIndex1: selectedIndexes[1],
      selectedRewardAmount: selectedRewardAmount
    });
    this.toPay(parseInt(selectedRewardAmount));
  },

  gotoOtherReward: function() {
    wx.navigateTo({
      url: '/pages/reward/otherreward/otherreward',
    })
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