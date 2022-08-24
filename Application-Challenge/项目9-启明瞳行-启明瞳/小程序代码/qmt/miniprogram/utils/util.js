let Promise = require('./promise.js');
let upng = require('./upng-js/UPNG.js');
let config = require('../config.js');
var plugin = requirePlugin('WechatSI');
var md5 = require('./md5.js')
const app = getApp()

// 日期转时间戳
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
 */
function timestampFormat(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}


/**
 * 是否可用文字识别
 * @param {当前时间} askTime 
 */
function canUseOcr(askTime) {
  // 获取当前日期
  var askDate = timestampFormat(askTime, 'Y/M/D');
  console.log(askDate);
  // 缓存是否已有求助
  var lastAskTime = wx.getStorageSync('askTime');
  console.log(lastAskTime)
  if (lastAskTime) {
    var lastAskDate = timestampFormat(lastAskTime, 'Y/M/D');
    console.log(lastAskDate);
    console.log(askDate);
    console.log(lastAskDate == askDate);
    // 当前时间有求助
    if (lastAskDate == askDate) {
      var ocrCount = wx.getStorageSync('ocrCount');
      if (ocrCount > 0) {
        if (ocrCount < 10) {
          ocrCount += 1;
          wx.setStorageSync('askTime', askTime)
          wx.setStorageSync('ocrCount', ocrCount)
          return true;
        } else {
          return false;
        }
      }
    } // 当前时间没有求助
    else {
      ocrCount = 1;
      wx.setStorageSync('ocrCount', ocrCount)
      wx.setStorageSync('askTime', askTime)
      return true;
    }
  } else {
    ocrCount = 1;
    wx.setStorageSync('ocrCount', ocrCount)
    wx.setStorageSync('askTime', askTime)
    return true;
  }
  // var ocrCount = wx.getStorageSync('ocrCount');
  // if (isInterval24H(askTime)) { // 如果是在24小时之内
  //   if (ocrCount < 10) {
  //     ocrCount += 1;
  //     wx.setStorageSync('ocrCount', ocrCount)
  //     return true;
  //   } else {
  //     wx.setStorageSync('askMaxTime', askTime); // 把超过10次的的时间存储下拉
  //     return false;
  //   }
  // } else {
  //   // 最后一次求助保存的时间，在24小时之外，要吧次数统计设置为1，可以求助
  //   console.log(ocrCount);
  //   ocrCount = 1;
  //   wx.setStorageSync('ocrCount', ocrCount);
  //   wx.setStorageSync('askMaxTime', askTime); //把超过10次的的时间，次数和求助时间归零。

  //   return true;
  // }
}

/**
 * 判断时间间是否超过24小时
 * @param {当前时间} askTime 
 */
// function isInterval24H(askTime) {
//   var askMaxTime = wx.getStorageSync('askMaxTime')
//   var duringTime = currentTime - askMaxTime;
//   console.log(systemTime);
//   if (duringTime > 86400) { //如果时间大于24小时
//     return false;
//   } else {
//     return true;
//   }
// }

// 显示价值提示
var showLoading = text => {
  wx.vibrateShort({

  })


  wx.showLoading({
    title: text,
    mask: true
  })
}
//隐藏
var hideLoading = () => {
  wx.vibrateLong({})
  wx.hideLoading()
}


var showBusy = text => wx.showToast({
  title: text,
  icon: 'loading'
})
// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
})

var showInfo = text => wx.showToast({
  title: text,
  icon: 'info'
})

var showError = text => {
  //  加载识别震动提醒
  wx.vibrateLong({})
  wx.showToast({
    title: text,
    //加入一个图片
  })
  // todo 加入一个错误的声音提示
}
// 显示失败提示
var showModal = (title, content) => {
  wx.hideToast();
  wx.showModal({
    title: title,
    content: content,
  })
}

//判断字符是否为空的方法
var isEmpty = text => {
  var obj = (text + '').replace(/(^\s*)|(\s*$)/g, "") //去掉支付窜的前后空格

  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}

//识别图片内容信息，并以标签的形式显示
var showCon = () => {
  return new Promise((resolve, reject) => {
    let img = wx.getStorageSync('imgUrl')
    wx.request({
      url: config.service.ciUrl,
      data: {
        'action': 'idContent',
        'imgUrl': img
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        showSuccess('识别成功');
        var data = res.data
        if (data.code !== 0) {
          reject(res);
          return;
        }
        var info = data.data
        if (info.code !== 0) {
          reject(res);
          return;
        }
        let des = info.tags;
        let tmp = [];
        for (let i = 0; i < des.length; i++) {
          let con = des[i].tag_name + "正确率为百分之" + des[i].tag_confidence
          tmp.push(con);
        }
        resolve(tmp);
      },
      fail: function (e) {
        reject(e);
      }
    })
  })
}

const canvasID = 'pngCanvas';
var toPNGBase64 = (imgPath, img) => { // 添加计时器
  return new Promise((resolve, reject) => {
    let ctx = wx.createCanvasContext(canvasID);
    // 1. 绘制图片至canvas
    ctx.drawImage(imgPath, 0, 0, img.width, img.height);
    // 绘制完成后执行回调，API 1.7.0
    ctx.draw(false, setTimeout(() => {
      // 2. 获取图像数据， API 1.9.0
      wx.canvasGetImageData({
        canvasId: canvasID,
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        success(res) {
          // 3. png编码
          let pngData = upng.encode([res.data.buffer], res.width, res.height)
          // 4. base64编码
          resolve(wx.arrayBufferToBase64(pngData));
        },
        fail(e) {
          console.log(e)
          showModal('失败', 'canvas获取图片信息失败')
          reject({
            code: 2,
            reason: 'canvas获取图片信息失败'
          });
        }
      });
    }, 1000));


  });
}
// 单位 ms
function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}


/**
 * 封装toast
 */
function showToast(type, text, obj) {
  let param = {
    duration: (obj && obj.duration) || 1500,
    mask: (obj && obj.isMask) || false
  }
  switch (type) {
    case 'text': {
      param['title'] = text || ''
      param['icon'] = 'none'
      break
    }
    case 'loading': {
      param['title'] = text || ''
      param['icon'] = 'loading'
      break
    }
    case 'success': {
      param['title'] = text || ''
      param['icon'] = 'success'
      break
    }
    case 'error': {
      param['title'] = text || ''
      param['image'] = '/images/emoji.png'
      break
    }
    default: {
      break
    }
  }
  wx.showToast(param)
}

function hashcode(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
/**
 * 打开企业微信启明店客服
 */
function  openQYWXCustomerServiceChat() {
  openQYWXServiceChat("https://work.weixin.qq.com/kfid/kfc6090ec30c3209ea4","ww659addeedd377a79")
  // wx.openCustomerServiceChat({
  //   extInfo: {url: 'https://work.weixin.qq.com/kfid/kfc6090ec30c3209ea4'}, //深圳启明无障碍科技有限公司 的客服链接
  //   corpId: 'ww659addeedd377a79',  // 深圳启明无障碍科技有限公司 的企业微信ID
  //   success(res) {}
  // })
}
/**
 * 打开企业微信  启明店售后 的客服 
 */
function  openQYWXAfterSalesServiceChat() {
  openQYWXServiceChat("https://work.weixin.qq.com/kfid/kfc7a2c05abe67ab0ea","ww659addeedd377a79")
}
/**
 * 打开企业微信  启明店售后 的客服 
 */
function  openQYWXAPPServiceChat() {
  openQYWXServiceChat("https://work.weixin.qq.com/kfid/kfc78b803233cbfdc87","ww659addeedd377a79")
}
/**
 * 
 * @param {*} url  客服链接， https://work.weixin.qq.com/wework_admin/frame#/app/servicer  在里面找
 * @param {*} corpId   企业微信ID  ww659addeedd377a79  深圳启明客服 https://work.weixin.qq.com/wework_admin/frame#/profile
 */
function openQYWXServiceChat(url,corpId){
  wx.openCustomerServiceChat({
    extInfo: {url: url}, //深圳启明无障碍科技有限公司 的客服链接
    corpId: corpId,  // 深圳启明无障碍科技有限公司 的企业微信ID
    success(res) {}
  })
}
module.exports = {
  formatTime,
  showBusy,
  showSuccess,
  showModal,
  showCon,
  toPNGBase64,
  showLoading,
  hideLoading,
  isEmpty,
  sleep,
  showToast,
  timestampFormat,
  showError,
  canUseOcr,
  hashcode,
  openQYWXCustomerServiceChat:openQYWXCustomerServiceChat,
  openQYWXAfterSalesServiceChat:openQYWXAfterSalesServiceChat,
  openQYWXAPPServiceChat:openQYWXAPPServiceChat
}