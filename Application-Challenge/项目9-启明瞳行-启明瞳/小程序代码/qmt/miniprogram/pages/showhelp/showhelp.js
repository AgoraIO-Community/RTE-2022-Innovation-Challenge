const commonApi = require('../../utils/api.js')
const config = require('../../config.js')
const commonUtil = require('../../utils/util.js')
const doVoice = require('../../utils/voiceandtext/text2voice.js')
const app = new getApp();
var inneraudioContext_ = '';
var playingSrc = ''

Page({
  data: {
    swiper: {
      indicatorDots: false,
      autoplay: false,
      interval: 5000,
      duration: 500,
      current: 0,

      //问题区
      imageUrl: '',
      askerAvatarUrl: '',
      questionContent: '',
      questionVoiceUrl: '',
      questionVideoUrl: '',
      gradePoint: 1,

      answerVideoUrl: '',
      helpInfoId: '',
      offerHelpInfoId: '',
    },
    playing: false,
  },

  onShow: function () {
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
      focusInfo: wx.getStorageSync('focusInfo')
    });
  },

  bindPrev: function () {
    var swiper = this.data.swiper;
    var current = swiper.current;
    swiper.current = current > 0 ? current - 1 : 0; //swiper.imageList.length - 1;
    this.setData({
      swiper: swiper,
      gradePoint: swiper.imageList[swiper.current].gradePoint,
      nickname: swiper.imageList[swiper.current].nickname,
      createTime: swiper.imageList[swiper.current].createTime,
      helpText: swiper.imageList[swiper.current].helpText,
      avatarUrl: swiper.imageList[swiper.current].avatarUrl,
      answerVoiceUrl: swiper.imageList[swiper.current].voiceUrl
    })
  },

  bindNext: function () {
    var swiper = this.data.swiper;
    var current = swiper.current;
    swiper.current = current < (swiper.imageList.length - 1) ? current + 1 : (swiper.imageList.length - 1); //0;
    this.setData({
      swiper: swiper,
      gradePoint: swiper.imageList[swiper.current].gradePoint,
      nickname: swiper.imageList[swiper.current].nickname,
      createTime: swiper.imageList[swiper.current].createTime,
      helpText: swiper.imageList[swiper.current].helpText,
      avatarUrl: swiper.imageList[swiper.current].avatarUrl,
      answerVoiceUrl: swiper.imageList[swiper.current].voiceUrl
    })
  },

  goQMT: function () {
    wx.reLaunch({
      url: '/pages/qmt/qmt',
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })

  },
  /**  自定义的控件  废弃掉 */
  onChange(e) {
    const currentStr = 'this.data.swiper.current';
    var index = e.detail.index;
    commonApi.requestPromise.questionAndAnswer(
      config.bizAPI.updateGradePoint, {
        id: this.data.swiper.imageList[this.data.swiper.current].id,
        gradePoint: index
      }
    ).then(res => {
      if (0 == res.data.code) {
        console.log('0 == res.data.code' + index);
        let currentGradePoint = 'swiper.imageList[' + this.data.swiper.current + '].gradePoint';
        this.setData({
          gradePoint: index,
          [currentGradePoint]: index
        })
      }
    })
  },

  giveMark: function (e) {
    var index = e.target.dataset.index;

    commonApi.requestPromise.questionAndAnswer(
      config.bizAPI.updateGradePoint, {
        id: this.data.swiper.imageList[this.data.swiper.current].id,
        gradePoint: index
      }
    ).then(res => {
      if (0 == res.data.code) {
        console.log('0 == res.data.code' + index);
        let currentGradePoint = 'swiper.imageList[' + this.data.swiper.current + '].gradePoint';
        this.setData({
          gradePoint: index,
          [currentGradePoint]: index
        })
      }
    })
  },
  toMe: function () {
    wx.reLaunch({
      url: '/pages/my/my'
    })
  },

  //播放、暂停音频
  voiceClick: function (e) {
    console.log(e.detail.url)
    var src = e.detail.url;
    this.setData({
      answerVideoUrl: src,
    })
    console.log('播放url', src)
    if (playingSrc != src) {
      inneraudioContext_ = doVoice.innerAudioContext({
        src: this.data.answerVideoUrl,
        desc: '播放',
      })
      playingSrc = src;
      this.data.playing = true;
    } else {
      if (!this.data.playing) {
        console.log('暂停中---->播放');
        this.data.playing = true;
        inneraudioContext_.play();

      } else {
        console.log('播放中---->暂停');
        this.data.playing = false;
        inneraudioContext_.pause();
      }
    }
  },

  // ------------------系统函数区 start----------------

  onLoad: function (options) {
    let questionId = options.helpInfoId;
    this.data.helpInfoId = options.helpInfoId;
    //哪一个问题进来的，放在最前面
    let answerId = options.offerHelpInfoId;

    this.data.offerHelpInfoId = options.offerHelpInfoId;
    if (!questionId && !answerId) {
      console.log('入参非法 helpInfoId或offerHelpInfoId不能为空')
      return;
    }

    this.setData({
      questionId: questionId
    })

    commonApi.requestPromise.questionAndAnswer(
      config.bizAPI.questionAndAnswer, {
        id: questionId
      }
    ).then(res => {
      // 把匹配到的答案放在最前面
      let answerIndex = 0;
      let answerList = res.data.content.offerHelpInfos;
      for (var i = 0; i < answerList.length; i++) {
        answerList[i].createTime = commonUtil.timestampFormat(answerList[i].createTime, 'M-D h:m')
        if (answerId == answerList[i].id) {
          this.setData({
            gradePoint: answerList[i].gradePoint
          })
          answerIndex = i;
        }
      }
      // 把选中的答案放在最前面展示
      // let tmpAnswer = answerList[0];
      // answerList[0] = answerList[answerIndex];
      // answerList[answerIndex] = tmpAnswer;

      // console.log(JSON.stringify(res.data.content))

      if (!res.data.content.helpInfo.helpText && !res.data.content.helpInfo.voiceUrl && !res.data.content.helpInfo.videoUrl) {
        console.log('求助文本、语音、视频资源不能同时为空');
        return;
      }
      if (!!res.data.content.helpInfo.helpText) {
        this.setData({
          questionContent: res.data.content.helpInfo.helpText,
        })
      }
      if (!!res.data.content.helpInfo.voiceUrl) {
        this.setData({
          questionVoiceUrl: res.data.content.helpInfo.voiceUrl,
        })
      }
      if (!!res.data.content.helpInfo.videoUrl) {
        this.setData({
          questionVideoUrl: res.data.content.helpInfo.videoUrl,
        })
      }

      let swiper = this.swiper
      let tmpParam = 'swiper.imageList'
      let cur = 'swiper.current'
      this.setData({
        [cur]: answerIndex,
        [tmpParam]: answerList,
        nickname: answerList[answerIndex].nickname,
        createTime: answerList[answerIndex].createTime,
        helpText: answerList[answerIndex].helpText,
        answerVoiceUrl: answerList[answerIndex].voiceUrl,
        avatarUrl: answerList[answerIndex].avatarUrl,
        askerAvatarUrl: res.data.content.helpInfo.avatarUrl,
        askername: res.data.content.helpInfo.nickname,
        askTime: commonUtil.timestampFormat(res.data.content.helpInfo.createTime, 'M-D h:m'),
        imageUrl: res.data.content.helpInfo.imageUrl,
        questionId: questionId
      })
      // console.log(JSON.stringify(this.data))
    })
  },

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
      path: 'pages/showhelp/showhelp?helpInfoId=' + this.data.helpInfoId + '&offerHelpInfoId=' + this.data.offerHelpInfoId,
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
})
// ------------------系统函数区 end----------------