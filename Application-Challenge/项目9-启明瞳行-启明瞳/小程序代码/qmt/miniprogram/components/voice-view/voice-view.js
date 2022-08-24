
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    index: {
      type: Number,
      value: 0
    },
    length: {
      type: Number,
      value: 10,
    },
    url: {
      type: String,
      value: ''
    },
    playing: {
      type: Boolean,
      value: false,
      observer: "playAnima" // observer 表示属性值被更改时的响应函数
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    voiceImg: 3,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //伪动画播放方法
    playAnima: function () {
      var that = this;
      if (!that.data.playing) {
        this.setData({
          voiceImg: 3
        })
      } else {
        switch (that.data.voiceImg) {
          case 1:
            that.setData({
              voiceImg: 2
            })
            break
          case 2:
            that.setData({
              voiceImg: 3
            })
            break
          case 3:
            that.setData({
              voiceImg: 1
            })
            break
        }
        setTimeout(function () {
          that.playAnima()
        }, 500)
      }
    },
    //播放、暂停音频
    playVoice: function (e) {
      var that = this;
      console.log(that.data.url);
      that.data.playing = !that.data.playing;
      that.setData({
        playing: that.data.playing,
      })
      that.triggerEvent('voiceClickss', {
        index: that.data.index,
        url: that.data.url,
        playing: that.data.playing
      });
    },
  },
})