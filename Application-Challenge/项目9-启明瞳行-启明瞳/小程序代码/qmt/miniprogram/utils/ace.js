var TTS = require('../utils/TTS.js')
/**
 * 埋点，数据分析
 * 友盟统计 https://mp.umeng.com/analysis/602e0ea7668f9e17b8b0aa3d/conversion/custom-event
 * 微信自带统计 https://developers.weixin.qq.com/miniprogram/dev/api/open-api/data-analysis/wx.reportAnalytics.html
 * @param {事件名} eventName  事件名
 * @param {上报的数据} data  上报的自定义数据，key 为配置中的字段名，value 为上报的数据
 */
function track(eventName, data) {
  //微信自定义分析事件 todo  需要在微信统计后台进行配置
  //wx.reportAnalytics(eventName, data);
  //友盟数据
  wx.uma.trackEvent(eventName, data);
  //app.globalData.uma.trackEvent(eventName, data);
}
/**
 * 显示成功的图标和播报出文字
 * @param {显示文字和将文字播报出来} title 
 */
function showSuccess(title) {
  TTS.textToSpeech(title)
  wx.hideToast()
  wx.showToast({
    title: title,
    icon: "success",
    duration: 2000
  })

  track('ace_show', {
    title: title,
    type: 'Success'
  })
}

/**
 * 加载过程，和文字
 * @param {显示文字和将文字播报出来} title 
 */
function showLoading(title) {
  // TTS.textToSpeech(title)
  wx.hideToast()
  // wx.showToast({
  //   title: title,
  //   icon: 'loading',
  //   duration: 2000,
  // });
  wx.showLoading({
    title: title,
  })
  track('ace_show', {
    title: title,
    type: 'Loading',
  });
}
/**
 * 隐藏价值过程
 */
function hideLoading(){
  // wx.hideToast({
  //   success: (res) => {},
  // })
  wx.hideLoading({
    success: (res) => {},
  })
}

/**
 * 显示Toast
 * @param {请输入关键词} title 
 */
function showToast(title) {
  TTS.textToSpeech(title)
  wx.hideToast()
  wx.showToast({
    title: title,
    icon: "none",
    duration: 2000
  })

  track('ace_show', {
    title: title,
    type: 'Toast',
  });
}

/**
 * 隐藏Toast
 */
function hideToast(){
  wx.hideToast({
    success: (res) => {},
  })
}

/**
 * 短震动
 */
function vibrateShort() {
  wx.vibrateShort({
    success: (res) => {
      console.log('短震动成功了');
    },
  })
}
/**
 * 长震动
 */
function vibrateLong() {
  wx.vibrateLong({
    success: (res) => {
      console.log('短震动成功了');
    },
    fail: (res) => {},
    complete: (res) => {},
  })
}
/**
 * showModal的无障碍提醒
 */
function showModalTip(title) {
  TTS.textToSpeech(title)
}

/**
 * 跳转到制定的小程序
 * @param {小程序的APPID} appid 
 */
function navigateToMiniProgram(appId) {
  TTS.textToSpeech("中间弹框，请选允许")
  wx.navigateToMiniProgram({
    appId: appId,
    success(res) {},
    fail(res) {
      console.log("失败了" + res)
    },
    complete(res) {}
  })
}
/**
 * 拨打电话
 * @param {电话号码} phoneNumber 
 */
function makePhoneCall(phoneNumber) {
  wx.makePhoneCall({
    phoneNumber: phoneNumber,
    success() {
      console.log("调用电话界面拨打了" + phoneNumber)
    },
    fail() {
      console.log("调用电话界面失败了" + phoneNumber)
    }
  })

}

/**
 * 跳转到制定的小程序
 * @param {小程序的APPID} appId 
 * @param {小程序的APPID} path 
 */
function navigateToMiniPath(appId, path) {
  TTS.textToSpeech("中间弹框，请选允许")
  wx.navigateToMiniProgram({
    appId: appId,
    path: path,
    success(res) {},
    fail(res) {},
    complete(res) {}
  })
}


module.exports = {
  showToast: showToast,
  hideToast:hideToast,
  showLoading: showLoading,
  hideLoading:hideLoading,
  showSuccess: showSuccess,
  showModalTip: showModalTip,
  vibrateLong: vibrateLong,
  vibrateShort: vibrateShort,
  navigateToMiniProgram: navigateToMiniProgram,
  navigateToMiniPath: navigateToMiniPath,
  makePhoneCall: makePhoneCall,
  track: track
}