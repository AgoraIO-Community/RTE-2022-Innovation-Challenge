
const innerAudioContext = wx.createInnerAudioContext();
var util = require('../../../utils/util.js');
var doVoice = require('../../../utils/voiceandtext/text2voice.js');
let config = require('../../../config.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        text: '',
        fontSize: '60px',
    },

    bindWordTap: function(event) {
        let fontSize = event.currentTarget.dataset.fontsize + 'px';
        this.setData({
            fontSize: fontSize
        });
    },

    bindSoundTap: function() {
        let text = this.data.text;
        doVoice.textToSpeech(text);

    },

    bindCopyTap: function() {
        var that = this;
        var text = this.data.text;
        wx.setClipboardData({
            data: text
        });
        doVoice.textToSpeech("已复制") //todo 改成下载缓存好的语音信息。
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let sysInfo = wx.getStorageSync('sysInfo');
        this.setData({
            id: options.id,
            appName: options.appName,
            sysInfo: sysInfo
        });
        let fontSize = wx.getStorageSync('fontSize');
        if (!!fontSize) {
            this.setData({
                fontSize: fontSize,
            });
        }
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
        var that = this;
        wx.request({
            url: config.bizAPI.getArticleContent,
            data: {
                'content': {
                    "appName": that.data.appName,
                    "id": Number(that.data.id)
                },
                'currPage': 1,
                'pageSize': 10
            },
            header: {
                "Content-Type": "application/json"
            },
            method: 'POST',
            success(res){
                let arr = res.data.content[0];
                WxParse.wxParse('article', 'html', arr.content, that,5);
                that.setData({
                        text : arr.content
                    }
                );
            }
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        wx.setStorage({
            key: 'fontSize',
            data: this.data.fontSize,
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        wx.setStorage({
            key: 'fontSize',
            data: this.data.fontSize,
        });
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
            title: '文字放大',
            desc: this.data.text,
            path: '/pages/tools/richtext/richtext?id=' + this.data.id + '&appName=' + this.data.appName
        };
    }
})