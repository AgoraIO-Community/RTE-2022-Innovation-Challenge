// pages/rank/rank.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paddingTop: 20,
    height: 48
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(!options.rank && !options.myScore) {
      wx.showModal({
        title: '无排名数据',
        content: '点击确定跳转到启明瞳小程序，点击取消回到启明听游小游戏',
        success(res) {
          if(res.confirm) {
            wx.reLaunch({
              url: '../qmt/qmt',
            })
          }else if (res.cancel) {
            wx.navigateToMiniProgram({
              appId: 'wx9aec1067417febfd'
            })
          }
        }
      })
    }else {
      this.setData({
        scores: options.scores,
        myScore: options.myScore
      })
    }
    // let scores = [
    //   {
    //     rank: 1,
    //     nickname: 'Grayyyy',
    //     score: '415'
    //   },
    //   {
    //     rank: 2,
    //     nickname: 'Emotto',
    //     score: '403'
    //   },
    //   {
    //     rank: 3,
    //     nickname: '林文默',
    //     score: '398'
    //   },
    //   {
    //     rank: 4,
    //     nickname: '别动我羽毛',
    //     score: '376'
    //   },
    // ]
    // let myScore = {
    //   rank: 123,
    //   nickname: 'addiction',
    //   score: 100
    // }

    let res = wx.getSystemInfoSync();
    let menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.setData({
      paddingTop: res.statusBarHeight,
      height: menuButtonInfo.menuButtonBottom - res.statusBarHeight + 10
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  main(){
    wx.reLaunch({
      url: '../qmt/qmt',
    })
  },
  jumpToGame() {
    wx.navigateToMiniProgram({
      appId: 'wx9aec1067417febfd'
    })
  }
})