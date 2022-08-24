var app = getApp();
var config = require('../../config');
var doVoice = require('../../utils/voiceandtext/text2voice.js')
var util = require('../../utils/util.js');
//要发送的对话列表
var gChatListData = [];
var voiceUrl = [];
var ace = require('../../utils/ace.js')

const clouddbapi = require('../../utils/clouddbapi.js');
const innerAudioContext = getApp().globalData.innerAudioContext;
// const pdjs = getApp().globalData.pdjs;

var playingSrc = ''
var playingIndex = 0

Page({
  data: {
    x: "300rpx",
    y: "400rpx",
    startX: '',
    startY: '',
    isPlaying: '',
    winHeight: "", //窗口高度
    focus: false,
    voice_fileid: '',
    ask_word: '',
    inputValue: '',

    bottom_content: 900,
    bottom_panel: 300, //控制文字输入内容、键盘bottom的值，保证相应的距离

    sendType: 0, //0为键盘输入，1为语音输入
    isLongPress: false, // 录音按钮是否正在长按
    recordClicked: false, // 判断手指是否触摸录音按钮
    recorderManager: null, // 微信录音管理对象
    focus: false,
    slide_time: 0,
    slide_flag: 0,
    flag_1: 0,
    time_duration: 0,
    logs: [],
    voice_flag: 0,
    word_flag: 0,
    //============启明瞳主页配置 START==============
    userInfo: null,
    text: '从相机中选择',
    imgUrl: '',
    //摄像头为前置还是后置
    device: 'back',
    //设置摄像头是否打开 
    cameraOn: false,
    //盲人昵称、openid、微信头像
    nickName: '',
    openId: '',
    avatarUrl: '',
    filePath: '',
    localPath: '',
    isRecord: false, //是否在录制视频，默认不录制。
    videoSrc: '',
    //============启明瞳主页配置 END==============

    //============chat.js内的data信息 START=================
    //用户的输入
    askWord: '',
    //是否发送信息,true 为不发送
    sendButtDisable: true,
    userInfo: {},
    //
    chatList: [],
    //scroll-into-view属性：值应为某子元素id（id不能以数字开头）。设置哪个方向可滚动，则在哪个方向滚动到该元素
    scrolltop: '',
    userLogoUrl: '/image/user_default.png',
    keyboard: true,

    //录音文件地址
    filePath: null,
    contactFlag: true,
    // canvas高宽
    canvasWidth: 100,
    canvasHeight: 100,

    aiResult: '正在识别中，请稍等，识别结果仅供参考，可以左右滑动输入语音或文字求助志愿者',
    // 印刷体识别
    ocrImgUrl: '',
    ocrResult: [],
    // 识别图片内容信息，并以标签的形式显示
    conImgUrl: '',
    conResult: [],
    // 语音合成
    recordUrl: '',
    showRecord: false,
    textRec: '',
    voice: '',
    // 求助志愿者
    eventType: '',
    scrollTop: 0,
    isBottomHidden: false
  },
  //============chat.js内的data信息 END=================

  //================自定义函数区 START==================

  bindKeyInput: function (e) {
    var that = this;
    this.setData({
      inputValue: e.detail.value,
      scrollTop: 500 * 100
    })
  },

  /**
   * 
   */
  PhotoToVoice: function () {
    //之前的页面要拍张照片
    this.audioCtx.play();
    let that = this;
    this.ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        console.log('PhotoToVoice');
        this.setData({
          filePath: res.tempImagePath,
        });

      }
    });
    //swiper翻面
  },
  /**
   * 
   */
  touchEnd: function (e) {
    console.log(' touchEnd: function (e)=========' + JSON.stringify(e))
    times = 0;
  },

  //================实现录音功能与滑动组合============
  /**
   * 手动模拟按钮长按，
   */
  // 获取录音按钮提交事件的formId
  getVoiceFormId_(e) {
    this.setData({
      formId_: e.detail.formId
    })
  },

  /**
   * 
   */
  longPressStart(e) {
    console.log('longPressStart')
    this.slide_time = 0;
    this.slide_flag = 0;
    let self = this
    self.setData({
      recordClicked: true,
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      //记录初始坐标
    })
    setTimeout(() => {
      if (self.data.recordClicked == true) {
        console.log('vibrate-true');
        wx.vibrateShort()
        self.executeRecord()
      }
    }, 350)
  },
  /**
   * 语音按钮长按结束
   */
  longPressEnd() {
    this.goLogin();
    console.log('longPressEnd')
    if (this.slide_flag_left == 1) {

    }
    this.setData({
      recordClicked: false
    })
    // 第一次授权，
    if (!this.data.recorderManager) {
      this.setData({
        isLongPress: false
      })
      return
    }
    if (this.data.isLongPress === true) {
      this.setData({
        isLongPress: false
      })
      ace.hideToast()
      this.data.recorderManager.stop()
    }
  },


  /**
   * 长按上滑取消功能
   */
  touchMove_Voice: function (e) {
    console.log(this.slide_time)
    let startX = this.data.startX
    let startY = this.data.startY
    let x_Temp = e.changedTouches[0].clientX
    let y_Temp = e.changedTouches[0].clientY
    let delt_y = y_Temp - startY
    let delt_x = x_Temp - startX
    if (delt_y < 0 && Math.abs(delt_y / delt_x) >= 6) {
      this.slide_time++;
    }
    if (delt_x < 0 && Math.abs(delt_x / delt_y) >= 6) {
      this.slide_flag_left = 1;
    }
    if (this.slide_time >= 20) {
      this.slide_flag = 1
      util.showToast('text', '松开取消录音')
    } else {
      this.slide_flag = 0;
    } //slide_flag为1表示上滑，为0表示非上滑
  },

  /**
   * 执行录音逻辑
   */
  executeRecord() {
    let self = this
    self.setData({
      isLongPress: true
    })
    wx.getSetting({
      success: (res) => {
        let recordAuth = res.authSetting['scope.record']
        if (recordAuth == false) { //已申请过授权，但是用户拒绝
          wx.openSetting({
            success: function (res) {
              let recordAuth = res.authSetting['scope.record']
              if (recordAuth == true) {
                util.showToast('success', '授权成功')
              } else {
                util.showToast('text', '请授权录音')
              }
              self.setData({
                isLongPress: false
              })
            }
          })
        } else if (recordAuth == true) { // 用户已经同意授权
          self.startRecord_Voice()
        } else { // 第一次进来，未发起授权
          wx.authorize({
            scope: 'scope.record',
            success: () => { //授权成功
              util.showToast('success', '授权成功')
            }
          })
        }
      },
      fail: function () {
        util.showToast('error', '鉴权失败，请重试')
      }
    })
  },
  /**
   * 开始录音
   */
  startRecord_Voice() {
    console.log('startRecord_Voice')
    let self = this
    util.showToast('text', '开始录音', {
      duration: 120000
    })
    const recorderManager = self.data.recorderManager || wx.getRecorderManager()
    const options = {
      duration: 120 * 1000,
      format: 'mp3'
    }
    recorderManager.start(options)
    self.setData({
      recorderManager,
    })
    recorderManager.onStop((res) => {
      if (this.slide_flag == 0) {
        if (res.duration < 2000) {
          //todo  增加语音提示
          util.showToast('text', '录音时间太短')
        } else {
          this.setData({
            time_duration: Math.round(res.duration / 1000)
          })
          self.sendAudioMsg(res)
        }
      } else if (this.slide_flag == 1) {
        //todo  增加语音提示
        util.showToast('text', '录音成功取消')
      }
    })
  },

  /**
   * 发送语音消息
   */
  sendAudioMsg: function (res) {
    var that = this;
    ace.showLoading('发送中...')
    let tempFilePath = res.detail.tempFilePath
    console.log(res)
    let temp = 0;
    // 将图片上传至云存储空间
    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: `voice/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.mp3`,
      // 指定要上传的文件的小程序临时文件路径
      filePath: tempFilePath,
      // 成功回调
      success: res => {
        console.log('上传成功' + JSON.stringify(res) + '云地址：' + tempFilePath)
        ace.showToast('上传成功,发送中...')
        ace.hideLoading();
        this.setData({
          currentTab: 1,
          voice_fileid: res.fileID,
        })
        this.showAudio(res);
      },
    })
  },

  showAudio: function (event) {
    this.setData({
      voice_flag: 1,
      word_flag: 0,
    })
    console.log("addChat")
    this.getTempFileURL_Voice()
  },
  /**
   * 文字输入上传函数
   */
  sendMessage: function (content) {
    this.goLogin();
    console.log(content);
    if (content.detail == '') {
      ace.showToast("提问不可以为空");
      return;
    }
    this.setData({
      ask_word: content.detail,
      currentTab: 1,
      word_flag: 1,
      voice_flag: 0,
      inputValue: '',
    })
    // formId随便传的，不为空即可
    this.addChat(this.data.ask_word, 'r', '123456')
    var query = wx.createSelectorQuery() //创建节点查询器 query
    query.select('.weui-input').boundingClientRect() //这段代码的意思是选择Id=the-id的节点，获取节点位置信息的查询请求
    query.exec(function (res) {
      console.log(res)
    })
  },

  /**
   * 播放、暂停音频
   * @param {*} e 
   */
  voiceClick: function (e) {
    console.log('page,-----voiceClick')
    var index = e.detail.index
    playingIndex = index
    var playing = e.detail.playing
    var src = gChatListData[index].text;
    console.log('播放url', src)
    if (playingSrc != src) {
      innerAudioContext.stop()
      playingSrc = src
      doVoice.innerAudioContext({
        src: gChatListData[index].text,
        desc: "",
        download: 'yes'
      })

    } else if (!playing) {
      console.log('暂停中---->播放')
      doVoice.innerAudioContext({
        src: gChatListData[index].text,
        desc: "",
        download: 'yes'
      })
    } else {
      console.log('播放中---->暂停');
      innerAudioContext.stop();
    }
  },

  setStatus: function (sta = false) {
    for (var i = 0; i < gChatListData.length; i++) {
      gChatListData[i].playing = false;
    }
    if (sta) {
      gChatListData[playingIndex].playing = true;
    }
    this.setData({
      chatList: gChatListData,
    })
  },
  //=============chat.js函数内自定义函数 START==================

  handleCommonFunctions: function (e) {
    console.log(e);
    switch (e.detail) {
      case '0':
        this.doOcr();
        break;
      case '1':
        this.doImgTag();
        break;
      case '2':
        this.doScene();
        break;
      case '3':
        this.doFace();
        break;
      default:
        break;
    }
  },

  /**
   * 
   */
  doOcr: function () {
    this.setData({
      mode: 'doWordIndentify',
      eventType: '图片文字识别',
    });
    this.callFunction(this.data.eventType);
    // doVoice.textToSpeech("进入了文字识别");
    this.addChat("图片文字识别", 'a');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
      desc: '图片文字识别',
      download: 'yes'
    })
  },

  /**
   * 
   */
  doImgTag: function () {
    this.setData({
      mode: 'detectImage',
      eventType: '智能识别物体',
    });
    this.callFunction(this.data.eventType);
    // doVoice.textToSpeech("智能识别物体");
    this.addChat("智能识别物体", 'a');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_126_tupianneirongshibie.mp3',
      desc: '智能识别物体',
      download: 'yes'
    })
  },

  doFace: function () {
    this.setData({
      mode: 'doFaceIndentify',
      eventType: '图片人脸识别',
    });
    this.callFunction(this.data.eventType);
    this.addChat("图片人脸识别", 'a');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
      desc: '图片人脸识别',
      download: 'yes'
    })
  },

  doScene: function () {
    this.setData({
      mode: 'doSceneIndentify',
      eventType: '图片场景识别',
    });
    this.callFunction(this.data.eventType);
    this.addChat("图片场景识别", 'a');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
      desc: '图片场景识别',
      download: 'yes'
    })
  },

  /**
   * 预览图片
   */
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
    })
  },

  /**
   * @param {Object} eventType
   * @description 图片处理统一入口
   * 1)上传图片到云端
   * 2）设置替换url
   * 3）调运云函数开始处理
   */
  commonIndentify: function (eventType) {
    let that = this;
    // var ocrStr = "文字识别";
    this.addChat(eventType, 'a');
    this.uploadImage(eventType); //将图片链接变成http格式
    that.analyzeStart(eventType);
  },

  uploadImage: function (eventType) {
    console.log(this.data);
    var filename = Date.parse(new Date());
    var userInfo = wx.getStorageSync('userInfo');
    wx.uploadFile({
      url: config.bizAPI.cosUpload,
      name: 'file',
      formData: {
        filename: filename,
        openid: userInfo.openid
      },
      filePath: this.data.imgUrl,
      success: (res) => {

        var result = JSON.parse(res.data);
        console.log(result);
        if (result.code == 0) {
          this.setData({
            imgUrl: result.content,
          });
          this.getTempFileURL(eventType);
          console.log("图片上传成功");
        }

      },
      fail: (err) => {
        console.log(err);
        ace.hideLoading();
      },
    });
  },

  /**
   * 
   */
  getTempFileURL: function (eventType) {
    this.setData({
      hasUploaded: true,
    });
    //看图说话调用的非云端接口
    // if (!!eventType && '看图说话' !== eventType) {
    this.callFunction(eventType);

  },


  /**
   * 
   */
  getTempFileURL_Voice: function () {
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: this.data.voice_fileid,
      }],
    }).then((res) => {
      var that = this;
      ace.hideLoading();
      const files = res.fileList;
      if (!files.length) {
        that.analyzeFail(that.data.eventType);
        return;
      };
      voiceUrl.push(files[0].tempFileURL)
      console.log(files[0].tempFileURL)
      this.setData({
        hasUploaded: true,
      });
      //语音求助 formid不为空
      this.addChat(files[0].tempFileURL, 'v', "223541")
    }).catch(() => {
      ace.hideLoading();
      console.log("error")
    });
  },


  callFunction: function (eventType) {
    var that = this;
    console.log(that.data.imgUrl);
    ace.hideLoading();
    let descriptionWord = "";
    if ("智能识别物体" === eventType) {
      // paddlejs实现，可产生推理结果，但无转换算子
      // wx.downloadFile({
      //   url: that.data.imgUrl,
      //   success: function (res) {
      //     console.log(res.tempFilePath);
      //     wx.getFileSystemManager().readFile({
      //       filePath: res.tempFilePath,
      //       complete: res => {
      //         var buffer = res.data;
      //         var x = new Uint8Array(buffer);

      //         console.log(x);
      //         var imgdata = {
      //           data: x,
      //           width: 300,
      //           height: 400,
      //         }
      //         pdjs.predict(imgdata, function (data) {
      //           console.log(data);
      //         })

      //       },
      //       success: res => {
      //         console.log(res);
      //       }
      //     })
      //   }
      // })

      // 腾讯云识别
      wx.getFileSystemManager().readFile({
        filePath: that.data.imgUrl,
        encoding: 'base64',
        complete: res => {
          console.log(res);
        },
        success: res => {
          console.log(res);
        }
      })

      wx.request({
        url: config.bizAPI.getInfoByImage,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          imageUrl: that.data.imgUrl,
          engineType: 1, //百度引擎图片识别
        },
        success: function (res) {
          console.log(res);
          var rescode = res.data.code;
          console.log(rescode);
          if (!res || rescode != 0) {
            that.analyzeFail(that.data.eventType);
            return;
          }

          let content = res.data.content;
          var des = content.imgResult.currencyList;
          console.log(des);
          for (let i = 0; i < des.length; i++) {
            let con = des[i].name + "准确率为百分之" + des[i].confidence
            descriptionWord += con + ","
          };
          console.log(descriptionWord);
          that.addChat([descriptionWord], 'l');
          doVoice.textToSpeech(descriptionWord);
        },
        fail: function (res) {
          console.error(res);
          ace.hideLoading();
          that.analyzeFail(that.data.eventType);
        }
      });

    }

    if ("图片文字识别" === eventType) {
      var currentTime = new Date().getTime();
      if (util.canUseOcr(currentTime)) {

        wx.request({
          url: config.bizAPI.getOcr,
          method: "GET",
          data: {
            imgUrl: that.data.imgUrl,
            localPath: that.data.filePath,
          },
          success: function (res) {
            console.log(res);
            var rescode = res.data.code;
            console.log(rescode);
            if (!res || rescode != 0) {
              that.analyzeFail(that.data.eventType);
              return;
            }
            let content = res.data.content;
            if (content == '') {
              that.analyzeFail(that.data.eventType);
              return;
            }
            for (let i = 0; i < content.length; i++) {
              let con = content[i];
              descriptionWord += con
            };
            console.log(descriptionWord);
            that.addChat([descriptionWord], 'l');
            doVoice.textToSpeech(descriptionWord);
          },
          fail: function (res) {
            console.error(res);
            ace.hideLoading();
            that.analyzeFail(that.data.eventType);
          }
        });


        // 腾讯云识别
        // wx.request({
        //   url: config.bizAPI.getInfoByOcr,
        //   method: "GET",
        //   data: {
        //     imageUrl: that.data.imgUrl,
        //   },
        //   success: function (res) {
        //     console.log(res);
        //     var rescode = res.data.code;
        //     console.log(rescode);
        //     if (!res || rescode != 0) {
        //       that.analyzeFail(that.data.eventType);
        //       return;
        //     }
        //     let content = JSON.parse(res.data.content);
        //     var des = content.TextDetections;
        //     for (let i = 0; i < des.length; i++) {
        //       let con = des[i].DetectedText;
        //       descriptionWord += con + ","
        //     };
        //     console.log(descriptionWord);
        //     that.addChat([descriptionWord], 'l');
        //     doVoice.textToSpeech(descriptionWord);
        //   },
        //   fail: function (res) {
        //     console.error(res);
        //     ace.hideLoading();
        //     that.analyzeFail(that.data.eventType);
        //   }
        // });
      } else {
        that.analyzeFail("今天文字识别次数已达到上线，可以求助志愿者。");
      }
    }

    if ("图片人脸识别" === eventType) {
      // 腾讯云识别
      wx.getFileSystemManager().readFile({
        filePath: that.data.imgUrl,
        encoding: 'base64',
        complete: res => {
          console.log(res);
        },
        success: res => {
          console.log(res);
        }
      })

      wx.request({
        url: config.bizAPI.getFaceByImage,
        method: "GET",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          imageUrl: that.data.imgUrl,
        },
        success: function (res) {
          console.log(res);
          var rescode = res.data.code;
          console.log(rescode);
          if (!res || rescode != 0) {
            that.analyzeFail(that.data.eventType);
            return;
          }

          let content = res.data.content;
          var des = content.imgResult.faceList;
          console.log(des);
          for (let i = 0; i < des.length; i++) {
            let con = ''
            console.log(des[i].age.value);
            if (des[i].age.value != null) {
              con = con + '此人像年龄约' + des[i].age.value;
            }
            if (des[i].expression.value != null) {
              con = con + '，面部表情为' + des[i].expression.value;
            }
            if (des[i].sex.value != null) {
              con = con + '，性别为' + des[i].sex.value
            }
            if (des[i].score.value != null) {
              con = con + '，图片得分为' + des[i].score.value;
            }
            descriptionWord += con + ","
          };
          console.log(descriptionWord);
          that.addChat([descriptionWord], 'l');
          doVoice.textToSpeech(descriptionWord);
        },
        fail: function (res) {
          console.error(res);
          ace.hideLoading();
          that.analyzeFail(that.data.eventType);
        }
      });

    }

    if ("图片场景识别" === eventType) {
      // 腾讯云识别
      wx.getFileSystemManager().readFile({
        filePath: that.data.imgUrl,
        encoding: 'base64',
        complete: res => {
          console.log(res);
        },
        success: res => {
          console.log(res);
        }
      })

      wx.request({
        url: config.bizAPI.getSceneByImage,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          imageUrl: that.data.imgUrl,
        },
        success: function (res) {
          console.log(res);
          var rescode = res.data.code;
          console.log(rescode);
          if (!res || rescode != 0) {
            that.analyzeFail(that.data.eventType);
            return;
          }

          let content = res.data.content;
          console.log(content)
          var des = content.imgResult.sceneList;
          console.log(des);
          for (let i = 0; i < des.length; i++) {
            let con = des[i].name + "准确率为百分之" + des[i].confidence
            descriptionWord += con + ","
          };
          console.log(descriptionWord);
          that.addChat([descriptionWord], 'l');
          doVoice.textToSpeech(descriptionWord);
        },
        fail: function (res) {
          console.error(res);
          ace.hideLoading();
          that.analyzeFail(that.data.eventType);
        }
      });

    }
    that.analyzeSuccess(that.data.eventType);
  },



  /**
   * 底部按钮操作
   * 进入启明瞳重新拍照
   */
  doQmt: function () {
    wx.reLaunch({
      url: '/pages/qmt/qmt',
    })
  },

  /**
   * 选择照片
   */
  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          localPath: res.tempFilePaths
        })
        var tempFilePaths = res.tempFilePaths;
        wx.navigateTo({
          url: '../askhelp/askhelp?imgUrl=' + tempFilePaths
        })
      },
    })
  },

  /***---  AI分析的加载过程，主要播放给盲人提示加载 ---***/
  //开始分析了
  analyzeStart: function (text) {
    app.globalData.innerAudioContext.stop();
    util.showLoading(text + "...");
    app.globalData.innerAudioContext.play();
    wx.vibrateShort({})
  },
  // 分析成功了
  analyzeSuccess: function (text) {
    util.hideLoading();
    wx.vibrateLong({});
    util.showSuccess(text + "成功了");
    app.globalData.innerAudioContext.stop();
  },
  //分析失败了
  analyzeFail: function (text) {
    var that = this;
    util.hideLoading();
    wx.vibrateLong({});
    app.globalData.innerAudioContext.stop();
    doVoice.textToSpeech(text + '结果不理想,请求助志愿者！');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/jieguobulixiangqingqiuzhuziyuanzhe.mp3',
      desc: text + "结果不理想,请求助志愿者",
      download: 'yes'
    })
    that.addChat(['结果不理想,请求助志愿者！'], 'l');
  },

  /***---结束---***/

  /***--- 聊天框里面一些相关函数---***/
  // 聊天框的 头像  我的页面
  toMy: function () {
    wx.navigateTo({
      url: '../my/my'
    });
  },


  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function (word, orientation, formId) {
    this.addChatWithFlag(word, orientation, true, formId);

    if (orientation == 'l') {
      this.setData({
        aiResult: word
      })
    }
  },

  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function (word, orientation, scrolltopFlag, formId) {
    let ch = {
      'text': word,
      'time': new Date().getTime(),
      'orientation': orientation,
      'playing': false,
      'duration': this.data.time_duration,
    };
    gChatListData.push(ch);
    let charlenght = gChatListData.length;
    console.log(gChatListData);
    let data = {
      chatList: gChatListData
    };
    if (scrolltopFlag) data.scrolltop = 'roll' + charlenght;
    this.setData(data);
    // 发送文字和语音情况下 fromId（formId_）不为空，其他情况为ai接口
    if (!!formId || !!this.data.formId_) {
      this.askVolunteerHelp(formId);
    }
  },

  /**
   * 获取input 输入框的里面的输入的文本的内容
   */
  sendChat: function (e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    this.setData({
      askWord: word,
      sendButtDisable: true,
    });
  },

  /**
   * 盲人填写信息发起志愿者求助
   */
  askVolunteerHelp: function (formId) {
    var that = this
    var help = that.data.ask_word
    var voiceIndex = voiceUrl.length - 1;
    console.log(formId);
    var userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo.nickName + "====" + userInfo.avatarUrl)
    var filename = Date.parse(new Date());
    console.log("imgUrl === " + that.data.imgUrl);
    if (voiceUrl[voiceIndex] != undefined && this.data.word_flag == 0 && this.data.voice_flag == 1) { //是语音
      if ((that.data.imgUrl.substr(0, 4) == 'http') && ((voiceUrl[voiceIndex].substr(0, 4) == 'http') || (this.data.ask_word != ''))) {
        //云地址
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
            voiceUrl: voiceUrl[voiceIndex],
            imageUrl: that.data.imgUrl,
            device: 0,
            videoUrl: '',
            channel: 2,
            askWay: 2,
            subsId: config.subsMess.askForHelp, //订阅消息id
          },
          success: function (res) {
            console.log(that.data.time_duration)
            console.log("请求的结果:" + JSON.stringify(res.data));
            ace.showToast("求助发送成功，请留意微信通知。");
            wx.setStorageSync('lastHelpInfoId', res.data.content);
            that.setData({
              ask_word: '',
            })
          },
          fail: function (res) {
            console.log(res);
          }
        })
      } else { //不是本地的代表前面传的时候出错了，直接报错啦


      }
    } else if (this.data.word_flag == 1 && this.data.voice_flag == 0) { //文字
      if ((that.data.imgUrl.substr(0, 4) == 'http') && (this.data.ask_word != '')) {
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
            helpText: help,
            voiceUrl: '',
            imageUrl: that.data.imgUrl,
            subsId: config.subsMess.askForHelp, //订阅消息id
            device: 0,
            askWay: 1,
            // 求助渠道: 1 启明瞳APP; 2 启明瞳微信小程序; 3 启明瞳qq小程序
            channel: 2
          },
          success: function (res) {
            console.log(res);
            ace.showToast("求助发送成功，请留意微信通知。");
            wx.setStorageSync('lastHelpInfoId', res.data.content);
          },
          fail: function (res) {
            console.log(res);
          },
          complete: (res) => {},
        })
      }
      else { //不是本地的代表前面传的时候出错了，直接报错啦
        console.log('error照片语音无法上传')
      }
    }
  },

  /*
   * 通过“我能帮帮忙”服务号向志愿者发送模板消息
   */
  submitInfo: function (e) {
    console.log("FormId:" + e.detail.formId);
    var that = this
    if (!that.data.askWord) {
      util.showModal('提示', '不能发送空消息，请重试')
      return
    }
    var help = that.data.askWord
    that.addChat(that.data.askWord, 'r');
    that.setData({
      askWord: ''
    })
    wx.getStorage({
      key: 'loginMsg',
      success: function (res) {
        that.setData({
          nickName: JSON.parse(res.data).nickName,
          openId: JSON.parse(res.data).openId,
          avatarUrl: JSON.parse(res.data).avatarUrl
        })
        wx.getStorage({
          key: 'imgUrl',
          success: function (res) {
            that.setData({
              imgUrl: res.data
            })
            var mytime = new Date()
            var time = mytime.toLocaleString()
            wx.request({
              url: config.service.sendhelpinformation,
              data: {
                data: {
                  imgurl: that.data.imgUrl,
                  openid: that.data.openId,
                  help: "求助内容" + help,
                  formid: e.detail.formId,
                  time: time,
                  nickName: that.data.nickName,
                  avatarurl: that.data.avatarUrl,
                },
              },
              header: {
                'content-type': 'application/json'
              },
              method: "POST",
              success: function (res) {
                console.log("发起求助后：res: " + JSON.stringify(res.data));
                //console.log(this.data.imgUrl);
                //console.log(this.data.inputValue);
              }
            })
          }
        })
      }
    })
  },

  /**
   * 将返回的文本结果放大
   */
  bindTextTap: function (event) {
    console.log(event.currentTarget.dataset.text);
    let text = event.currentTarget.dataset.text;
    wx.navigateTo({
      url: '../tools/text/text?text=' + text,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (option) {
    return {
      title: '启明瞳助盲小程序',
      desc: '人工加智能全面协助盲人识别周围环境',
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
  //=================chat.js函数内自定义函数 END============
  //================自定义函数区 END==================

  //================系统函数区=======================
  onShow: function () {},

  onLoad: function (options) {
    var that = this;
    innerAudioContext.loop = false
    innerAudioContext.autoplay = false
    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.src = ""
    innerAudioContext.pause = true
    innerAudioContext.onPlay(function () {
      console.log("开始")
      that.setStatus(true)
    })
    innerAudioContext.onStop(() => {
      console.log('暂停')
      console.log(innerAudioContext.src)
      gChatListData[playingIndex].playing = false
      that.setStatus(false)
    })
    innerAudioContext.onEnded(() => {
      console.log('结束')
      that.setStatus(false)
    })
    this.base64 = null;
    let sysInfo = wx.getStorageSync('sysInfo');
    this.setData({
      hiTowi: sysInfo.windowHeight / sysInfo.windowWidth,
      winHeight: sysInfo.screenHeight - sysInfo.height + sysInfo.statusBarHeight,
      sysInfo: sysInfo
    });
    // todo 校验登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      console.log("wxgetuserino执行了")
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // 微信：聊天素材支持小程序打开  https://developers.weixin.qq.com/miniprogram/dev/framework/material/support_material.html#小程序启动参数
    // QQ：聊天素材支持小程序打开 https://q.qq.com/wiki/develop/miniprogram/frame/open_ability/support_material.html
    var launchOptions = wx.getLaunchOptionsSync();
    console.log(launchOptions.scene);
    if (launchOptions.scene == 1173) { // 微信或者QQ 聊天素材支持小程序打开 的场景      
      var forwardMaterial = launchOptions.forwardMaterials[0];
      this.setData({
        imgUrl: forwardMaterial.path
      });
      options.doType = 'imgtag';
    } else {
      this.setData({
        imgUrl: options.imgUrl,
      });
    }

    this.addChat(this.data.imgUrl, 'p')
    switch (options.doType) {
      case 'imgtag':
        this.setData({
          mode: 'detectImage',
          eventType: '智能识别物体',
        });
        doVoice.innerAudioContext({
          src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_126_tupianneirongshibie.mp3',
          desc: '智能识别物体',
          download: 'yes'
        })
        ace.showToast("智能识别物体")
        break;
      case 'ocr':
        this.setData({
          mode: 'doWordIndentify',
          eventType: '图片文字识别',
        });
        doVoice.innerAudioContext({
          src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
          desc: '图片文字识别', //音频描述
          download: 'yes' //yes先下载再播放；no直接云地址播放(默认)
        })
        break;
      case 'face':
        this.setData({
          mode: 'doFaceIndentify',
          eventType: '图片人脸识别',
        });
        break;
      case 'imgScene':
        this.setData({
          mode: 'doSceneIndentify',
          eventType: '图片场景识别',
        });
        break;
      case 'takephoto':
        this.setData({
          eventType: '拍照求助志愿者',
        });
        ace.showToast("拍照求助志愿者")
        break;
      default:
        break;
    }
    this.commonIndentify(this.data.eventType);


    console.log(options.imgUrl);
  },

  onReady: function () {
    //云数据库CRUD接口
    queryUuserFavour: () => {
      clouddbapi.dml.cmmonQuery({
        data: {
          tableName: 'user_favorite',
          whereData: {
            _id: '5c28737716363f90775ca4ae'
          }
        },
        success: res => {
          console.log("函数返回值：" + JSON.stringify(res))
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.innerAudioContext.stop();
    console.log('chat-->onHide')
    doVoice.innerAudioContextDestroy();
  },
  /**
   * 缓存中存在用户信息，直接跳转到主界面
   * todo在电脑模拟器上没问题，但是在手机上有问题，先删除
   * todo  继续讲login放到前面
   */
  goLogin: function () {
    try {
      let userlogin = wx.getStorageSync('userlogin');
      console.log(userlogin)
      if (!userlogin) {
        ace.showToast('需要登录后，才能够求助志愿者')
        wx.redirectTo({
          url: '../login/login',
        })
      }
    } catch (e) {
      console.log('get user info from storage failed, ', e);
    }
  },
})