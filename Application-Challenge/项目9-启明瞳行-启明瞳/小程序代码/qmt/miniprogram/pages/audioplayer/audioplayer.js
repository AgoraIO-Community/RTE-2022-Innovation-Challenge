var api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var fm_player = require('../../utils/playerutil.js');
var times = 0; // 次数记录控制一次播放一首
var playStatus = 1;
var autonext = true;
const backgroundAudioManager = getApp().globalData.backgroundAudioManager;

Page({
  data: {
    tip: "帮助提醒：点击屏幕任意处暂停播放,上下滑动可快退快进,左右滑动可切换前后音频,点击右下角分享该节目,在手机通知栏和微信聊天顶部可系统控制播放器暂停和取消",
    startX: 0, //开始坐标
    startY: 0,
    albumId: "",
    trackId: "",
    albumBg: "",//播放器背景图片
    songName: "启明无障碍音乐播放器",// 播放器，
    focusImages: "",
    specialColumn: "",
    status: 0,      //进入自动开始
    songAuthor: ""
  },
  //initFlag 是否切换频道0不切换；1切换
  onLoad: function (options) {
    //0 不自动切换下一首，1自动切换下一首
    //autonext = options.autonext;  可能需要增加判断？但是传过来的数值没有相关判定
    console.log("onLoad" + JSON.stringify(options));
    //initFlag == 1 需要初始化缓存，从pageId_now=1开始播放; options.pre=true album页面跳转过来
    if (!!options.initFlag && options.initFlag == 1 && !options.pre){
      wx.setStorageSync('pageId_now',1)
    }
    this.getAlbumPage(wx.getStorageSync('pageId_now'), wx.getStorageSync('pageSize'), options.albumId, options.trackId, options.initFlag);
  },
  onReady: function () {
    
  },
  onShow: function () {
    if (!!autonext){
      // 自动切换监听
      backgroundAudioManager.onEnded(() => {
        var currentPlay_next = wx.getStorageSync("currentPlay") + 1;
        var url = wx.getStorageSync("audioList")[currentPlay_next].playUrl64;
        var title = wx.getStorageSync("audioList")[currentPlay_next].title;
        var songAuthor = !wx.getStorageSync("audioList")[currentPlay_next].nickname ? '无障碍科技' : wx.getStorageSync("audioList")[currentPlay_next].nickname;
        wx.setStorageSync('currentPlay', currentPlay_next);
        wx.setStorageSync('currentTitle', title);
        this.setData({
          songAuthor: songAuthor,
          songName: title,
        })
        wx.vibrateLong({});
        fm_player.playSong(url, title);
      })
    }
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
    })
    // 页面显示
  },
  onHide: function () {
    console.log('页面隐藏');
    // 页面隐藏
    // api.playCtrl.pause();
  },
  onUnload: function () {
    console.log('页面关闭');
    // 页面关闭
    wx.setStorageSync("now_songUrl", '');
    wx.setStorageSync("now_title", '');
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let albumId = !!this.data.albumId == true ? this.data.albumId : wx.getStorageSync('listId');
    return {
      title: "有人@我"+this.data.songName+"来自于启明电台APP",
      desc: '@所有人,启明电台各种娱乐学习教程飞起，赶快下载盲人音频教程',
      path: 'pages/audioplayer/audioplayer?albumId=' + albumId + '&trackId=' + this.data.trackId + '&initFlag=1'
    };
  },

  //递归 查询trackId
  getAlbumPage: function (pageId, pageSize, albumId, trackId, initFlag) {
    let songUrl = '';
    let title = '';
    let songAuthor = '';
    let albumIcon = '';
    // let initFlag = initFlag;
    if (!!albumId && !!trackId) {
      api.request.albumListPage({
        data: {
          albumId: albumId,
          pageId: pageId,
          pageSize: pageSize
        },
        success: (res) => {
          wx.setStorageSync('pageId_now', res.data.data.pageId);
          wx.setStorageSync('listId', albumId);
          wx.setStorageSync('audioList', res.data.data.list);
          wx.setStorageSync('totalCount', res.data.data.totalCount);
          var albumList = res.data.data.list;
          for (var i = 0; i < albumList.length; i++) {
            if (albumList[i].trackId == trackId) {
              songUrl = albumList[i].playUrl64;
              title = albumList[i].title;
              songAuthor = !albumList[i].nickname ? '无障碍科技' : albumList[i].nickname;
              albumIcon = !albumList[i].coverSmall ? albumList[i].coverLarge : albumList[i].coverSmall;
              wx.setStorageSync('currentPlay', i)
              console.log('匹配信息 ' + title + '  ' + songUrl)
              this.setData({
                songAuthor: songAuthor,
                songName: title,
                albumBg: albumIcon,
                trackId: trackId,
                albumId: albumId
              });
              //加载成功后长震动。
              wx.vibrateShort({
              })
              // 获取 专辑的相关信息 加载完成
              util.hideLoading();
              fm_player.playSong(songUrl, title);

              return;
            } else if (i + 1 == wx.getStorageSync('pageSize')) {
              if (res.data.data.totalCount > wx.getStorageSync('pageSize')) {
                console.log('pageId =====》' + (parseInt(pageId) + 1))
                //递归翻页
                this.getAlbumPage(parseInt(pageId) + 1, pageSize, albumId, trackId);
              } else {
                //无匹配trackId
                return;
              }
            } else {
              continue;
            }
          }
        }
      })
    } else {
      //TODO 先判定在不在 album.js ->'audioList' 缓存中，如果不在再发起网络请求
      api.request.albumListPage({
        data: {
          albumId: !albumId ? wx.getStorageSync('listId') : albumId,
          pageId: pageId,
          pageSize: pageSize
        },
        success: (res) => {
          wx.setStorageSync('pageId_now', res.data.data.pageId);
          wx.setStorageSync('audioList', res.data.data.list);
          wx.setStorageSync('totalCount', res.data.data.totalCount);

          let index = wx.getStorageSync('currentPlay');
          wx.setStorageSync('currentTitle', res.data.data.list[index].title)

          let audioList = res.data.data.list;
          title = res.data.data.list[index].title;
          songUrl = res.data.data.list[index].playUrl64;
          songAuthor = !res.data.data.list[index].nickname ? '无障碍科技':res.data.data.list[index].nickname;
          //播放页面背景图
          albumIcon = !audioList[index].coverSmall ? audioList[index].coverLarge : audioList[index].coverSmall;

          console.log("title" + title);
          this.setData({
            songUrl: songUrl,
            songAuthor: songAuthor,
            songName: title,
            albumBg: albumIcon,
            trackId: audioList[index].trackId
          })

          wx.setNavigationBarTitle({
            title: title ? '正在播放-' + title : '启明瞳播放器'
          })
          if (initFlag == 1) {
            fm_player.playSong(songUrl, title)
          }
        }
      })

    }
  },


  clickPlay: function () {
    let that = this
    let songUrl = '';
    let title = '';
    try{
      var index = wx.getStorageSync("currentPlay");
      songUrl = wx.getStorageSync("audioList")[index].playPathAacv164;
      title = wx.getStorageSync("audioList")[index].title;
      wx.setStorageSync("now_songUrl", songUrl);
      if (playStatus == 0) {
        api.playCtrl.pause_();
        playStatus = 1;
      } else {
        fm_player.playSong(songUrl, title);
        playStatus = 0;
      }
    }catch(e) {
      console.log(e)
    }
    that.setData({
      status: playStatus
    })
  },



  // ==========监听手势==============

  // 触摸开始事件  
  touchStart: function (e) {
    this.touchStartTime = e.timeStamp
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
    })

  },
  // 触摸移动事件  
  touchMove: function (e) {
    times++;
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle({
        X: startX,
        Y: startY
      }, {
          X: touchMoveX,
          Y: touchMoveY
        });

    //滑动一次轮播一首
    if (times > 1) {
      return;
    }
    //滑动小于20度角
    if (Math.abs(angle) < 20){
      //右滑
      if (touchMoveX > startX) {
        console.log('右滑动' + times);
        fm_player._next();
      } else {
        console.log('左滑动' + times)
        fm_player._prev();
      }
    } else if (70 < Math.abs(angle)<110){
      //滑动度角 位于 70 和 110
      if (touchMoveY > startY) {
        console.log('下滑动 快进 10s');
        var song_long = backgroundAudioManager.duration;
        var song_currentTime = backgroundAudioManager.currentTime;
        if (song_currentTime + 10 < song_long){
          backgroundAudioManager.seek(song_currentTime + 10);
        }else{
          fm_player._next();
        }
      } else {
        console.log('上滑动 快退 10s')
        var song_currentTime = backgroundAudioManager.currentTime;
        if (song_currentTime - 10 > 0) {
          backgroundAudioManager.seek(song_currentTime - 10);
        }else{
          fm_player._prev();
        }
      }
    } else{
      return;
    }
  },

  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  // 单击
  tap: function (e) {
    var that = this;
    wx.vibrateShort({
    })
    this.clickPlay();
  },

  // 触摸结束事件  
  touchEnd: function (e) {
    times = 0;
    //保持播放器页面和导航标题同步
    this.setData({
      songName: wx.getStorageSync('currentTitle')
    })
    //滑动成功，震动一下
    wx.vibrateShort({})
  },


})