/**
 * 小程序配置文件
 */

var host ='https://xxxxx/v2/'; //正式服务器
var aihost ='https://xxxx/v2/'; //测试服务器
var config = {
  appid: 'wxce8e592adfc78ceb',
   url: host,
  /**
   * 业务后台接口
   */
  // bizAPI: {
  //   login: 'https://www.bemyeyes.com.cn/session/login',
  //   checkSession: 'https://www.bemyeyes.com.cn/session/checkSession',
  //   saveUserInfo: 'https://www.bemyeyes.com.cn/session/saveUserInfo',
  //   checkIsFollower: 'https://www.bemyeyes.com.cn/follower/checkIsFollower',
  //   getAlbumList: 'https://www.bemyeyes.com.cn/backManage/queryAlbumList',
  //   getArticleContent: 'https://www.bemyeyes.com.cn/backManage/queryBackMaterialListByPage',
  //   updateGradePoint: 'https://www.bemyeyes.com.cn/help/updateGradePoint',
  //   questionAndAnswer: 'https://www.bemyeyes.com.cn/help/getQuestionAndAnswer',
  //   uploadFileCos: 'https://www.bemyeyes.com.cn/cos/upload',
  //   askForHelp: 'https://www.bemyeyes.com.cn/askForHelp'
  // },

  // 盲人求助志愿者订阅消息id
  subsMess:{
    askForHelp: 'todo需需要自己配置',
  },

  bizAPI: {
    login: host+'session/miniapp/loginInWxMini',
    registerByMobile: host+'session/miniapp/appRegisterWxMini',
    joinVoIPChat: host+'session/joinVoIPChat',
    checkSession: host+'session/checkSession',
    saveUserInfo: host+'session/saveUserInfo',
    checkIsFollower: host+'follower/checkIsFollower',
    getAlbumList: host+'backManage/queryAlbumList',
    getArticleContent: host+'backManage/queryBackMaterialListByPage',
    updateGradePoint: host+'help/updateGradePoint',
    questionAndAnswer: host+'help/getQuestionAndAnswer',
    uploadFileCos: host+'cos/upload',
    askForHelp: host+'help/askForHelpv1',
    getHelpInfo: host+'help/getHelpInfo',
    getUserInfoByList: host+'admin/getInfoByOpenidList',
    getInfoByImage: host+'AIDetect/detectUrlByEngine',
    getInfoByOcr: host+'AIDetect/detectOcr',
    cosUpload: host+'cos/upload',
    getFollowerFoucus: host+'follower/queryFocus',
    getOcr: aihost+'deepJava/aiDetect',
    getHistoryInfo: host+'help/getResultAndAnswer',
    getHistoryList: host+'help/getHistoryHelp',
    getFaceByImage: host+'AIDetect/baidu/faceDetect',
    getSceneByImage: host+'AIDetect/xf/imgUrl/detectScene',
    getWeRun: host+'session/encryptUserData'
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
    getAlbumList: 'http://129.204.129.170/backManage/queryAlbumList',
    getArticleContent: 'http://129.204.129.170/backManage/queryBackMaterialListByPage',
  },

  loadingUrl: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/loading.mp3',
  shutter: 'https://lg-8d7pfbfk-1256074910.cos.ap-shanghai.myqcloud.com/shutter.wav',
  fm_player_status:'fm_status'

};

module.exports = config;