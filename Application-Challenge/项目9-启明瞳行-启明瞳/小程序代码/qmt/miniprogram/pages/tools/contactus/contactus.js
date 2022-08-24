// pages/my/my.js
import { openQYWXCustomerServiceChat, openQYWXAfterSalesServiceChat,openQYWXAPPServiceChat } from "../../../utils/util";

const innerAudioContext = getApp().globalData.innerAudioContext;
// 初始化并触发跳转，支持链式调用
const app = getApp()
const userInfo = {
  avatar: '',
  nickname: '',
  openid: ''
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ariaHidden: false, //默认不隐藏 无障碍读屏

    logged: false,
    userInfo: null,
    systemInfo: null,
    icon: "/image/ic_user_unlogin.png",
    tucaoExtraData: {
      id: '35020', //我能帮帮忙:	35122	  启明瞳:	35020	 无障碍科技:	30778	
      /* 来源为吐个槽上申请的产品ID ，查看路径：tucao.qq.com ->产品管理->ID */
    },
    brand: '',
    model: '',
    version: '',
    system: '',
    title: '联系我们'
  },

  binderror: function (e) {
    console.log("图片：" + e.detail)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    //let val = wx.getStorageSync('loginMsg');
    this.setData({
      //userInfo: val,
      logged: true,
     
    })

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
      ariaHidden: false,
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
			ariaHidden: true
		})
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
  onShareAppMessage: function (option) {
    return {
      title: '@所有人，盲人圈都在关注盲人自己的媒体，赶快进入添加，获取加入二维码',
      desc: '所有人，盲人圈都在关注盲人自己的媒体，赶快进入添加，获取加入二维码',
      path: 'pages/tools/contactus/contactus',
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  },
  	/**
	 * 打开企业微信客服
	 */
	openQYWXChat: function () {
		openQYWXCustomerServiceChat()
  },
  /**
   * 打开启明店售后客服
   */
  openQYWXAfterSalesServiceChat:function(){
    openQYWXAfterSalesServiceChat()
  },
  
  /**
   * 打开启明应用APP客服
   */
  openQYWXAPPServiceChat:function(){
    openQYWXAPPServiceChat()
  },
  /**
   * @method makePhoneCall
   * todo 后续需要通过判断电话号码是否为 数字
   */
  setClipboard: function (event) {
    wx.setClipboardData({
      data: event.currentTarget.dataset.content,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
            //短震动提示一下
            wx.vibrateShort({
            })
          }
        })
      }
    })
  }
})

