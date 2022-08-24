// pages/sport/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '龙岗体验关爱工程无障碍运动',

    // activity: {
    //   title: "行走的力量",
    //   image: "../../../image/longgangtiyuguanai.png"
    // },
    modal: {
      hidden: true,
      typo: null,
      errMessage: null,
      data: {},
    },
    topDonates: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this
    app.getUserCookie(function(cookie) {
      // 更新用户信息
      that.updateUserInfo();
    });

    wx.login({
      success(res) {
        const code = res.code;
        wx.getWeRunData({
          success(res) {
            // 拿 encryptedData 到开发者后台解密开放数据
            const encryptedData = res.encryptedData
            const iv = res.iv;
            wx.request({
              url: config.bizAPI.getWeRun,
              data: {
                appid: config.appid,
                encryptedData: encryptedData,
                iv: iv,
                code: code,
              },
              method: "GET",
              success:function (res) {
                
                var stepInfoList = JSON.parse(res.data.content).stepInfoList;
                for(var i = 0; i < stepInfoList.length; i++) {
                  stepInfoList[i].timestamp = util.timestampFormat(stepInfoList[i].timestamp*1000, 'Y-M-D');
                }
                console.log(stepInfoList);
              },
              fail: function(res) {
                console.log('获取用户步数出错！');
              }
            })
            console.log(res);
            // 或拿 cloudID 通过云调用直接获取开放数据
            const cloudID = res.cloudID
          }
        })
      },
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this
    app.getUserCookie(function (cookie) {
      // 获取 activity 信息
      that.getActivityInfo();
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  // 更新用户基础信息
  updateUserInfo: function(e) {
    app.getUserInfo(function (userInfo) {
      //更新数据
      wx.request({
        url: app.makeRequestUrl("/api/user"),
        method: "POST",
        data: {
          userinfo: userInfo
        },
        header: {
          'Cookie': app.globalData.cookie,
        }
      })
    });
  },

  // 获取 activity 信息
  getActivityInfo: function() {
    var that = this;
    wx.request({
      url: app.makeRequestUrl("/api/activity"),
      method: "GET",
      header: {
        'Cookie': app.globalData.cookie,
      },
      success: function (res) {
        that.setData({
          activity: res.data
        });
        wx.setNavigationBarTitle({
          title: res.data.title
        });

        that.getTop10Donates(res.data.id);
      }
    })
  },

  //获取 top 10 donates 信息
  getTop10Donates: function(activityId) {
    var that = this;
    wx.request({
      url: app.makeRequestUrl("/api/sports"),
      method: "GET",
      header: {
        'Cookie': app.globalData.cookie,
      },
      data: {
        activity_id: activityId,
      },
      success: function (res) {
        that.setData({
          topDonates: res.data
        });
      }
    }) 
  },

  onSubmit: function(e) {
    let currentTime = new Date().getTime();
    if (currentTime - lastSendTime < 1500) {
      return null;
    }
    lastSendTime = currentTime;

    wx.showToast({
      title: '正在提交数据，请勿重复点击',
      icon: 'success',
      image: '../../../image/checked.png',
      duration: tipsDuration
    });

    var that = this;
    wx.getWeRunData({
      success(res) {
        wx.request({
          url: app.makeRequestUrl("/api/sport"),
          method: "POST",
          data: {
            encrypted_data: res.encryptedData,
            iv: res.iv,
            activity_id: that.data.activity.id,
          },
          header: {
            'Cookie': app.globalData.cookie,
          },
          success: function(res) {
            var modalStatus = {
              hidden: false,
              data: res.data
            }

            if (res.statusCode == 200) {
              modalStatus.typo = 0 
            } else if (res.statusCode == 408){
              modalStatus.typo = 1
            } else if (res.statusCode == 400){
              modalStatus.typo = 2
            } else {
              modalStatus.typo = 3
              modalStatus.message = res.data.message
            }
            var costTime = new Date().getTime() - currentTime;
            if (costTime < 0) {
              costTime = 400;
            }

            setTimeout(function () {
              that.setData({
                modal: modalStatus
              });}, tipsDuration - costTime + 300);
          }
        })
      },
      fail(data) {
        wx.showToast({
          title: '请确认已授权获取运动数据',
          icon: "success",
          duration: 1000
        })
      }
    })
  },

  onModalHide: function(e) {
    this.setData({
      modal: {
        hidden: true,
        typo: null,
        data: null,
        errMessage: null,
      }
    });
  },

  onShowBannerInfo: function(e) {
    this.setData({
      modal: {
        hidden: false,
        typo: 4,
      }
    });
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})