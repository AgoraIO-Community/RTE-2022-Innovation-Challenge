const config = require("../../config");
const util = require("../../utils/util");
// pages/my/my.js
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
    title: '我的'

  },

  binderror: function (e) {
    console.log("图片：" + e.detail)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad function")
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      logged: true,
      url: 'https://testqmt-1256074910.cos.ap-beijing.myqcloud.com/20180827/oLwAN5AoMjE6j7I8BsjBQRDeMKLA/zjnnjnjn.png',
      icon: "/image/ic_user_unlogin.png"
    })

    try {
      var res = wx.getSystemInfoSync()
    } catch (e) {
      // Do something when catch error
    }
    // wx.login({
    //   success(res) {
    //     const code = res.code;
    //     wx.getWeRunData({
    //       success(res) {
    //         // 拿 encryptedData 到开发者后台解密开放数据
    //         const encryptedData = res.encryptedData
    //         const iv = res.iv;
    //         wx.request({
    //           url: config.bizAPI.getWeRun,
    //           data: {
    //             appid: config.appid,
    //             encryptedData: encryptedData,
    //             iv: iv,
    //             code: code,
    //           },
    //           method: "GET",
    //           success:function (res) {
                
    //             var stepInfoList = JSON.parse(res.data.content).stepInfoList;
    //             for(var i = 0; i < stepInfoList.length; i++) {
    //               stepInfoList[i].timestamp = util.timestampFormat(stepInfoList[i].timestamp*1000, 'Y-M-D');
    //             }
    //             console.log(stepInfoList);
    //           },
    //           fail: function(res) {
    //             console.log('获取用户步数出错！');
    //           }
    //         })
    //         console.log(res);
    //         // 或拿 cloudID 通过云调用直接获取开放数据
    //         const cloudID = res.cloudID
    //       }
    //     })
    //   },
    // })

    this.setData({
      icon: "/image/ic_user_unlogin.png",
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
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=16_Zl2HA5mE2CPXtZ1PgScH9L6x7kS8lwc_ryd4SmqpWG4myGyntNXybwyPJsaYCJ4S5BRPymceYgeyLgUYwiyfkw3F_ynFl-SPN3I3vzNNCHpqmgCD5nQjuBuSu1PkDYMZBBuhvb0L8rfFxITbXDSeACAIOD',
      data: {
        "touser": "oUkCajt2sP9_MYjrg26kGFQLnXR8",
        "weapp_template_msg": {
          "template_id": "Ffir7JvVK4j9Jc5vqNubGXCbu7nI1eV83R3iFNtis1U",
          "page": "pages/qmt/qmt",
          // "form_id": "FORMID",
          "data": {
            "keyword1": {
              "value": "339208499"
            },
            "keyword2": {
              "value": "2015年01月05日 12:30"
            },
            "keyword3": {
              "value": "腾讯微信总部"
            },
            "keyword4": {
              "value": "广州市海珠区新港中路397号"
            }
          },
          "emphasis_keyword": "keyword1.DATA"
        }
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log("模拟请求" + JSON.stringify(res));
        // this.setData({
        //   testpaper: res.data.testpaper,
        //   teacher: res.data.teacher
        // });
      },
      error: function (err) {
        console.log("模拟请求" + JSON.stringify(err));
      }

    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //跳转到设置界面
  setting: function () {
    wx.navigateTo({
      url: '../setting/setting',
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (option) {
    return {
      title: '有人@我，这是我的启明瞳小程序，专属盲人的小程序',
      desc: '@所有人，启明瞳开启盲人新视界，内容来源于来自盲人新视界微信公共账号',
      path: 'pages/my/my',
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
            wx.vibrateShort({})
          }
        })
      }
    })
  },


})