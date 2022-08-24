// pages/video/video.js

var util = require('../../utils/util.js');
//语音TTS合成引擎
var config = require('../../config');
var ace = require('../../utils/ace.js')
var timerRecordAlert; // 录制提醒计时器
var timerRecord; // 录制提醒计时器
var plugin = requirePlugin('WechatSI');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    camerashow: false, //相机是否显示 , 防止 微信权限相关的提示问题
    videoSrc: '',

    isRecord: false, //是否在录制视频，默认不录制。
    isShowVideo: false, //是否显示

    timer: '', //定时器名字
    percent: '', //项目进度
    percentNum: '0',
    videoSrc: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },


  //获取订阅消息权限
  subscribeMessage() {
    let userlogin = wx.getStorageSync('userlogin');
    console.log(userlogin)
    if (!userlogin) {
      ace.showToast('请先去登录，才能去求助');
      this.goLogin(); // todo 
    } else {
      //需要订阅的消息模板，在微信公众平台手动配置获取模板ID
      let message = config.subsMess.askForHelp;
      //如果总是拒绝（subscriptionsSetting，2.10.1库才支持）
      if (this.versionCompare('2.10.1')) {
        wx.getSetting({
          withSubscriptions: true, //是否同时获取用户订阅消息的订阅状态，默认不获取
          success: (res) => {
            //录音状态
            var recordSetting = res.authSetting['scope.record'];
            if (res.subscriptionsSetting && res.subscriptionsSetting.itemSettings &&
              res.subscriptionsSetting.itemSettings[message] == "reject" || recordSetting == false) {
                ace.showToast('请在屏幕底部同意允许开启录音！否则得删除小程序后重新加载才可再次开启录音发送视频求助')
              //打开设置去设置
              this.openConfirm('检测到您没打开推送或录像权限，是否去设置打开？')
            } else {
              if (res.subscriptionsSetting.mainSwitch == false) {
                if (res.subscriptionsSetting.itemSettings[message] != "accept") {
                  ace.showToast('请允许屏幕下方的获取反馈回复信息通知的权限，也可勾选订阅面板中的“总是保持以上选择，不再询问”长期收到订阅消息');
                }
              }
              wx.requestSubscribeMessage({
                tmplIds: [message],
                success: (res) => {
                  if (res[message] == 'accept') {
                    //用户允许
                    this.send();
                  }
                },
                fail: (res) => {
                  console.info(res)
                },
              })
            }
          }
        })
      } else if (this.versionCompare('2.4.4')) {
        wx.requestSubscribeMessage({
          tmplIds: [message],
          success: (res) => {
            if (res[message] == 'accept') {
              //用户允许
            }
          },
          fail: (res) => {
            console.info(res)
          },
        })
      }
    }
  },
  //打开设置
  openConfirm(message) {
    wx.showModal({
      content: message,
      confirmText: "确认",
      cancelText: "取消",
      success: (res) => {
        //点击“确认”时打开设置页面
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              console.log(res.authSetting)
            },
            fail: (error) => {
              console.log(error)
            }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    });
  },
  //基础库版本比较
  versionCompare(v) {
    const version = wx.getSystemInfoSync().SDKVersion
    if (this.compareVersion(version, v) >= 0) {
      return true
    } else {
      return false
    }
  },

  compareVersion: function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (var i = 0; i < len; i++) {
      var num1 = parseInt(v1[i])
      var num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }
    return 0
  },

  //将录制的小视频发送出去
  send: function () {
    var userlogin = wx.getStorageSync('userlogin');
    var userInfo = wx.getStorageSync('userInfo')
    if (!userlogin) {
      wx.navigateTo({
        url: '../login/login',
      })
    }
    var that = this;
    if (util.isEmpty(that.data.videoSrc)) {
      ace.showToast('没有录制好视频')
    } else {
      var filename = Date.parse(new Date());;
      ace.showLoading('正式上传...')
      //正在上传，开启进度播放功能。
      app.globalData.innerAudioContext.play();
      const uploadTask = wx.uploadFile({
        url: config.bizAPI.uploadFileCos,
        filePath: that.data.videoSrc,
        name: 'file',
        formData: {
          filename: filename,
          openid: userInfo.openid,
        },
        success: function (res) {
          console.log("upload file result: ", res.data);
          console.log("upload file result:code ", JSON.parse(res.data).code); //todo  可能报名<head><title>413 Request Entity Too Large</title></head>  此时会有错误
          if (JSON.parse(res.data).code === 0) {
            ace.showLoading('发送求助信息..')
            let videoUrl = JSON.parse(res.data).content;
            console.log('upload video success, video url is: ', videoUrl);
            var userInfo = wx.getStorageSync('userInfo');
            wx.request({
              url: config.bizAPI.askForHelp,
              header: {
                'content-type': 'application/json'
              },
              method: "POST",
              data: {
                openid: userInfo.openid,
                nickname: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                qmid: userInfo.qmid,
                helpText: '',
                voiceUrl: '',
                imageUrl: '',
                videoUrl: videoUrl,
                channel: 2,
                device: 0,
                askWay: 3,
                subsId: config.subsMess.askForHelp, //订阅消息id
              },
              success: function (res) {
                console.log('ask for help result: ', res.data);
                if (res.data.code === 0) {
                  app.globalData.innerAudioContext.stop();
                  ace.hideLoading();
                  ace.showToast('求助发送成功，请留意微信通知。')
                  wx.reLaunch({
                    url: '../qmt/qmt',
                  })

                } else {
                  wx.showModal({
                    title: '提醒',
                    content: '发送失败',
                  })
                  ace.showToast("求助失败")
                }
                wx.setStorageSync('lastHelpInfoId', res.data.content);
              },
              fail: function (e) {
                console.log('ask for help failed, ', e);
              }
            })
          } else {
            ace.showToast('上传没有成功呀！')
          }
        }
      })
      uploadTask.onProgressUpdate((res) => {
        console.log('上传进度', res.progress)
        console.log('已经上传的数据长度', res.totalBytesSent)
        console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
      })

      //   uploadTask.abort() // 取消上传任务


    }
  },
  //  点击拍摄或者重拍的按钮的时候
  video: function () {
    let that = this;
    if (that.data.isRecord) {
      that.stopRecord()
    } else {
      that.startRecord(); //开始录制了

      setTimeout(function () {
        that.stopRecord(); //停止录制   
      }, 15000) // 10s最多录制的时间
    }
  },

  //开始录制
  startRecord: function () {
    let that = this;
    that.videoCamera.startRecord({
      success: (res) => {
        that.startDoRecord(); //开始录制的操作反馈
        that.setData({
          isShowVideo: false,
          isRecord: true //将录制状态改为已经开始录制了。
        })
        timerRecord = setTimeout(function () {
          clearTimeout(timerRecordAlert); // 清除短片求助的语音提醒计算器
          that.stopRecord(); //停止录制
          // ace.showToast("视频录制完毕，请选择是否发送短视频求助志愿者")
        }, 12000) // 12s最多录制的时间
      }
    })
  },
  // 停止录制
  stopRecord: function () {
    let that = this;
    that.videoCamera.stopRecord({
      success: (res) => {
        console.log("录制了结束了res.tempVideoPath:::::" + res.tempVideoPath)
        clearTimeout(timerRecordAlert); // 清除短片求助的语音提醒计算器
        that.stopDoRecord(); //停止录制的操作反馈
        that.setData({
          isShowVideo: true,
          videoSrc: res.tempVideoPath,
          isRecord: false //没有开始录制了
        })
      }
    })
  },

  // 开始执行录制的操作反馈。
  startDoRecord: function () {
    ace.showToast('录制开始了')
    wx.vibrateShort({
      success: function (e) {
        console.log("开始录制震动")
      }
    })
  },
  // 停止录制的操作反馈
  stopDoRecord: function () {
    ace.showToast('录制结束了，请点击最底部发送给志愿者按钮去求助')
    wx.vibrateLong({
      success: function (e) {
        console.log("结束录制震动")
      }
    })
  },
  /**
   * 缓存中存在用户信息，直接跳转到主界面
   * todo在电脑模拟器上没问题，但是在手机上有问题，先删除
   * todo  继续讲login放到前面
   */
  goLogin: function () {
    ace.showToast('请先登录才能够求助志愿者')
    wx.redirectTo({
      url: '../login/login',
    })
  },
  onHide: function () {
    app.globalData.innerAudioContext.stop();
    clearTimeout(timerRecordAlert); // 清除短片求助的语音提醒计算器
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.videoCamera = wx.createCameraContext();
    // 解决权限验证的问题
    that.setData({
      camerashow: true
    })
    ace.showToast("等待5秒后开始录制求助视频，最多录12秒，嘟一声后开录请说问题")
    timerRecordAlert = setTimeout(function () {
      that.videoCamera.startRecord({
        success: (res) => {
          that.startDoRecord(); //开始录制的操作反馈
          that.setData({
            isRecord: true, //将录制状态改为已经开始录制了。
          })
          timerRecord = setTimeout(function () {
            clearTimeout(timerRecordAlert); // 清除短片求助的语音提醒计算器
            that.stopRecord(); //停止录制
            // ace.showToast("视频录制完毕，请选择是否发送短视频求助志愿者")
          }, 12000) // 12s最多录制的时间，冲
        }
      })
    }, 5000)
    // setTimeout(function () {
    //   that.video(); 
    // }, 2000) 
  },

    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(option) {
    return {
      title: '启明瞳短视频求助',
      desc: '启明瞳开启新视界',
      path: 'pages/video/video',
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  },
})