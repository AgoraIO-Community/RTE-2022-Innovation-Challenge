var promise = require('./promise.js')
const backgroundAudioManager = getApp().globalData.backgroundAudioManager;
//歌曲接口重构


//方法封装
const wxGetRequest = (p, u) => {
  wx.request({
    url: u,
    header: {
      'Content-Type': 'application/json'
    },
    data: {},
    method: 'GET',
    success: (res) => {
      p.success && p.success(res);
    },
    fail: (err) => {
      console.log(err)
    }
  })
}

const wxPostRequest = (p, u) => {
  wx.request({
    url: u,
    header: {
      'Content-Type': 'application/json'
    },
    data: p.data,
    method: 'POST',
    success: (res) => {
      p.success && p.success(res);
    },
    fail: (err) => {
      console.log(err)
    }
  })
}

const request = {
  albumListPage: (params) => wxGetRequest(params, apiUrl.ximalaya_albumUrlPage.replace('[albumId]', params.data.albumId).replace('[pageId]', !params.data.pageId ? wx.getStorageSync('pageId') : params.data.pageId).replace('[pageSize]', !params.data.pageSize ? wx.getStorageSync('pageSize') : params.data.pageSize)),
  // albumList: (params) => wxGetRequest(params, apiUrl.ximalaya_albumUrl.replace('[albumId]', params.data.albumId)),
  recommendsList: (params) => wxGetRequest(params, apiUrl.ximalaya_recommendUrl),
  hotAndGuess: (params) => wxGetRequest(params, apiUrl.ximalaya_hotAndGuess),
  albumDescription: (params) => wxGetRequest(params, apiUrl.ximalaya_albumUrl.replace('[albumId]', params.data.albumId))
}

const requestPromisePost = (url, data_) => {
  // console.log(data_)
  // 返回一个Promise实例对象
  var promise =  new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: data_,
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {//服务器返回数据
        if (res.statusCode == 200) {
          resolve(res);
        } else {//返回错误提示信息
          reject(res.data);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}

const requestPromiseGet = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {//服务器返回数据
        if (res.statusCode == 200) {
          resolve(res);
        } else {//返回错误提示信息
          reject(res.data);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  })
}

//封装异步api
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}

const requestPromise = {
  //todo 添加方法
  qmtFollower: (url, data) => requestPromisePost(url, data),
  questionAndAnswer: (url,data) => requestPromisePost(url,data)
}


const playCtrl = {
  
  pause_: () => backgroundAudioManager.pause(),
  play_: (p) => {
    //暂停/播放逻辑 if为false表示同一首 
    if (!!wx.getStorageInfoSync("now_songUrl") && (p.url != wx.getStorageSync("now_songUrl"))){
      backgroundAudioManager.src = p.url,
      backgroundAudioManager.title = p.title
      wx.setStorageSync('now_songUrl', (p.url))
    }
    backgroundAudioManager.play()
  },
  stop_: () => backgroundAudioManager.stop(),

}

module.exports = {
  playCtrl,
  request,
  requestPromise,
  wxPromisify
}
