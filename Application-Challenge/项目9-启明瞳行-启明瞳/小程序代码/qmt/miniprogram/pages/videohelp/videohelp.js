// pages/video/video.js

var util = require('../../utils/util.js');
//语音TTS合成引擎
var plugin = requirePlugin('WechatSI');
var doVoice = require('../../utils/voiceandtext/text2voice.js');
var ace = require('../../utils/ace.js')
var config = require('../../config');

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
    videoSrc: '',
    //摄像头为前置还是后置
    device: 'back',
    videoShow: "开始录制"

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  
  },

  onReady: function () {
    this.audioCtx = wx.createAudioContext('audio');
    this.audioCtx.setSrc('https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/startRecord.wav')

  },
  //返回上一个界面
  back: function() {
    // wx.redirectTo({
    //   url: '../qmt/qmt',
    // })
    wx.reLaunch({
      url: '../qmt/qmt',
    })
  },

  //将录制的小视频发送出去
  send: function(e) {
    var userlogin = wx.getStorageSync('userlogin') || {};
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
        url: config.bizAPI.cosUpload,
        // url: 'http://192.168.199.239:8080/cos/upload',
        filePath: that.data.videoSrc,
        name: 'file',
        formData: {
          filename: filename,
          openid: openid,
        },
        success: function(res) {
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
                openid: openid,
                nickname: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                qmid: userInfo.qmid,
                helpText: '',
                voiceUrl: '',
                imageUrl: '',
                videoUrl: videoUrl,
                formId: e.detail.formId,
                device: 0,
                channel: 2,
                askWay: 3,
                subsId: config.subsMess.askForHelp,  //订阅消息id
              },
              success: function(res) {
                console.log('ask for help result: ', res.data);
                if (res.data.code === 0) {
                  app.globalData.innerAudioContext.stop();
                  ace.hideLoading();
                  ace.showToast('求助发送成，请留意微信通知。')
                  // wx.redirectTo({
                  //   url: '../index/index',
                  // })
                  wx.setStorageSync('lastHelpInfoId', res.data.content);

                } else {
                  wx.showModal({
                    title: '提醒',
                    content: '发送失败',
                  })
                  that.doVoice("求助失败")
                }

              },
              fail: function(e) {
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
  video: function(e) {
    let that = this;
    if (that.data.isRecord) {
      that.stopRecord(e)
    } else {
      that.startRecord(); //开始录制了
      setTimeout(function() {
        that.stopRecord(e); //停止录制   
      }, 10000) // 10s最多录制的时间
    }
  },
  //开始播放相关按钮
  play: function() {
    var that = this;
    if (that.data.isRecord) {
      ace.showToast('正在录制')
      that.doVoice("正在录制")
    } else {
      if (that.data.videoSrc !== '') {
        this.videoContext.play();
        ace.showToast('播放一下刚刚录制的视频吧')
      }
    }

  },
  //开始录制
  startRecord: function() {
    let that = this;
    that.data.videoSrc = "";

    that.videoCamera.startRecord({
      success: (res) => {
        that.startDoRecord(); //开始录制的操作反馈
        that.setData({
          isShowVideo: false,
          isRecord: true, //将录制状态改为已经开始录制了。
          videoShow: "结束录制"
        })
      }
    })
  },
  // 停止录制
  stopRecord: function(e) {
    var that = this;
    that.videoCamera.stopRecord({
      success: (res) => {
        console.log("录制了结束了res.tempVideoPath:::::" + res.tempVideoPath)
        that.stopDoRecord(); //停止录制的操作反馈
        that.setData({
          // isShowVideo: true,
          videoSrc: res.tempVideoPath,
          isRecord: false, //没有开始录制了
          videoShow: "开始录制"
        })
        // that.doVoice("录制结束了，点最底部按钮发送给志愿者求助，或再点击开始录制进行从新录制");
        that.doVoice("录制结束, 点击中间弹框发送求助志愿者，点取消可重新录制");
        wx.showModal({
          title: '提醒',
          showCancel: true,
          content: '求助视频是否发送',
          confirmText: '发送',
          cancelText: '取消',
    
          success: function(res) {
            if (res.cancel) {
              that.doVoice("已经取消发送");
            } else {
              ace.showToast('确定')
              that.send(e); //  TODO   that.send(e)  fromid的文档不好解决


            }
          },
          fail: function(res) {}, //接口调用失败的回调函数
          complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
        })
      }
    })
  },

  // 开始执行录制的操作反馈。
  startDoRecord: function() {
    ace.showToast('录制开始了')
    this.audioCtx.play();
    wx.vibrateShort({
      success: function(e) {
        console.log("开始录制震动")
      }
    })
  },
  // 停止录制的操作反馈
  stopDoRecord: function() {
    ace.showToast('录制结束了')
    wx.vibrateLong({
      success: function(e) {
        console.log("结束录制震动")
      }
    })
  },

  onHide: function() {
    app.globalData.innerAudioContext.stop();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    this.videoCamera = wx.createCameraContext();
    // 解决权限验证的问题
    that.setData({
      camerashow: true
    })
    that.doVoice("点击开始录制按钮开始录制求助短视频")

  },

  //切换摄像头
  checkDevice: function() {
    var that = this;
    if (that.data.device == 'back') {
      that.setData({
        device: 'front'
      })
      that.doVoice("前置开启了");
    } else if (that.data.device == 'front') {
      that.setData({
        device: 'back'
      })
      that.doVoice("后置开启了");
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(option) {
    return {
      title: '启明瞳短视频求助',
      desc: '启明瞳开启新视界',
      path: 'pages/videohelp/videohelp',
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