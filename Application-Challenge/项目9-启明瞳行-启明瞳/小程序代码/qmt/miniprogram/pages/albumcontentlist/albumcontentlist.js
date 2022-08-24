// miniprogram/pages/list/list.js
// 初始化环境
const db = wx.cloud.database({
    env: 'qmt-test-869cb2'
});
let config = require('../../config.js');
var ace = require('../../utils/ace.js')

Page({
    data: {
        title: '',
        album: '',
        albumId: 0,
        index: 0,
        currPage: 1,
        pageSize: 10,
        totalPage: 0,
        publicName: ['qmtfwh', 'ACCESSIBILITY_TECHNOLOGY'],
        albumContentList: []
    },
    transDate (time) {
        // eslint-disable-next-line no-extend-native
        Date.prototype.format = function(fmt) {
            let o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(let k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        };
        return new Date(time).format("yyyy-MM-dd");
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            title: options.title,
            albumId: options.albumId
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
        var that = this;
        let num = that.data.index;
        wx.request({
            url: config.bizAPI.getArticleContent,
            data: {
                'content': {
                    "appName": that.data.publicName[num],
                    "albumId": Number(that.data.albumId),
                    "miniappPublic": 1
                },
                'currPage': that.data.currPage,
                'pageSize': that.data.pageSize
            },
            header: {
                "Content-Type": "application/json"
            },
            method: 'POST',
            success(res){
                let contentList = [];
                let tempList = res.data.content;
              console.log(tempList)
                for(let i = 0; i < tempList.length; i++){
                    let temp = {};
                    temp.title = tempList[i].title;
                    temp.thumbUrl = tempList[i].thumbUrl;
                    temp.id = tempList[i].id;
                    temp.updateTime = that.transDate(tempList[i].updateTime);
                    temp.author = tempList[i].author;
                    temp.appName = tempList[i].appName;
                    contentList.push(temp);
                }
                that.setData({
                    albumContentList : contentList,
                    totalPage: res.data.pageTotal
                }
                );
            }
        });
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
        var that = this;
        let total = this.data.totalPage;
        let curr = this.data.currPage;
        let num = that.data.index;
        if (curr >= total/this.data.pageSize){ 
            ace.showToast('加载中...');
            num = num + 1;
            curr = 1;
            if (num < 2){
                wx.request({
                    url: config.bizAPI.getArticleContent,
                    data: {
                        'content': {
                            "appName": that.data.publicName[num],
                            "albumId": Number(that.data.albumId),
                            "miniappPublic": 1
                        },
                        'currPage': curr,
                        'pageSize': that.data.pageSize
                    },
                    header: {
                        "Content-Type": "application/json"
                    },
                    method: 'POST',
                    success(res){
                        let contentList = that.data.albumContentList;
                        let tempList = res.data.content;
                        for(let i = 0; i < tempList.length; i++){
                            let temp = {};
                            temp.title = tempList[i].title;
                            temp.thumbUrl = tempList[i].thumbUrl;
                            temp.id = tempList[i].id;
                            temp.updateTime = that.transDate(tempList[i].updateTime);
                            temp.author = tempList[i].author;
                            temp.appName = tempList[i].appName;
                            contentList.push(temp);
                        }
                        that.setData({
                                albumContentList : contentList,
                                totalPage: res.data.pageTotal,
                                index : num
                            }
                        );
                        ace.showToast('已经加载完成了')
                    }
                });
            }else {
                ace.showToast('没有更多了...');
            }

        }else {
            ace.showLoading('加载中...');
            wx.request({
                url: config.bizAPI.getArticleContent,
                data: {
                    'content': {
                        "appName": that.data.publicName[num],
                        "albumId": Number(that.data.albumId),
                        "miniappPublic": 1
                    },
                    'currPage': curr + 1,
                    'pageSize': that.data.pageSize
                },
                header: {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                success(res){
                    let contentList = that.data.albumContentList;
                    let tempList = res.data.content;
                    for(let i = 0; i < tempList.length; i++){
                            let temp = {};
                            temp.title = tempList[i].title;
                            temp.thumbUrl = tempList[i].thumbUrl;
                            temp.id = tempList[i].id;
                            temp.updateTime = that.transDate(tempList[i].updateTime);
                            temp.author = tempList[i].author;
                            temp.appName = tempList[i].appName;
                            contentList.push(temp);
                    }
                    that.setData({
                            albumContentList : contentList,
                            totalPage: res.data.pageTotal,
                            currPage : curr + 1
                        }
                    );
                    ace.showToast('已经加载完成了')
                }
            });
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        return {
          title: "有人@我,盲人都在看"+this.data.title + ' 推荐给你看一看',
          desc: "有人@我,盲人都在看" + this.data.title + ' 推荐给你看一看',
            path: '/pages/albumcontentlist/albumcontentlist?title=' + this.data.title
        }
    }
})