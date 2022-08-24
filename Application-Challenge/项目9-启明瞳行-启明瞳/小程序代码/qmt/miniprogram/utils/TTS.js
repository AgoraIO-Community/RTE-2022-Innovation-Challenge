var plugin = requirePlugin('WechatSI');
const innerAudioContextTTS = wx.createInnerAudioContext();


function track(eventName, data) {
  //微信自定义分析事件
  wx.reportAnalytics(eventName, data);
  //友盟数据
  wx.uma.trackEvent(eventName, data);
}

/**
 * 将 文字转换为声音
 * @param {要转换语音的文章} words 
 */
function textToSpeech(words) {
  console.log(words);
  track('tts',{'words':words}),
  plugin.textToSpeech({
    lang: 'zh_CN',
    tts: true,
    content: words,
    success: function (res) {
     //TTS的合成成功
      track('tts',{'ttsstatus':'success'}),
      console.log("音频播放" + res.filename)
      innerAudioContextTTS.loop = false;
      innerAudioContextTTS.autoplay = true
      innerAudioContextTTS.obeyMuteSwitch = false;
      innerAudioContextTTS.src = res.filename
      innerAudioContextTTS.onPlay(() => {
        console.log('开始播放')
        track('tts',{'ttsaudio':'onPlay'})
      });
      innerAudioContextTTS.onEnded(function callback() {
        console.info('播放结束');
        track('tts',{'ttsaudio':'onEnded'})

      });
      innerAudioContextTTS.onError((res) => {
        // .Event.stat('TTS',{'ttsaudio':'onError'})
        // .Event.stat('TTS',{'ttsaudioerrmsg':res.errMsg})
        track('tts',{'ttsaudio':'onError','ttsaudioerrmsg':res.errMsg})
        console.log(res.errMsg)
        console.log(res.errCode)
      })
    },
    fail: function (res) {
      track('tts',{'ttsstatus':'fail','ttsfail':res})
      console.warn(res);
      console.warn('语音转换失败');
    }

  });
}

/**
 * todo  可能有问题
 *  
 */
const innerAudioContext = (options) => {
  innerAudioContextTTS.stop();
  let httpUrl = options.src;
  if (options.download == 'yes') {
    //如果options.src为云地址，要转换成本地地址 cloud://qmt-test-869cb2.716d-qmt-test-869cb2/voice/1547778174228-9441982.mp3
    if ('cloud' == options.src.substr(0, 5)) {
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: options.src,
        }],
      }).then((res) => {
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
              console.info('开始播放：' + options.desc)
            });
            innerAudioContextTTS.onEnded(function callback() {
              console.info('播放结束：' + options.desc);
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
    });
    innerAudioContextTTS.onEnded(function callback() {
      console.info('播放结束：' + options.desc);
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