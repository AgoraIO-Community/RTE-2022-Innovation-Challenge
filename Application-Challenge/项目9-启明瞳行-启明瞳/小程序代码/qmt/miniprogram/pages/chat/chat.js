var config = require('../../config');
var util = require('../../utils/util.js');
var upng = require('../../utils/upng-js/UPNG.js');
var ocr = require('../../utils/orcapi/ocr.js');
// var plugin = requirePlugin('WechatSI');
var doVoice = require('../../utils/voiceandtext/text2voice.js');
var imgtotext_request = require('../../utils/orcapi/imgtotext_request.js');
var image_tag = require('../../utils/orcapi/image_tag.js');
var config = require('../../config');
const app = getApp();
//要发送的对话列表
var gChatListData = [];
var gSpeakerInterval;

Page({
  // 页面的初始数据
  data: {

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
    imgUrl: '',

    // canvas高宽
    canvasWidth: 100,
    canvasHeight: 100,

    albumIcon: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/ic_album.png',
    photographIcon: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/ic_photograph.png',
    iamgeIcon: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/ic_image.png',
    descIcon: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/ic_linked_camera.png',
    textIcon: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/ic_text.png',

    // 印刷体识别
    ocrImgUrl: '',
    ocrResult: [],
    // 识别图片内容信息，并以标签的形式显示
    conImgUrl: '',
    conResult: [],
    // 图片描述识别

    // 语音合成
    recordUrl: '',
    showRecord: false,

    textRec: '',
    voice: '',

    // 求助志愿者
    inputValue: '',
    nickName: '',
    openId: '',
    avatarUrl: '',
    eventType: '',
  },

  // 生命周期回调—监听页面隐藏
  onHide: function() {
    app.globalData.innerAudioContext.stop();
    console.log('chat-->onHide')
    doVoice.innerAudioContextDestroy();

  },

  // 生命周期回调—监听页面加载
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '帮助识别'
    });
    let that = this;
    this.base64 = null;
    let sysInfo = wx.getStorageSync('sysInfo');
    this.setData({
      hiTowi: sysInfo.windowHeight / sysInfo.windowWidth
    });

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      console.log("---能够获取了。");
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

    if (options.imgUrl != "None") {
      this.setData({
        imgUrl: options.imgUrl,
        recordUrl: options.voiceUrl,
      });
      this.addChat(options.imgUrl, 'p');
      switch (options.doType) {
        case 'imgtag':
          this.setData({
            mode: 'imagIndentity',
            eventType: '图片内容识别',
          });
          doVoice.innerAudioContext({
            src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_126_tupianneirongshibie.mp3',
            desc: '进入了图片内容识别',
            download: 'yes'
          })
          this.commonIndentify(this.data.eventType);
          // doVoice.textToSpeech("进入了图片内容识别");
          break;
        case 'imgdes':
          this.setData({
            // mode: 'imgDescIndentity',
            eventType: '图片描述识别',
          });
          doVoice.innerAudioContext({
            src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_134_tupianmiaoshushibie.mp3',
            desc: '进入了图片描述识别',
            download:'yes'
          })
          this.doDescribe(this.data.eventType);
          // doVoice.textToSpeech("进入了图片描述识别");

          break;
        case 'ocr':
          this.setData({
            mode: 'doWordIndentify',
            eventType: '图片文字识别',
          });
          doVoice.innerAudioContext({
            src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
            desc: '进入了文字识别', //音频描述
            download: 'yes' //yes先下载再播放；no直接云地址播放(默认)
          })
          this.commonIndentify(this.data.eventType);
          break;
      }
      console.log(options.imgUrl);
    } else if (options.voiceUrl != "") {
      this.setData({
        recordUrl: options.voiceUrl,
        eventType: "上传语音"
      })
      this.addChat(options.voiceUrl, 'p');
      console.log(this.data.recordUrl);
      this.uploadVoice();
    }



  },

  doOcr: function() {
    this.setData({
      mode: 'doWordIndentify',
      eventType: '图片文字识别',
    });
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_142(154)_wenzishibie.mp3',
      desc: '进入了文字识别',
      download: 'yes'
    })
    this.callFunction(this.data.eventType);
    // doVoice.textToSpeech("进入了文字识别");

  },


  doImgDes: function() {
    this.doDescribe('图片描述识别');
  },

  // 预览图片
  previewImg: function() {
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
  commonIndentify: function(eventType) {
    let that = this;
    // var ocrStr = "文字识别";
    this.addChat(eventType, 'a');

    let img = this.data.imgUrl;
    console.log(img);
    that.uploadImage(eventType);
    that.analyzeStart(eventType);
  },

  uploadImage: function(eventType) {
    wx.cloud.uploadFile({
      cloudPath: `mileslei/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath: this.data.imgUrl,
      success: (res) => {
        this.setData({
          fileID: res.fileID,
        });
        this.getTempFileURL(eventType);
        console.log("图片上传成功");
      },
      fail: (err) => {
        console.log(err);
        ace.hideLoading();

      },
    });
  },

//上传语音信息
  uploadVoice: function() {
    wx.cloud.uploadFile({
      cloudPath: `Voice/${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.mp3`,
      filePath: this.data.recordUrl,
      success: (res) => {
        this.setData({
          fileID_Voice: res.fileID,
        });
        console.log("图片上传成功");
      },
      fail: (err) => {
        console.log('lalalaalerror');
        ace.hideLoading();

      },
    });
  },

  getTempFileURL: function(eventType) {
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: this.data.fileID,
      }],
    }).then((res) => {
      var that = this;
      ace.hideLoading();
      const files = res.fileList;

      if (!files.length) {
        that.analyzeFail(that.data.eventType);
        return;
      }

      this.setData({
        imgUrl: files[0].tempFileURL,
        hasUploaded: true,
      });
      this.callFunction(eventType);
    }).catch(() => {
      ace.hideLoading();
      that.analyzeFail(that.data.eventType);
    });
  },

  callFunction: function(eventType) {
    wx.cloud.callFunction({
      name: this.data.mode,
      data: {
        url: this.data.imgUrl,
        type: this.data.type
      },
    }).then(({
      result
    }) => {
      var that = this;
      console.log(eventType + JSON.stringify(result));
      ace.hideLoading();
      if (!result || result.code) {
        that.analyzeFail(that.data.eventType);
        return;
      }
      let descriptionWord = "";
      if ("图片内容识别" === eventType.trim()) {
        let des = result.tags;
        for (let i = 0; i < des.length; i++) {
          let con = des[i].tag_name + "准确率为百分之" + des[i].tag_confidence
          descriptionWord += con + ","
        };
        that.addChat([descriptionWord], 'l');
      }
      if ("图片描述识别" === eventType.trim()) {
        let descriptionWord = result;
      }
      if ("图片文字识别" === eventType.trim()) {
        let descriptionWord = result.items.map(item => item.itemstring).join(' ');
        if (descriptionWord.length == 0) {
          that.analyzeFail(that.data.eventType);
          return;
        }
        that.addChat([descriptionWord], 'l');
      }
      that.analyzeSuccess(that.data.eventType);
      doVoice.textToSpeech(descriptionWord);
    }).catch((err) => {
      console.error("识别失败3" + err);
      ace.hideLoading();
      that.analyzeFail(that.data.eventType);
    });
  },

  afterDraw: function() {
    var that = this;
    var canvasID = "testCanvas";
    var imgWidth = this.data.canvasWidth;
    var imgHeight = this.data.canvasHeight;
    wx.canvasGetImageData({
      canvasId: canvasID,
      x: 0,
      y: 0,
      width: imgWidth,
      height: imgHeight,
      success(res) {
        // 3. png编码
        console.log(res)
        console.log(res.data);
        let pngData = upng.encode([res.data.buffer], res.width, res.height)
        // 4. base64编码
        let base64 = wx.arrayBufferToBase64(pngData);
        that.setData({
          test: "data:image/png;base64," + base64
        });
      }
    });
    setTimeout(() => {
      var that = this;
      var canvasID = "testCanvas";
      var imgWidth = this.data.canvasWidth;
      var imgHeight = this.data.canvasHeight;
      wx.canvasGetImageData({
        canvasId: canvasID,
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
        success(res) {
          // 3. png编码
          console.log(res)
          console.log(res.data);
          let pngData = upng.encode([res.data.buffer], res.width, res.height)
          // 4. base64编码
          let base64 = wx.arrayBufferToBase64(pngData);
          that.setData({
            test: "data:image/png;base64," + base64
          });
        }
      });
    }, 1000);
  },

  testPreLoad: function(e) {
    console.log(e)
  },

  // 图片描述
  doDescribe: function(eventType) {
    let that = this;
    var ocrStr = eventType;
    this.addChat(ocrStr, 'a');
    that.analyzeStart(ocrStr);
    let img = this.data.imgUrl;

    if (!!!this.base64) {
      wx.getImageInfo({
        src: img,
        success(d) {
          that.setData({
            canvasWidth: d.width,
            canvasHeight: d.height,
          });
          util.toPNGBase64(img, d)
            .then((base64) => {
              that.base64 = base64;
              return imgtotext_request.request(base64);
            })
            .then((res) => {
              var data = res.data;
              if (data.ret !== 0) {

                that.analyzeFail(ocrStr);
                console.log(res);
                return;
              }
              var info = data.data;
              console.log(info);
              let result = []
              result.push(info.text)
              console.log(ocrStr)
              that.analyzeSuccess(ocrStr);
              that.addChat(result, 'l');
              // doVoice.textToSpeech(info.text + "结果仅供参考，可求助志愿者获取更加准确的信息");
              doVoice.innerAudioContext({
                src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/chat_366_jieguojingongcankao.mp3',
                desc: info.text + "结果仅供参考，可求助志愿者获取更加准确的信息",
                download:'yes'
              })
              // util.TTS(info.text);
            })
            .catch((err) => {
              console.log(err);
              that.analyzeFail(ocrStr);
            });
        },
        fail(e) {
          console.log(e)
          // reject({     //又没写promise
          //   code: 2,
          //   reason: '获取图片信息失败'
          // });
        }
      });
    } else {
      imgtotext_request.request.tag(that.base64)
        .then((res) => {
          var data = res.data;
          if (data.ret !== 0) {

            that.analyzeFail(ocrStr);
            console.log(res);
            return;
          }
          var info = data.data;
          console.log(info);
          let result = []
          result.push(info.text)
          console.log(ocrStr)
          that.analyzeSuccess(ocrStr);
          that.addChat(result, 'l');
          doVoice.textToSpeech(info.text);
          // util.TTS(info.text);
        })
        .catch((err) => {
          console.log(err);
          that.analyzeFail(ocrStr);
        });
    };
  },

  //开始分析了
  analyzeStart: function(text) {
    app.globalData.innerAudioContext.stop();
    util.showLoading(text + "...");
    app.globalData.innerAudioContext.play();
    wx.vibrateShort({})
  },
  // 分析成功了
  analyzeSuccess: function(text) {
    util.hideLoading();
    wx.vibrateLong({});
    util.showSuccess(text + "成功了");
    app.globalData.innerAudioContext.stop();
  },
  //分析失败了
  analyzeFail: function(text) {
    var that = this;
    util.hideLoading();
    wx.vibrateLong({});
    app.globalData.innerAudioContext.stop();
    // doVoice.textToSpeech(text + '结果不理想,请求助志愿者！');
    doVoice.innerAudioContext({
      src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/jieguobulixiangqingqiuzhuziyuanzhe.mp3',
      desc: text + "结果不理想,请求助志愿者",
      download:'yes'
    })
    that.addChat([text], 'l');
  },

  // 转到我的页面
  toMy: function() {
    wx.navigateTo({
      url: '../my/my'
    });
  },

  onReady: function() {},


  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function(word, orientation) {
    this.addChatWithFlag(word, orientation, true);
  },

  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function(word, orientation, scrolltopFlag) {
    let ch = {
      'text': word,
      'time': new Date().getTime(),
      'orientation': orientation
    };
    gChatListData.push(ch);
    let charlenght = gChatListData.length;
    let data = {
      chatList: gChatListData
    };
    if (scrolltopFlag) data.scrolltop = 'roll' + charlenght;
    this.setData(data);
  },



  // 监控输入框输入
  Typing: function(e) {
    var inputVal = e.detail.value;
    var btnDisabled = inputVal.length === 0;
    this.setData({
      askWord: inputVal,
      sendButtDisable: btnDisabled,
    })
  },
  /**
   * 获取input 输入框的里面的输入的文本的内容
   */
  sendChat: function(e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    this.setData({
      askWord: word,
      sendButtDisable: true,
    });
  },
  /**
   * 盲人填写信息发起志愿者求助
   */
  askVolunteerHelp: function(e) {
    console.log("formid::" + e.detail.formId);
    console.log("openid:::" + wx.getStorageSync('openid'))
    var that = this
    var help = that.data.askWord
    console.log("help:::" + help)

    if (util.isEmpty(help)) {
      util.showModal('提示', '不能发送空消息，请重试')
      return
    }

    var userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo.nickName + "====" + userInfo.avatarUrl)

    var filename = Date.parse(new Date());
    console.log("filename：：：" + filename);
    if (that.data.imgUrl.substr(0, 4) == 'http') {
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
          helpText: help,
          voiceUrl: '',
          imageUrl: that.data.imgUrl,
          formId: e.detail.formId,
          device: 0,
          channel: 2,
          askWay: 1,
          subsId: config.subsMess.askForHelp,  //订阅消息id
        },
        success: function(res) {
          console.log("请求的结果：：：" + JSON.stringify(res.data)),
            // doVoice.textToSpeech('关注启明瞳服务号才能够获取更多精彩回复，请在微信搜索框中直接粘贴搜索，找到启明瞳后请关注。');
            doVoice.innerAudioContext({
              src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/welcome.mp3',
              desc: '关注启明瞳服务号获取更好体验，请在微信搜索框中直接粘贴并关注',
              download:'yes'
            });
            wx.setStorageSync('lastHelpInfoId', res.data.content);
        }
      })
    } else {
      //本地地址 格式：wxfile://tmp_d17fbdc00ae28ab443ccf350318f57dee4cbbd48bc59881e.jpg
      wx.uploadFile({
        url: config.bizAPI.cosUpload,
        // url: 'http://192.168.199.239:8080/cos/upload',
        filePath: that.data.imgUrl,
        name: 'file',
        formData: {
          filename: filename,
          openid: userInfo.openid
        },
        success: function(res) {
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
              imageUrl: JSON.parse(res.data).content,
              formId: e.detail.formId,
              device: 0,
              channel: 2,
              askWay: 1,
              subsId: config.subsMess.askForHelp,  //订阅消息id
            },
            success: function(res) {
              console.log("请求的结果：：：" + JSON.stringify(res.data))
              // doVoice.textToSpeech('关注启明瞳服务号才能够获取更多精彩回复，请在微信搜索框中直接粘贴搜索，找到启明瞳后请关注。');
              doVoice.innerAudioContext({
                src: 'cloud://qmt-test-869cb2.716d-qmt-test-869cb2/text2voice/welcome.mp3',
                desc: '关注启明瞳服务号获取更好体验，请在微信搜索框中直接粘贴并关注',
                download:'yes'
              });
              wx.setStorageSync('lastHelpInfoId', res.data.content);
            }
          })
        }
      })

    }

    that.addChat(that.data.askWord, 'r');
    that.setData({
      askWord: ''
    })

    console.log("输入的文章的内容mame=ask_word" + e.detail.ask_word);

  },
  /*
   * 通过“我能帮帮忙”服务号向志愿者发送模板消息
   */
  submitInfo: function(e) {
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
      success: function(res) {
        that.setData({
          nickName: JSON.parse(res.data).nickName,
          openId: JSON.parse(res.data).openId,
          avatarUrl: JSON.parse(res.data).avatarUrl
        })
        wx.getStorage({
          key: 'imgUrl',
          success: function(res) {
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
              success: function(res) {
                // console.log("res: " + JSON.stringify(res.data));
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
  bindTextTap: function(event) {
    console.log(event.currentTarget.dataset.text);
    let text = event.currentTarget.dataset.text;
    wx.navigateTo({
      url: '../tools/text/text?text=' + text,
    });
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(option) {
    return {
      title: '启明瞳助盲小程序',
      desc: '人工加智能全面协助盲人识别周围环境',
      path: 'pages/qmt/qmt',
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  }
})