// pages/text/text.js

const innerAudioContext = wx.createInnerAudioContext();
var util = require('../../../utils/util.js');
var doVoice = require('../../../utils/voiceandtext/text2voice.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    fontSize: '60px',
  },

  bindWordTap: function(event) {
    let fontSize = event.currentTarget.dataset.fontsize + 'px';
    this.setData({
      fontSize: fontSize
    });
  },

  bindSoundTap: function() {
    let text = this.data.text;
    doVoice.textToSpeech(text);
  
  },

  bindCopyTap: function() {
    var that = this;
    var text = this.data.text;
    wx.setClipboardData({
      data: text
    });
    doVoice.textToSpeech("已复制") //todo 改成下载缓存好的语音信息。
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let sysInfo = wx.getStorageSync('sysInfo');
    this.setData({
      text: options.text,
      fontSize: options.fontSize,
      sysInfo: sysInfo
    });
    let fontSize = wx.getStorageSync('fontSize');
    if (!!fontSize) {
      this.setData({
        fontSize: fontSize,
      });
    };
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
    wx.setStorage({
      key: 'fontSize',
      data: this.data.fontSize,
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    wx.setStorage({
      key: 'fontSize',
      data: this.data.fontSize,
    });
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
      title: '文字放大',
      desc: this.data.text,
      path: 'pages/tools/text/text?text=' + this.data.text + '&fontSize=' + this.data.fontSize
    };
  }
})