let logitems = [];
let uid = `${parseInt(Math.random() * 1000000)}`;
let timer;
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const getUid = () => {
  return uid;
}
const log = (msg, level) => {
  let time = formatTime(new Date());
  logitems.push(`${time}: ${msg}`);
  if (level === "error") {
    console.error(`${time}: ${msg}`);
  } else {
    console.log(`${time}: ${msg}`);
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//判断字符是否为空的方法
function isEmpty(text) {
  var obj = (text + '').replace(/(^\s*)|(\s*$)/g, "") //去掉字符串的前后空格

  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}
const debounce = function(fn, delay) {
  return function () {
    let context = this
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}



const mashupUrl = (url, channel) => {
  return url;
}

const requestPermission = (scope, cb) => {
  wx.getSetting({
    success(res) {
      if (res.authSetting[scope]) {
        cb && cb();
      } else {
        wx.authorize({
          scope: scope,
          success() {
            cb && cb();
          }
        })
      }
    }
  })
}

const checkSystemInfo = (app) => {
  if (typeof(systemInfoChecked) == 'undefined') {
    var systemInfoChecked = true;
    wx.getSystemInfo({
      success: function (res) {
        log(`${JSON.stringify(res)}`);
        let sdkVersion = res.SDKVersion;
        let version_items = sdkVersion.split(".");
        let major_version = parseInt(version_items[0]);
        let minor_version = parseInt(version_items[1]);

        app.globalData.systemInfo = res;

        if (major_version <= 1 && minor_version < 7) {
          wx.showModal({
            title: '版本过低',
            content: '微信版本过低，部分功能可能无法工作',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })
  }
}
/**
 * 封装toast,用于help/help里面的语音显示功能
 * 2019.1.17 limei
 */
function showToast(type, text, obj) {
  let param = { duration: (obj && obj.duration) || 1500, mask: (obj && obj.isMask) || false }
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



module.exports = {
  isEmpty:isEmpty,
  getUid: getUid,
  checkSystemInfo: checkSystemInfo,
  formatTime: formatTime,
  requestPermission: requestPermission,
  log: log,
  clearLogs: function () {logitems = []},
  getLogs: function () { return logitems },
  mashupUrl: mashupUrl,
  debounce: debounce
}

