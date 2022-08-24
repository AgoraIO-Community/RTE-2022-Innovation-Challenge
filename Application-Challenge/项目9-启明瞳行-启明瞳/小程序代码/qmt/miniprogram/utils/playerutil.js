var api = require('./api.js');
var config = require('../config.js')
var util = require('./util.js');


function playSong(songUrl, songName) {
  wx.setNavigationBarTitle({
    title: songName ? '正在播放' + songName : '启明瞳播放器'
  })
  api.playCtrl.play_({
    url: songUrl,
    title: songName
  });
  wx.setStorageSync('currentTitle', songName);
}

//播放器翻页
function getAlbumPage(option) {
  let albumId = option.albumId;
  // let trackId = option.trackId;
  let pageId = option.pageId;
  let pageSize = option.pageSize;

  let songUrl = '';
  let songName = '';

  if (!!albumId) {
    api.request.albumListPage({
      data: {
        albumId: albumId,
        pageId: pageId,
        pageSize: pageSize
      },
      success: (res) => {
        wx.setStorageSync('listId', albumId);
        wx.setStorageSync('audioList', res.data.data.list);
        wx.setStorageSync('totalCount', res.data.data.totalCount);
        var albumList = res.data.data.list;
        songUrl = albumList[option.index].playUrl64;
        songName = albumList[option.index].title
        wx.setStorageSync('currentPlay', option.index);
        wx.setStorageSync('currentTitle', songName);
        playSong(songUrl, songName);
      }
    })
  }
}

/**
 * @method
 * @description 下一首
 * 从缓存中获取列表
 */
function _next() {
  let index = wx.getStorageSync('currentPlay');
  let listId = wx.getStorageSync('listId');
  let songUrl = '';
  let songName = '';
  if (!!listId) {
    util.showLoading("正在加载中...");
    wx.getStorage({
      key: 'audioList',
      success: res => {
        console.log(res.data);
        let totalCount = wx.getStorageSync('totalCount');
        let cCover;
        if (index + 1 < wx.getStorageSync('pageSize')) {
          //过滤空的url和无效（https，http)
          do {
            index++;
            console.log('index' + index)
          } while ((res.data[index].playPathAacv164.length < 6) && (index + 1 < wx.getStorageSync('pageSize')));
          songUrl = res.data[index].playPathAacv164;
          songName = res.data[index].title;
        } else if (!!totalCount && index + 1 >= totalCount) {
          index = 0;
          while ((res.data[index].playPathAacv164.length < 5) && (index + 1 < wx.getStorageSync('pageSize'))) {
            index++;
            console.log('index' + index)
          }
          songUrl = res.data[index].playPathAacv164;
          songName = res.data[index].title;
        } else if (!!totalCount && totalCount > wx.getStorageSync('pageSize')) {
          var pageId_now = !wx.getStorageSync('pageId_now') ? 1 : wx.getStorageSync('pageId_now');
          getAlbumPage({
            albumId: listId,
            pageId: ++pageId_now,
            pageSize: wx.getStorageSync('pageSize'),
            index:0
          })
          wx.setStorageSync('pageId_now',pageId_now);
          util.hideLoading();
          return;
        };
        wx.setStorageSync('currentPlay', index);
        wx.setStorageSync('currentTitle', songName);
        console.log('currentPlay' + index);
        playSong(songUrl, songName);
      },
      fail: function (err) {
        console.log(err);
      }
    });
    util.hideLoading();
  } else {
    return;
  };
}

/**
 * @method
 * @description 上一首
 * 从缓存中获取列表
 */
function _prev() {
  let index = wx.getStorageSync('currentPlay');
  let listId = wx.getStorageSync('listId');
  let songUrl = '';
  let songName = '';
  if (!!listId) {
    util.showLoading("正在加载中...");
    wx.getStorage({
      key: 'audioList',
      success: res => {
        console.log(res.data);
        let cCover;
        if (index - 1 >= 0) {
          do {
            index--;
            console.log('index' + index)
          } while ((res.data[index].playPathAacv164.length < 6) && (index - 1 >= 0));
          songUrl = res.data[index].playPathAacv164;
          songName = res.data[index].title;
        } else if (index == 0 && wx.getStorageSync('pageId_now') > 1){
          //翻到前一页
          var pageId_now = !wx.getStorageSync('pageId_now') ? 1 : wx.getStorageSync('pageId_now');
          getAlbumPage({
            albumId: listId,
            pageId: --pageId_now,
            pageSize: wx.getStorageSync('pageSize'),
            index: wx.getStorageSync('pageSize')-1
          })
          wx.setStorageSync('pageId_now', pageId_now);
          util.hideLoading();
          return;
        }else{
          //第一页 第0调 不再翻页
          songUrl = res.data[index].playPathAacv164;
          songName = res.data[index].title;
        };
        wx.setStorageSync('currentPlay', index);
        wx.setStorageSync('currentTitle', songName);
        console.log('currentPlay' + index);
        playSong(songUrl, songName);
      },
      fail: function (err) {
        console.log(err);
      }
    });
    util.hideLoading();
  } else {
    return;
  };
}

module.exports = {
  _prev: _prev,
  _next: _next,
  playSong: playSong
}