const app = getApp();
var config = require('../../config');
var doVoice = require('../../utils/voiceandtext/text2voice.js')
var commonRequest = require('../../utils/api.js')
var ace = require('../../utils/ace.js')
//const audioCtx = getApp().globalData.innerAudioContext;

var timerRecordAlert; // 录制提醒计时器
var timerRecord; // 录制提醒计时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sysInfo: {},
    userInfo: null,
    text: '从相机中选择',
    imgUrl: '',
    //摄像头为前置还是后置
    device: 'back',
    //摄像头闪光灯为自动
    flash: 'auto',
    //设置摄像头是否打开 
    cameraOn: false,
    //盲人昵称、openid、微信头像
    nickName: '',
    openId: '',
    avatarUrl: '',
    filePath: '',
    isRecord: false, //是否在录制视频，默认不录制。
    videoSrc: ''
  },

  onLoad: function () {
    var launchOptions = wx.getLaunchOptionsSync();
    console.log(launchOptions);

  },
  /**
   * 缓存中存在用户信息，直接跳转到主界面
   * todo在电脑模拟器上没问题，但是在手机上有问题，先删除
   * todo  继续讲login放到前面
   */
  goLogin: function () {
    ace.showToast('请先去登录，登录后才可求助志愿者')
    wx.redirectTo({
      url: '../login/login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    this.ctx = wx.createCameraContext();
    // console.log("onShow:---"+JSON.stringify(wx.getStorageSync('sysInfo')))
    this.setData({
      cameraOn: true,
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
    //获取权限状态 todo 一直不生效
    //  wx.getSetting({
    //   success(res) {
    //     console.log(res.authSetting)
    //     //摄像头状态
    //     var cameraSetting = res.authSetting['scope.camera'];
    //     if (cameraSetting == false) {
    //       ace.showToast('请在屏幕底部同意允许开启摄像头！');
    //     }
    //   },
    //   fail(res){
    //     ace.showToast('开启摄像头失败！只能返回长按启明瞳小程序进行删除再次进入选择允许摄像头授权才可以继续使用');
    //   }
    // })

    // let muteVoic = wx.createInnerAudioContext(); //播放无声音频唤醒苹果手机扬声器
    // muteVoic.src = 'https://ae.weixin.qq.com/cgi-bin/mmasrai-bin/getmedia?filename=1561537055_ca8d14c7584c805b6c8a56ddb1b64391&filekey=154371917&source=miniapp_plugin';
    // muteVoic.volume = 0;
    // muteVoic.play();


  },


  onReady: function () {
    wx.getSetting({
      withSubscriptions: true, //是否同时获取用户订阅消息的订阅状态，默认不获取
      success(res) {
        //录音状态
        var cameraSetting = res.authSetting['scope.camera'];
        if (!cameraSetting) {
          ace.showToast("");
          // this.openConfirm('没有开启摄像头权限，启明瞳里面智能识别和求助志愿者的功能将都无法使用，请开启')
          ace.showToast("请点击底部弹框，选择允许，才能够使用启明瞳里面智能识别和求助志愿者的功能。")
          wx.authorize({
            scope: 'scope.camera',
            success() {
              ace.showToast("摄像头权限已经授权，可以使用智能识别或者求助志愿者的功能了")
            },
            fail() {
              ace.showToast("授权失败，无法使用摄像头拍照和求助志愿者，请底部弹框的允许授权,或点击更多里面的设置，开启摄像头权限，否则启明瞳里面智能识别和求助志愿者的功能将都无法使用")
            }
          })
        } else {


        }
      }
    })
    /**
     * 1011 扫描二维码
     * 1047 扫描小程序码
     * 1089 聊天顶部进入
     * 1038 从其他小程序返回小程序
     */
    var officialAccountScene = [1011, 1047, 1089, 1038]
    var value = wx.getLaunchOptionsSync()
    let userInfo = wx.getStorageSync('userInfo');
    // setInterval(function() { //针对第一次登录到启明瞳界面的手机唤醒
    //   let muteVoic = wx.createInnerAudioContext(); //播放无声音频唤醒苹果手机扬声器
    //   muteVoic.src = 'https://ae.weixin.qq.com/cgi-bin/mmasrai-bin/getmedia?filename=1561537055_ca8d14c7584c805b6c8a56ddb1b64391&filekey=154371917&source=miniapp_plugin';
    //   muteVoic.volume = 0;
    //   muteVoic.play();
    // }, 5000);

    let words = '请在启明瞳小程序发现栏目关注启明瞳公众号';
    var promise = commonRequest.requestPromise.qmtFollower(config.bizAPI.checkIsFollower, {
      openid: userInfo.openId,
      appId: config.appid,
    }).then(res => {
      if (res.data.content) {

        //粉丝引导逻辑
        if (officialAccountScene.indexOf(value.scene) != -1) {
          //在四种情形中
          words = '请在启明瞳小程序发现栏目关注启明瞳公众号';
        } else {
          //不在四种情形中
          words = '粉丝不在四种情形中';
        }
      } else {
        //非粉丝引导逻辑
        if (officialAccountScene.indexOf(value.scene) != -1) {
          //在四种情形中
          words = '非粉丝在四种情形中';
        } else {
          //不在四种情形中
          words = '请直接粘贴文字到搜索框，进行搜索关注';
        }
      }
    })

  },

  /**
   * 拍照接口
   */
  takePhoto: function () {

    doVoice.innerAudioContext({
      src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
      desc: '咔嚓'
    });
    let that = this;
    this.ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        this.setData({
          filePath: res.tempImagePath,
        });
        var filePath = res.tempImagePath;
        this.goAakHelpPage(filePath, "takephoto");
      }
    });
  },

  /**
   * 拍照求助志愿者
   */
  askImageHelp() {
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      ace.showToast('请先登录后再进行求助操作');
      this.goLogin(); // todo 
    } else {
      this.getSubscribeMessage(this.takePhoto());
      // if(this.isGetSubscribeMessage){
      //   this.takePhoto();
      // }else{
      //   ace.showToast("志愿者无法回复，必须允许")
      // }
    }
  },


  /**
   * 获取订阅消息权限
   * @param {*} callback  获取成订阅消息要执行的操作
   */
  getSubscribeMessage: function (callback) {
    //需要订阅的消息模板，在微信公众平台手动配置获取模板ID
    let message = config.subsMess.askForHelp;
    //如果总是拒绝（subscriptionsSetting，2.10.1库才支持）
    if (this.versionCompare('2.10.1')) {
      wx.getSetting({
        withSubscriptions: true, //是否同时获取用户订阅消息的订阅状态，默认不获取
        success: (res) => {
          if (res.subscriptionsSetting && res.subscriptionsSetting.mainSwitch === false) {
            //打开设置去设置
            this.openConfirm('您没打开接收通知的权限，你将无法收到志愿者回复的信息，请确认去接收订阅消息通知。')
          } else {
            ace.showToast("底部弹框，请先选中最底部的总是保持以上选择,然后选择允许才可以收到志愿者回复")
            wx.requestSubscribeMessage({
              tmplIds: [message],
              success: (res) => {
                if (res[message] == 'accept') { //用户允许
                  ace.showToast("请输入你要求助的问题")
                  callback();
                }
              },
              fail: (res) => {
                ace.showToast("请允许，否则将无法收到志愿者回复的信息")
                console.info(res)
              },
              complete: (res) => {},
            })
          }
        }
      })
    } else {
      ace.showToast("微信版本太低，请升级才能够使用该功能")
    }
  },


  /**
   * 打开设置
   */
  openConfirm(message) {
    ace.showToast('message');
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

  // 拍照识别物体
  doImgTag: function () {
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      ace.showToast('请先登录后再进行求助操作');
      this.goLogin(); // todo 
    } else {
      doVoice.innerAudioContext({
        src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
        desc: '咔嚓'
      });
      this.ctx.takePhoto({
        quality: 'low',
        success: (res) => {
          this.setData({
            filePath: res.tempImagePath,
          });
          var filePath = res.tempImagePath;
          this.goAakHelpPage(filePath, "imgtag")
        }
      });
    }

  },
  // 点击图片场景按钮
  doImgScene: function () {
    doVoice.innerAudioContext({
      src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
      desc: '咔嚓'
    });
    this.ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        this.setData({
          filePath: res.tempImagePath,
        });
        var filePath = res.tempImagePath;

        this.goAakHelpPage(filePath, "imgScene")
      }
    });
  },
  //点击文字识别，进行文字识别
  doOcr: function () {
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      ace.showToast('请先登录后再进行求助操作');
      this.goLogin(); // todo 
    } else {
      doVoice.innerAudioContext({
        src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
        desc: '咔嚓'
      });

      this.ctx.takePhoto({
        quality: 'low',
        success: (res) => {
          this.setData({
            filePath: res.tempImagePath,
          });
          var filePath = res.tempImagePath;

          this.goAakHelpPage(filePath, "ocr");
        }
      });
    }

  },

  //点击文字识别，进行文字识别
  doFace: function () {
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      ace.showToast('请先登录后再进行求助操作');
      this.goLogin(); // todo 
    } else {
      doVoice.innerAudioContext({
        src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
        desc: '咔嚓'
      });

      this.ctx.takePhoto({
        quality: 'low',
        success: (res) => {
          this.setData({
            filePath: res.tempImagePath,
          });
          var filePath = res.tempImagePath;

          this.goAakHelpPage(filePath, "face");
        }
      });
    }

  },

  //选择照片
  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths

        wx.navigateTo({
          url: '../askhelp/askhelp?imgUrl=' + tempFilePaths + '&doType=imgtag'
        })
      },
    })
  },
  /**
   * 发起实时视频求助
   */
  createVoip: function () {
    // wx.navigateTo({
    //   url: '../voiproom/voiproom',
    // })
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      ace.showToast('请先登录后再进行求助操作');
      this.goLogin(); // todo 
    } else {
      var timestamp = Date.parse(new Date());
      wx.navigateTo({
        url: '../videochatehelp/videochatehelp?channel=' + timestamp,
      })
    }

  },

  /**
   * 进入去帮助的界面
   */
  goAakHelpPage: function (imgUrl, doType) {
    wx.navigateTo({
      url: '../askhelp/askhelp?imgUrl=' + imgUrl + '&doType=' + doType,
    })
  },
  //用户不允许使用摄像头时触发
  error(e) {},

  //转到我的页面
  toMine: function () {
    wx.navigateTo({
      url: '../my/my'
    })
  },

  //切换摄像头
  checkDevice: function () {
    if (this.data.device == 'back') {
      ace.showToast('已切换为前置摄像头了');
      this.setData({
        device: 'front'
      })
    } else if (this.data.device == 'front') {
      ace.showToast('已切换为后置摄像头了');
      this.setData({
        device: 'back'
      })
    }
  },

  //切换闪光灯
  checkFlash: function () {
    if (this.data.flash == 'off' || this.data.flash == 'auto') {
      ace.showToast('闪光灯为打开状态');
      this.setData({
        flash: 'torch'
      })
    } else if (this.data.flash == 'torch') {
      ace.showToast('闪光灯为关闭状态');
      this.setData({
        flash: 'off'
      })
    }
  },


  /**
   *短视频求助求助志愿者
   */
  record: function (e) {
    let userlogin = wx.getStorageSync('userlogin');
    if (!userlogin) {
      this.goLogin(); // todo 
    } else {
      wx.getSetting({
        withSubscriptions: true, //是否同时获取用户订阅消息的订阅状态，默认不获取
        success(res) {
          //录音状态
          var recordSetting = res.authSetting['scope.record'];
          if (!recordSetting) {
            ace.showToast('请在屏幕底部弹框，同意允许开启录音，才可以求助志愿者！否则必须再删除小程序后重新加载才可再次开启录音发送视频求助');
            // this.openConfirm('没打开录音的权限，将无法拍摄短视频进行求助')
            wx.authorize({
              scope: 'scope.record',
              success() {
                ace.showToast("录音权限已经授权成功，可录视频求助志愿者")
                // this.getSubscribeMessage(this.goVideo())
                // this.goVideo();
                wx.navigateTo({
                  url: '/pages/video/video',
                })
              },
              fail() {
                ace.showToast("授权失败，无法使用录视频求助志愿者的功能，请重新授权")
              }
            })
          } else {

            wx.navigateTo({
              url: '/pages/video/video',
            })
            //用户允许
            // if (that.data.isRecord) {
            //   that.stopRecord(e)
            // } else {
            //   // that.startRecord(); //开始录制了
            //   this.getSubscribeMessage( that.startRecord())
            //   timerRecord = setTimeout(function () {
            //     clearTimeout(timerRecordAlert); // 清除短片求助的语音提醒计算器
            //     that.stopRecord(e); //停止录制
            //     // ace.showToast("视频录制完毕，请选择是否发送短视频求助志愿者")
            //   }, 17000) // 8s最多录制的时间，冲
            // }

          }
        }
      })
    }
  },

  /**
   * 进入短视频求助
   */
  goVideo: function () {
    wx.navigateTo({
      url: '/pages/video/video',
    })
  },

  //开始录制
  startRecord: function () {
    let that = this;
    that.data.videoSrc = "";
    ace.showToast("最多录12秒，嘟一声后开录请说问题")
    timerRecordAlert = setTimeout(function () {
      that.ctx.startRecord({
        success: (res) => {
          that.startDoRecord(); //开始录制的操作反馈
          that.setData({
            isRecord: true, //将录制状态改为已经开始录制了。
          })
        }
      })
    }, 4500)
  },
  // 停止录制
  stopRecord: function (e) {
    var that = this;
    that.ctx.stopRecord({
      success: (res) => {
        console.log("录制了结束了res.tempVideoPath:::::" + res.tempVideoPath)
        that.setData({
          // isShowVideo: true,
          videoSrc: res.tempVideoPath,
          isRecord: false, //没有开始录制了
        })

        that.stopDoRecord(); //停止录制的操作反馈
        wx.showModal({
          showCancel: true,
          content: '求助短视频是否发送',
          confirmText: '发送',
          cancelText: '取消',
          success: function (res) {
            if (res.cancel) {
              // doVoice.textToSpeech("已经取消发送");
              ace.showToast("已取消");
            } else {
              ace.showToast('发送了，请耐心等待志愿者的微信通知')
              that.sendVideo(e);
            }
          },
          fail: function (res) {}, //接口调用失败的回调函数
          complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
        })
      }
    })
  },

  // 开始执行录制的操作反馈。
  startDoRecord: function () {
    doVoice.innerAudioContext({
      src: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/startRecord.wav',
      desc: '嘟一声'
    });
    wx.vibrateLong({
      success: function (e) {
        console.log("开始录制震动")
      }
    })
  },
  // 停止录制的操作反馈
  stopDoRecord: function () {
    ace.showToast("录制结束。中间弹框，请确定是否要发给志愿者")
    wx.vibrateLong({
      success: function (e) {
        console.log("结束录制震动")
      }
    })
  },


  //将录制的小视频发送出去
  sendVideo: function (e) {
    var userInfo = wx.getStorageSync('userInfo') || {};
    var openid = userInfo.openid;
    if (!openid) {
      wx.navigateTo({
        url: '../login/login',
      })
    }

    var filename = Date.parse(new Date());;
    ace.showLoading('正在上传...')
    //正在上传，开启进度播放功能。
    app.globalData.innerAudioContext.play();
    var that = this;
    const uploadTask = wx.uploadFile({
      url: config.bizAPI.uploadFileCos,
      filePath: that.data.videoSrc,
      name: 'file',
      formData: {
        filename: filename,
        openid: openid,
      },
      success: function (res) {
        console.log("upload file result: ", res.data);
        // console.log("upload file result:code ", JSON.parse(res.data).code); //todo  可能报名<head><title>413 Request Entity Too Large</title></head>  此时会有错误

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
              subsId: config.subsMess.askForHelp, //订阅消息id
            },
            success: function (res) {
              console.log('ask for help result: ', res.data);
              if (res.data.code === 0) {
                // app.globalData.innerAudioContext.stop();
                // doVoice.textToSpeech("发送求助成功，请等结果")
                // doVoice.innerAudioContext({
                //   src: 'https://716d-qmt-test-869cb2-1257376444.tcb.qcloud.la/text2voice/qmt_415.mp3',
                //   desc: "求助发送成功，请留意微信通知。"
                // })
                ace.showToast("求助信息发送成功，请留意微信通知！");
                ace.hideLoading();
                // ace.showToast('求助发送成功，请等待结果')
                wx.setStorageSync('lastHelpInfoId', res.data.content);
              } else {
                ace.showModalTip('提醒,发送失败')
                doVoice.innerAudioContext({
                  src: 'https://716d-qmt-test-869cb2-1257376444.tcb.qcloud.la/text2voice/qmt_426.mp3',
                  desc: "求助失败"
                })
                // doVoice.textToSpeech("求助失败")
              }

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

  },
  //录制短视频结束


  /**
   * 
   * 跳转到启明瞳app
   */
  openApp: function () {
    //文档https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/launchApp.html
    //小程序只有在特定场景才具有打开app的能力

  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (option) {
    return {
      title: '@所有人，推荐你使用盲人都在用的启明瞳智能助盲小程序',
      desc: '@所有人，人工智能全面协助盲人识别图片信息',
      path: 'pages/qmt/qmt',
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 销毁播放器
    doVoice.innerAudioContextDestroy();
    console.log("qmt-->onHide");
    clearTimeout(timerRecordAlert);
    clearTimeout(timerRecord);
    this.setData({
      cameraOn: false,
      isRecord: false, //没有开始录制了
    });
  },

})