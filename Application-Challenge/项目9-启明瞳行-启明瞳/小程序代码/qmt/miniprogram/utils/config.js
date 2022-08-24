const APPID = "438c6da7d0484fbe8dbfeba72634ad1f"; 
 
if(APPID === ""){ 
  wx.showToast({ 
    title: `请联系管理员，配置的APPID`, 
    icon: 'none', 
    duration: 5000 
  }); 
} 
 
var host = 'https://accessible.mobi/v2/';


var config = {
  appid: 'wxce8e592adfc78ceb',

  /**
   * 业务后台接口
   */
  bizAPI: {
    login: host+'session/login',
    checkSession: host+'session/checkSession',
    saveUserInfo: host+'session/saveUserInfo',
    checkIsFollower: host+'follower/checkIsFollower',
    updateGradePoint: host+'help/updateGradePoint',
    questionAndAnswer: host+'help/getQuestionAndAnswer',
    uploadFileCos: host+'cos/upload',
    askForHelp: host+'help/askForHelp',
    offerHelpInfo: host+'help/offerHelp'
  },
  /**
   * 本地地址调试
   */
  bizAPILocal: {
    login: 'http://localhost:8080/session/login',
    saveUserInfo: 'http://localhost:8080/session/saveUserInfo',
    getHelpInfo: 'http://localhost:8080/help/getHelpInfo',
    offerHelpInfo: 'http://localhost:8080/help/offerHelp',
    incrScore: 'http://localhost:8080/score/incr',
    cancelOfferHelp: 'http://localhost:8080/help/cancelHelp',
    doneInfo: 'http://localhost:8080/score/get',
    getMyScore: 'http://192.168.0.89:8080/help/querySumPointByOpenid',
    getAlbumList: 'http://129.204.129.170/zm/backManage/queryAlbumList',
    getArticleContent: 'http://129.204.129.170/zm/backManage/queryBackMaterialListByPage',
  },

  loadingUrl: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/loading.mp3',
  shutter: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
  fm_player_status:'fm_status'

};

module.exports = { 
  APPID: APPID ,
  config:config
}