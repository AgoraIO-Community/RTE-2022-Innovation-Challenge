// miniprogram/pages/list/list.js
// 初始化环境
// const db = wx.cloud.database({
//   env: 'qmt-test-869cb2'
// })
var ace = require('../../utils/ace.js')

Page({
  data: {
    listArray: [],
    title: '盲友故事',
    type: 'mygs',
    pageNum: 0,
    isEnd:false  //是否把所有的数据加载完了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.setNavigationBarTitle({
    //   title: options.title,
    // })
    // console.log(options)
    ace.showLoading('加载中')
    var that = this;

    // 获取集合引用
    // const mpArticles = db.collection('mp_articles')
    db.collection('mp_articles')
      .where({
        type: options.type
      })
      .get({
        success(res) {
          ace.hideLoading();
          // console.log(that.data.pageNum)

          that.setData({
            title: options.title,
            type: options.type,
            listArray: res.data,
            // 小程序端在获取集合数据时服务器一次默认并且最多返回 20 条记录,所以res.data只包含20条记录
            pageNum: that.data.pageNum + 20,
            title: options.title
          })
          // console.log(that.data.pageNum)
          // console.log(res.data)
        }
      })
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      sysInfo: wx.getStorageSync('sysInfo')
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.isEnd){
      ace.showToast('没有更多了')
    }else{
      ace.showLoading('加载中...')
      var that = this;
     
      db.collection('mp_articles')
        .where({
          type: this.data.type
        })
        .skip(that.data.pageNum)  //跳过已加载的部分
        .get({
          success(res) {
            ace.hideLoading();
            console.log("新的数据长度：" + res.data.length)
            // console.log("新加载的数据" + JSON.stringify(res.data) )
            if(res.data.length <=0 ){
              ace.showToast('已经加载完成了')
                that.setData({
                  isEnd:true
                })
            }else{
              for (var i in res.data) {
                
                // 将新加载的数据添加到列表后面
                that.data.listArray.push(res.data[i])
              }
              // that.data.listArray.push.apply(that.data.listArray, res.data);
              that.setData({
                listArray: that.data.listArray,
                pageNum: that.data.pageNum + 20
              })
            } 
          }
        })
    }
    

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '有人@我，助盲资料大全，值得收藏，来自盲人新视界微信公共账号' + this.data.title,
      desc: '@所有人，助盲资料大全，值得收藏，来自盲人新视界微信公共账号' + this.data.title,
      path: '/pages/list/list?type=' + this.data.type + '&title=' + this.data.title
    }
  }
})