// miniprogram/pages/voiproom/voiproom.js
var config = require('../../config');
var ace = require('../../utils/ace');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupId: '', // 房间ID，后端创建（随机24位）
    openIdList: [],// 房间了所有用户（包括盲人和志愿者）的OpenId
    askOpenid: '', // 盲人求助的Openid
    selfOpenId:'',// 进入直播间（盲人或者志愿者）的人自己的openid
    helpIdList:[],//志愿者openId
    cid: 0, // createID 创建这个房间用户的OpenID 是求助者盲人
    room_menu: ['麦克风已打开', '', false, '声音已打开', '', false],
    flash: true,  //闪光灯开启状态
    sysInfo: [],  //系统navbar 的高度宽度
    devicePosition: 'back',  //摄像头后置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //设置是否保持常亮状态。仅在当前小程序生效，离开小程序后设置失效
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    that.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
    })
    wx.login({  // 为了获取code，以便sessionKey（生产签名以便创建joinVoIPChat）及时有效
      success(res) {
        if (res.code) {
          wx.request({
            // 用到 多人音视频对话用于实现小程序内多人音视频对话的功能。https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/voip-chat.html
            url: config.bizAPI.joinVoIPChat, 
            data: {
              appId: config.appid, // 启明瞳小程序的APPID
              code: res.code, // wx.login 返回的code
              groupId: (options.groupId != '' && options.groupId != undefined) ? options.groupId : '', // 从分享进来不为空，是加入房间，为空的是盲人第一次创建，后端生成groupId，保证盲人创建分享，从分享进入能够进入同一个直播间
              nonceStr: (options.nonceStr != '' && options.nonceStr != undefined) ? options.nonceStr : '',// 随机字符串，长度应小于 128  从分享进来不为空，是加入房间，为空的是盲人第一次创建，后端生成nonceStr  
            },
            success: function (result) {
             //  console.log(JSON.stringify(result))
             if (result.data.code == 0) {
                that.setData({
                  selfOpenId: result.data.content.openid, // 进入直播间（盲人或者志愿者）的人自己的openid， 
                  session_key: result.data.content.sessionKey, //后端用与生产签名，小程序暂时用不到
                  cid: (options.cid != '' && options.cid != undefined) ? options.cid : result.data.content.openid, // 第一次创建用户的openid，每次分享的时候，分享的传cid ,如果为第一次创的时候 options.cid是空， 
                  groupId: result.data.content.groupId,  //群聊的 ID。同一时刻传入相同 groupId 的用户会进入到同个实时语音房间。
                  nonceStr: result.data.content.nonceStr, // 验证所需的随机字符串
                })
           
                // https://developers.weixin.qq.com/miniprogram/dev/api/media/voip/wx.joinVoIPChat.html
                wx.joinVoIPChat({
                  roomType: 'video',  //房间类型
                  signature: result.data.content.signature, //签名，用于验证小游戏的身份
                  nonceStr: result.data.content.nonceStr, // 验证所需的随机字符串
                  timeStamp: result.data.content.timeStamp,  //验证所需的时间戳
                  groupId: result.data.content.groupId,  //群聊的 ID。同一时刻传入相同 groupId 的用户会进入到同个实时语音房间。
                  success: (res) => {
                    var helpIdList = []; // 志愿者OpenId 
                    for (var i = 0; i < res.openIdList.length; i++) {// i=0 是创建者，从i=1；
                      if (i != 0) {
                        helpIdList.push(res.openIdList[i]);
                      }
                    }
                    that.setData({
                      openIdList: res.openIdList,
                      askOpenid: res.openIdList[0],
                      helpIdList: helpIdList,
                      devicePosition: that.data.devicePosition,
                    })      
                    console.log('现在用户openid：' + that.data.selfOpenId);
                    console.log('求助用户openid：' + that.data.askOpenid);
                    if (that.data.selfOpenId === that.data.askOpenid) {
                      console.log('求助者');
                      /**
                       * https://developers.weixin.qq.com/miniprogram/dev/api/media/voip/wx.onVoIPChatSpeakersChanged.html
                       */
                      wx.onVoIPChatMembersChanged(that.giveMessToBilnd);
                    }
                    else {
                      console.log('志愿者');   
                      wx.onVoIPChatMembersChanged(that.giveMessToVolum);
                    }
                  },
                  fail: (res) => {
                    console.log(res);
                  },
                })
              }else{
                ace.showToast(res.data.errorMsg+"，请重试")
              }
            },
            fail: function (e) {
              console.log(e);
            }
          });
        }else{
          ace.showToast("创建视频客服失败，请返回重试")
        }
      }
    })

    /**
     * 
     */
    setInterval(function () {
      that.onShow;
      console.log('setInterval 10')
    }, 10000);
  },

  consoleError: function (e) {
    console.log(e);
  },
  // 获取用户头像列表
  // getUserInfoByList: function (openidList) {
  //   wx.request({
  //     url: config.bizAPI.getUserInfoByList,
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     data: {
  //       appId: config.appid,
  //       openidList: openidList, // 已加入直播间的用户的openidList
  //     },
  //     success: function (result) {
  //       console.log(result);
  //     }
  //   })
  // },

  /**
   * 
   * @param {*} data 
   */
  giveMessToBilnd: function (data) {
    var currentIdList = data.openIdList;
    if (currentIdList.length < this.data.openIdList.length) {
      ace.showToast('有亲友或志愿者退出了');
      this.setData({
        openIdList: currentIdList,
      })
    } else {
      ace.showToast('有亲友或志愿者加入了');
      this.setData({
        openIdList: currentIdList,
      })
    }
  },

  giveMessToVolum: function (data) {
    console.log('发送消息给志愿者');
    var currentIdList = data.openIdList;
    var bilndid = this.data.askOpenid;
    var index = currentIdList.indexOf(bilndid)
    if(index < 0) {
      ace.showToast("求助者已经退出房间！");
      wx.showModal({
        title: '提示',
        content: '求助者已经退出房间！你是否也退出？',
        success (res) {
          if (res.confirm) {
            wx.exitVoIPChat({
              success: (res) => {},
            })
          } else if (res.cancel) {        
          }
        }
      })
    }
  },

  /**
   * 开启麦克风、关闭麦克风
   * @param {*} e 
   */
  goMuteConfig: function (e) {
    if (e.currentTarget.dataset.v == 'muteMicrophone') {
      if (this.data.room_menu[1] == '') {
        ace.showToast("已关闭麦克风");
        this.setData({
          // room_menu: ['关闭麦克风', '-slash', true, this.data.room_menu[3], this.data.room_menu[4], this.data.room_menu[5]]
          room_menu: ['麦克风已关闭', '-slash', true, this.data.room_menu[3], this.data.room_menu[4], this.data.room_menu[5]]
        })
      } else {
        ace.showToast("已打开麦克风");
        this.setData({
          room_menu: ['麦克风已打开', '', false, this.data.room_menu[3], this.data.room_menu[4], this.data.room_menu[5]]
        })
      }
    } else {
      if (this.data.room_menu[4] == '') {
        ace.showToast("已关闭声音");
        this.setData({
          room_menu: [this.data.room_menu[0], this.data.room_menu[1], this.data.room_menu[2], '声音已关闭', '-slash', true]
        })
      } else {
        ace.showToast("已打开声音");
        this.setData({
          room_menu: [this.data.room_menu[0], this.data.room_menu[1], this.data.room_menu[2], '声音已打开', '', false]
        })
      }
    }
    wx.updateVoIPChatMuteConfig({
      muteConfig: {
        muteMicrophone: this.data.room_menu[2],
        muteEarphone: this.data.room_menu[5]
      }
    })
  },

  //切换闪光灯
  // checkFlash: function () {
  //   if (this.data.flash == true) {
  //     ace.showToast('已关闭闪光灯');
  //     this.setData({
  //       flash: false
  //     })
  //   } else if (this.data.flash == false) {
  //     ace.showToast('已打开闪光灯');
  //     this.setData({
  //       flash: true
  //     })
  //   }
  // },

    //切换摄像头
  checkDevice: function () {
    if (this.data.devicePosition == 'back') {
      ace.showToast('摄像头已前置');
      this.setData({
        devicePosition: 'front'
      })
    } else if (this.data.devicePosition == 'front') {
      ace.showToast('摄像头已后置');
      this.setData({
        devicePosition: 'back'
      })
    }
  },

  /**
   * 结束求助
   */
  goExit: function () {
    if (this.data.selfOpenId === this.data.askOpenid) {
      ace.showToast("中间弹框")
      wx.showModal({
        content: "你确认退出此次视频求助吗？",
        confirmText: "确认",
        cancelText: "取消",
        success: (res) => {
          //点击“确认”时打开设置页面
          if (res.confirm) {
            wx.exitVoIPChat();
            wx.reLaunch({
              url: '../qmt/qmt',
            })
          } else {
            console.log('用户点击取消')
          }
        }
      });
    } else {
      wx.exitVoIPChat();
      wx.reLaunch({
        url: '../qmt/qmt',
      })
    }
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
    wx.exitVoIPChat();
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
    var that = this
    var userInfo = wx.getStorageSync('userInfo');
    var groupId = that.data.groupId;
    var nonceStr = that.data.nonceStr;
    console.log('cid=' + userInfo.openid + '&groupId=' + groupId + '&nonceStr=' + nonceStr);
    return {
      title: '你好，如果现在有空，请点进来帮我看一看，谢谢!',
      path: '/pages/voiproom/voiproom?cid=' + userInfo.openid + '&groupId=' + groupId + '&nonceStr=' + nonceStr,
      imageUrl: that.data.yq_img,
      success: function (res) {
        console.log('转发成功')
      }
    }
  }
})