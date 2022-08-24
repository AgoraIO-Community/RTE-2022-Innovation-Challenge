var plugin = requirePlugin('WechatSI');
const innerAudioContextTTS = getApp().globalData.innerAudioContext;
const util = require('../util.js')

// 语音转换
function textToSpeech(words) {
  var that = this;
  plugin.textToSpeech({
    lang: 'zh_CN',
    tts: true,
    content: words,
    success: function (res) {
      console.log("音频播放" + res.filename)
      innerAudioContextTTS.loop = false;
      innerAudioContextTTS.autoplay = true
      innerAudioContextTTS.src = res.filename
      innerAudioContextTTS.onPlay(() => {
        console.log('开始播放')
      });
      innerAudioContextTTS.onEnded(function callback() {
        console.info('播放结束');
      });
    },
    fail: function (res) {
      that.textToSpeech('语音转换失败');
    }

  });
}

const innerAudioContext = (options) => {
  innerAudioContextTTS.stop();
  let httpUrl = options.src ? options.src : options.src[0];
  console.log(httpUrl);
  if (options.download == 'yes') {
    //如果options.src为云地址，要转换成本地地址 cloud://qmt-test-869cb2.716d-qmt-test-869cb2/voice/1547778174228-9441982.mp3
    if ('cloud' == options.src[0].substr(0, 5)) {
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: options.src,
        }],
      }).then((res) => {
        console.log(res);
        const files = res.fileList;
        if (!files.length) {
          console.log('云地址转换为https地址失败')
          return;
        }
        httpUrl = files[0].tempFileURL
        console.log('httpUrl:' + httpUrl)
        //下载到本地再播放
        wx.downloadFile({
          url: httpUrl,
          success: function (res) {
            // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
            if (res.statusCode === 200) {
              innerAudioContextTTS.src = res.tempFilePath;
              innerAudioContextTTS.loop = false;
              // util.sleep(200);
              innerAudioContextTTS.play();
              innerAudioContextTTS.onPlay(function callback() {
                console.info('开始播放：' + options.desc)
              });
              innerAudioContextTTS.onEnded(function callback() {
                console.info('播放结束：' + options.desc);

              });
            }
          }
        })
      })
    } else {
      //下载到本地再播放
      //  wx.cloud.downloadFile

      wx.downloadFile({
        url: httpUrl,
        success: function (res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            innerAudioContextTTS.src = res.tempFilePath;
            innerAudioContextTTS.loop = false;
            // util.sleep(200);
            innerAudioContextTTS.play();
            innerAudioContextTTS.onPlay(function callback() {
              console.info(options)
            });
            innerAudioContextTTS.onEnded(function callback() {
              console.info(options);
              innerAudioContextTTS.stop();
            });
          }
        }
      })
    }
  } else {
    innerAudioContextTTS.src = options.src;
    innerAudioContextTTS.loop = false;
    // util.sleep(200);
    innerAudioContextTTS.play();
    innerAudioContextTTS.onPlay(function callback() {
      console.info('开始播放：' + options.desc)
      setTimeout(() => {
        console.log(innerAudioContextTTS.paused)
      }, 100)
    });
    innerAudioContextTTS.onEnded(function callback() {
      console.info('播放结束：' + options.desc);
      setTimeout(() => {
        console.log(innerAudioContextTTS.paused)
      }, 100)
    });
  }
  return innerAudioContextTTS;
}


function innerAudioContextDestroy() {
  console.log('播放器暂停了')
  innerAudioContextTTS.stop();
  // innerAudioContextTTS.destroy();
}



module.exports = {
  textToSpeech: textToSpeech,
  innerAudioContext: innerAudioContext,
  innerAudioContextDestroy: innerAudioContextDestroy
}