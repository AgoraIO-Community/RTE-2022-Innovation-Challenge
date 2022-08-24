var app = getApp();
var config = require('../../config');
var doVoice = require('../../utils/voiceandtext/text2voice.js')

//要发送的对话列表
var gChatListData = [];
var ace = require('../../utils/ace.js')
var inneraudioContext_ = '';
const clouddbapi = require('../../utils/clouddbapi.js');
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

    userLogoUrl: '/image/user_default.png',
    keyboard: true,

    // canvas高宽
    canvasWidth: 100,
    canvasHeight: 100,

    aiResult: '正在识别中，请稍等，识别结果仅供参考，可以左右滑动输入语音或文字求助志愿者',

    // 求助志愿者
    eventType: '',
    scrollTop: 0,
    isBottomHidden: false,

    imgHash: 0,
    helpid: 0,
    playing: false,
  },
  //============chat.js内的data信息 END=================

  /***--- 聊天框里面一些相关函数---***/
  // 聊天框的 头像  我的页面
  toMy: function () {
    wx.navigateTo({
      url: '../my/my'
    });
  },

  voiceClick: function (e) {

    var index = e.detail.index
    playingIndex = index
    var src = gChatListData[index].text[0];
    var that = this;
    console.log('播放url', src)
    if (playingSrc != src) {
      console.log('第一次播放');
      inneraudioContext_ = doVoice.innerAudioContext({
        src: src,
        desc: '播放',
      })
      playingSrc = src;
      that.data.playing = true;
    } else {
      if (!that.data.playing) {
        console.log('暂停中---->播放');
        that.data.playing = true;
        inneraudioContext_.play();

      } else {
        console.log('播放中---->暂停');
        that.data.playing = false;
        inneraudioContext_.pause();
      }
    }
  },

  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function (nickname, word, orientation, avatarUrl) {
    this.addChatWithFlag(nickname, word, orientation, true, avatarUrl);

    if (orientation == 'l') {
      this.setData({
        aiResult: word
      })
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

  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function (nickname, word, orientation, scrolltopFlag, avatarUrl) {

    let ch = {
      'avatar': avatarUrl ? avatarUrl : '',
      'text': word,
      'nickname': nickname,
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

  },

  getHistoryInfo: function (imgHash, helpid) {
    var that = this;
    wx.request({
      url: config.bizAPI.getHistoryInfo,
      method: "GET",
      data: {
        imgHash: imgHash,
        helpid: helpid,
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
        var helpText = content.helpInfo.helpText;
        var voiceUrl = content.helpInfo.voiceUrl;
        var videoUrl = content.helpInfo.videoUrl;
        var imageUrl = content.helpInfo.imageUrl;
        var blindName = content.helpInfo.nickname;
        // 先加入提问图片
        if(imageUrl != "") {
          that.addChat(blindName, imageUrl, 'p');
        }
        
        // 加入求助信息
        if(helpText != ""){
          that.addChat(blindName, helpText, 'r');
        }
        if(voiceUrl != "") {
          that.addChat(blindName, voiceUrl, 'v');
        }
        if(videoUrl != "" && videoUrl != null) {
          that.addChat(blindName, videoUrl, 'o');
        }
        // AI识别
        var aiResult = content.aiResult;
        for (let i = 0; i < aiResult.length; i++) {
          if (aiResult[i].aiType == 3) {
            that.addChat('ai识别', "图像识别", 'r');
            var descriptionWord = '';
            var imgResult = aiResult[i].imgResult.currencyList;
            for (let j = 0; j < imgResult.length; j++) {
              let con = imgResult[j].name + "准确率为百分之" + imgResult[j].confidence
              descriptionWord += con + ","
            };
            that.addChat('ai识别', [descriptionWord], 'l', '../../image/ic_ai.png');
          }
        }
        // 志愿者回答
        that.addChat('求助途径', "提问志愿者", 'r');
        var offerhelpList = content.offerHelpInfos;
        for (let k = 0; k < offerhelpList.length; k++) {
          if(offerhelpList[k].helpText != ""){
            let con = offerhelpList[k].helpText;
            that.addChat(offerhelpList[k].nickname, [con], 'l', offerhelpList[k].avatarUrl);
          }
          if(offerhelpList[k].voiceUrl != ""){
            let con = offerhelpList[k].voiceUrl;
            that.addChat(offerhelpList[k].nickname, [con], 'f', offerhelpList[k].avatarUrl);
          }
          
        };

        // console.log(des);
        // for (let i = 0; i < des.length; i++) {
        //   let con = des[i].name + "准确率为百分之" + des[i].confidence
        //   descriptionWord += con + ","
        // };
        // console.log(descriptionWord);
        // that.addChat([descriptionWord], 'l');
        // doVoice.textToSpeech(descriptionWord);
      },
      fail: function (res) {
        console.error(res);
        ace.hideLoading();
        that.analyzeFail(that.data.eventType);
      }
    })
  },

  //================系统函数区=======================
  onShow: function () {},

  onUnload: function() {
    gChatListData = [];
  },

  onLoad: function (options) {
    var that = this;
    wx.stopPullDownRefresh();

    gChatListData = [];
    
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

    that.setData({
      imgHash: options.imgHash,
      helpid: options.helpid
    });
    that.getHistoryInfo(that.data.imgHash, that.data.helpid);
    // that.addChat(that.data.imgHash, 'p')

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

  onPullDownRefresh: function() {
    console.log('刷新');
    gChatListData = [];
    this.setData({
      chatList: [],
    })
    console.log(this.data.chatList);
    this.getHistoryInfo(this.data.imgHash, this.data.helpid);
  }
})