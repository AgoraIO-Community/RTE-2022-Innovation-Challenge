const ace = require('../../utils/ace.js')
const config = require('../../config.js')
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  data: {
    sysInfo: {}
  },
  properties: {
    /**
     *  导航栏标题
     */
    title: {
      type: String,
      value: "启明瞳"
    },
    /**
     * @description:  是否为子页，默认为否，不需要返回键
     */
    subPage: {
      type: Boolean,
      value: false
    },
    /**
     * @description:  是否是启明fm用户（不需要显示下载图标），默认为否
     */
    fm: {
      type: Boolean,
      value: false
    },
    /**
     * @description:  是否是启明瞳app用户（不需要显示下载图标），默认为否
     */
    app: {
      type: Boolean,
      value: false
    },
    /**
     * @description:  教程类型：1. 主页面教程 2. 有声书教程 3. 文字/图片求助教程 4. 经典文章
     */
    helpType: {
      type: Number,
      value: 1
    }
  },
  observers: {
    'app': function (app) {
      if (app)
        Object.defineProperty(this.properties.app, value, true);
    },
    'fm': function (fm) {
      if (fm)
        Object.defineProperty(this.properties.fm, value, true);
    },
    'helpType': function (val) {
      var HelpUrl = "https://mangrende.club/category/13?search_ids=13"
      this.setData({
        HelpUrl: HelpUrl
      })
    }
  },
  lifetimes: {
    attached() {
      //todo  需要进行优化调整
      var NoticeUrl = "https://mangrende.club/category/13?search_ids=13"
      var DownloadUrl = "https://mangrende.club/category/13?search_ids=13"
      this.setData({
        sysInfo: wx.getStorageSync('sysInfo'),
        NoticeUrl: NoticeUrl,
        DownloadUrl: DownloadUrl
      })
    },
  },
  methods: {
    /**
     *  @description: 返回
     */
    return () {
      var pages = getCurrentPages();
      var pageNum = getCurrentPages().length;
      console.log(pages);
      var launchOptions = wx.getLaunchOptionsSync();
      console.log(launchOptions);
      if (launchOptions.scene == 1173) {
        console.log('重启');
        wx.reLaunch({
          url: '../../pages/qmt/qmt',
        })
      }
      if (pageNum == 1) {
        wx.reLaunch({
          url: '../../pages/qmt/qmt',
        })
      } else {
        wx.navigateBack({
          delta: 1 // 回退前 delta(默认为1) 页面
        })
      }

    },
    /**
     * @description:  通知
     */
    notice() {
      var userInfo = wx.getStorageSync("userInfo");
      var lastHelpInfoId = wx.getStorageSync("lastHelpInfoId") * 1;
      if (lastHelpInfoId == 0) {
        ace.showToast('现在没有最新通知！');
      } else {
        wx.request({
          url: config.bizAPI.questionAndAnswer,
          header: {
            'content-type': 'application/json'
          },
          method: "POST",
          data: {
            id: lastHelpInfoId
          },
          success: function (res) {
            let answerList = res.data.content.offerHelpInfos;
            if (answerList.length == 0) {
              ace.showToast('当前还没有志愿者回复！请留意微信通知！');
            } else {
              wx.navigateTo({
                url: '/pages/showhelp/showhelp?helpInfoId=' + lastHelpInfoId,

              })
            }
          },
          fail: function (e) {
            ace.showToast('获取志愿者回复信息失败，请重试！');
          }
        })


      }
    },
    /**
     * @description:  下载
     */
    download() {
      this.triggerEvent('download', {});
    },
    /**
     * @description:  打开app
     */
    app() {
      this.triggerEvent('app', {});
    },
    /**
     * @description:  打开fm
     */
    fm() {
      this.triggerEvent('fm', {});
    },
    /**
     * @description:  分享
     */
    share() {

    },
    /**
     * @description:  帮助
     */
    help() {
      this.triggerEvent('help', {});
    }
  }
})