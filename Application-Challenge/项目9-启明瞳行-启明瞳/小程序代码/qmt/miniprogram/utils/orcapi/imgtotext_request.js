let md5 = require('../md5.js');
let Promise = require('../promise.js');
let util = require('../util.js')

let app_id = '1106813830';
let app_key = 'uRGq1rD3mCbKfmXp';
let url = 'https://api.ai.qq.com/fcgi-bin/vision/vision_imgtotext';

let request = (base64Img) => {
  let params = {
    app_id: app_id,
    image: base64Img,
    nonce_str: Math.random().toString(36).substr(2),
    time_stamp: parseInt(new Date().getTime() / 1000).toString(),
    session_id: Math.random().toString(36).substr(2)
  };
 // console.log('请求签名===>' + _genRequestSign(params));
  params['sign'] = _genRequestSign(params);
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        resolve(res);
      },
      fail: function (res) {
        util.showModal('失败', JSON.stringify(res));
        reject({
          code: 1,
          reason: '读取图片数据失败'
        });
      }
    });
  });
}

let _genRequestSign = (params) => {
  // 1. 对请求参数按字典升序排序
  params = _sortObject(params)
  // 2. 拼接键值对，value部分进行URL编码
  let paramStr = ''
  let keys = Object.keys(params)
  for (let idx in keys) {
    let key = keys[idx]
    paramStr += key + '=' + encodeURIComponent(params[key]) + '&'
  }
  // 3. 拼接key
  paramStr += 'app_key=' + app_key
  // 4. md5
  return md5.hexMD5(paramStr).toUpperCase()
}

let _sortObject = (obj) => {
  var keys = Object.keys(obj).sort()
  var newObj = {}
  for (var i = 0; i < keys.length; i++) {
    newObj[keys[i]] = obj[keys[i]]
  }
  return newObj
}

module.exports = {
  request: request
}