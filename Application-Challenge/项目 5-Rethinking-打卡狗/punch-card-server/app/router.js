'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);



  /**
   * --------------------------------------------------
   * 登录注册路由
   */
  router.post('/api/sign/in', controller.sign.signIn);
  router.post('/api/sign/upByAccount', controller.sign.signUpByAccount);
  // router.post('/api/sign/inByCode', controller.sign.signInByCode);
  // router.post('/api/sign/sendVerifyEmail', controller.sign.sendVerifyEmail);
  // router.post('/api/sign/sendCodeEmail', controller.sign.sendCodeEmail);
  // router.get('/api/sign/activate', controller.sign.activate);
  // router.get('/api/sign/out', controller.sign.signOut);


  // router.get('/news', controller.news.list);
  router.get('/api/user/', controller.user.index);
  router.get('/api/user/create', controller.user.create);
  router.post('/api/user/update', controller.user.update);
  router.get('/api/user/list', controller.user.index);
  router.delete('/api/user/clear', controller.user.clear);

  // router.get('/news/:id', controller.news.detail);

  /**
    * --------------------------------------------------
    * RTM Token
    */
  router.post('/api/rtm/create', controller.rtc.create);

  /**
   * --------------------------------------------------
   * 房间
   */
  router.get('/api/room/cate/list', controller.room.catelist);
  router.get('/api/room/index', controller.room.index);
  router.post('/api/room/create', controller.room.create);
  router.get('/api/room/clear', controller.room.clear);
  router.post('/api/room/update', controller.room.update);


  router.get('/api/room/user/list', controller.roomUser.list);
  router.get('/api/room/user/index', controller.roomUser.index);
  router.get('/api/room/user/clear', controller.roomUser.clear);
  router.post('/api/room/user/join', controller.roomUser.create);

  router.get('/api/room/isSign', controller.roomTodoRecord.isSign);
  router.post('/api/room/signin', controller.roomTodoRecord.create);
  router.get('/api/room/sign/clear', controller.roomTodoRecord.clear);
  router.get('/api/room/sign/list', controller.roomTodoRecord.list);

  /**
   * --------------------------------------------------
   * 附件相关路由
   */
  router.post('/api/attachment', controller.attachment.create);
  router.delete('/api/attachment/:id', controller.attachment.destroy);
  router.put('/api/attachment/:id', controller.attachment.update)
  router.get('/api/attachment/:id', controller.attachment.show);
  router.get('/api/attachment', controller.attachment.index);
  // RESTful 风格的 URL 定义，一个配置实现 增删改查接口，需要在对应的 Controller 内实现对应方法，具体对应看上边注释
  // router.resources('attachment', '/api/attachment', controller.attachment);
  // 通过远程 url 上传附件
  router.post('/api/attachment/url', controller.attachment.createByUrl);
  // 上传多个附件
  router.post('/api/attachments', controller.attachment.multiple);
  // 修改扩展信息
  router.put('/api/attachment/:id/extra', controller.attachment.extra);
  // 批量销毁，因为 RESTFul 风格 Api 没有批量删除，这里单独加一下
  router.delete('/api/attachment', controller.attachment.destroyList);

};