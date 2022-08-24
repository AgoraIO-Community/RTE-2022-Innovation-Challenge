var ace = require('../../utils/ace.js')
var config = require('../../config');
var util = require('../../utils/util.js');


Page({
  data: {
    historyList:[],//将每次加载（每一页）的数据	albums 合并albumList里面。
		total_page: '', //总共多少页
		current_page: '', //当前页面
		total_count: '', //专辑的个数
		count:20 //每次访问获取的  每页多少条，默认20，最多不超过200
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var userInfo = wx.getStorageSync('userInfo');
		this.getAlbumsInfoById(userInfo.qmid, 1, this.data.count);

  },

  onReady: function() {
    // 页面渲染完成
  },

  onShow: function() {
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo'),
    });
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  onShareAppMessage: function() {
    return this.data.shareData
  },

  getAlbumsInfoById: function (qmid, page, count) {
    ace.showLoading('第' + page + '页加载中')
    var that = this;
		wx.request({
      url: config.bizAPI.getHistoryList,
      method: "POST",
      data: {
        code:0,
        content:{"qmid": qmid},
        currPage: page,
        pageSize: count
      },
      success: function (res) {
        console.log(res);
        for (var i in res.data.content) {
          var record = res.data.content[i];
          record.createTime = util.timestampFormat(record.createTime, 'Y-M-D h:m:s')
          record.imageUrl = util.hashcode(JSON.stringify(record.imageUrl));
          that.data.historyList.push(res.data.content[i])
        }
        that.setData({
          historyList: that.data.historyList,
          page: that.data.page + 1
        })
        ace.hideLoading();
      },
      fail: function (res) {
        console.error(res);
        ace.hideLoading();
      }
    })
	},

	onReachBottom: function () {
		if (this.data.current_page < this.data.total_page) {
			this.getAlbumsInfoById(this.data.column_id, 'natural', 'desc', this.data.current_page + 1, this.data.count)
		} else {
			ace.showToast('已经是最后页了')
		}
	},

  todetail: function(e) {
    console.log(e);
    wx.navigateTo({
      url: '../getHistoryInfo/getHistoryInfo?helpid='+ e.currentTarget.dataset.id+'&imgHash='+ e.currentTarget.dataset.imgurl,
    })
    // ../getHistoryInfo/getHistoryInfo?helpid={{item.id}}&imgHash={{item.imageUrl}}
  }
})