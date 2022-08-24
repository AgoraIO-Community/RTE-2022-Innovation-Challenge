Component({
  data: {
    "color": "#a9b7b7",
    "selectedColor": "#09BB07",
    "list": [
      {
        "selectedIconPath": "../../image/ic_visible_show.png",
        "iconPath": "../../image/ic_visible.png",
        "pagePath": "/pages/qmt/qmt",
        "text": "启明瞳"
      },
      {
        "selectedIconPath": "../../image/ic_my_show.png",
        "iconPath": "../../image/ic_my.png",
        "pagePath": "/pages/my/my",
        "text": "我的"
      }
    ]
  },
  properties: {
    selected: Number,
  },

  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      console.log(data);
      const url = data.path
      wx.reLaunch({
        url: url,
      })
      this.setData({
        selected: data.index
      })
    }
  }
})