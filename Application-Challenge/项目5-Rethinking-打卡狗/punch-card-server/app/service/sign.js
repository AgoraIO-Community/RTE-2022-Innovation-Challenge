/**
 * Create by liaoyp 2022/08/06
 * 描述：个人账户注册登录等操作处理服务
 */
'use strict';

const Service = require('egg').Service;

class SignService extends Service {

  /**
   * 通过邮箱注册
   */
  async signUpByAccount(params) {
    const { app, ctx, service } = this;

    // 创建账户
    let user = await service.user.create(params);

    // 生成Token令牌
    user.token = await service.token.create(user);
    // 更新下用户信息，主要是把用户 token 保存到数据库
    let result = await service.user.findByIdAndUpdate(user.id, user.dataValues);

    //RTM Token
    let rtmToken = await service.rtc.create(user.id);
    result.rtcToken = rtmToken;

    const easemobToken = await service.easemob.checkToken();
    result.easemobToken = easemobToken;

    // // TODO 邮箱注册成功，发送验证邮件，需要新建验证码表存储验证码信息
    // if (app.config.isNeedActivate) {
    //   const code = ctx.helper.authCode();
    //   await service.mail.sendVerify(params.email, code);
    // }
    return result;
  }


  /**
   * 通用登录，内部会查询 username phone email 三种情况
   */
  async signIn(params) {
    const { ctx, service } = this;
    const user = await service.user.findOne({ where: { account: params.account } });
    if (!user) {
      ctx.throw(404, `用户不存在 ${params.account}`);
    }
    // 校验密码
    if (user.password !== ctx.helper.cryptoMD5(params.password)) {
      ctx.throw(412, '密码错误');
    }

    // 生成Token令牌
    let token = await service.token.create(user);
    user.token = token;

    // 更新下用户信息，主要是把用户 token 保存到数据库
    let result = await service.user.findByIdAndUpdate(user.id, user.dataValues);

    //RTM Token
    let rtmToken = await service.rtc.create(user);
    result.rtcToken = rtmToken;

    const easemobToken = await service.easemob.checkToken();
    result.easemobToken = easemobToken;

    return result;
  }

  /**
   * 通过验证码登录
   */
  async signInByCode(params) {
    const { ctx, service } = this;
    const user = await service.user.findByPhone(params.phone);
    if (!user) {
      ctx.throw(404, `用户不存在 ${params.phone}`);
    }
    // TODO 校验密码，需要新建验证码表存储验证码信息
    // if (user.code !== params.code) {
    //   ctx.throw(412, '无效验证码');
    // }
    // 校验账户状态
    if (user.deleted > 0) {
      ctx.throw(410, user.deletedReason);
    }

    // 生成Token令牌
    user.token = await service.token.create(user);
    // 更新下用户信息，主要是把用户 token 保存到数据库
    await service.user.findByIdAndUpdate(user.id, user);
    return user;
  }

  /**
   * 发送激活邮件
   */
  async sendVerifyEmail(email) {
    const { ctx, service } = this;
    const user = await service.user.findByEmail(email);
    if (!user) {
      ctx.throw(404, `用户不存在 ${email}`);
    }
    const code = ctx.helper.authCode();
    await service.user.findByIdAndUpdate(user.id, { code });

    return service.mail.sendVerify(email, code);
  }

  /**
   * 发送验证码邮件
   */
  async sendCodeEmail(email) {
    const { ctx, service } = this;
    const user = await service.user.findByEmail(email);
    if (!user) {
      ctx.throw(404, `用户不存在 ${email}`);
    }
    const code = ctx.helper.authCode();
    await service.user.findByIdAndUpdate(user.id, { code });

    return service.mail.sendCode(email, code);
  }

  /**
   * 账户激活
   */
  async activate(verify) {
    const { ctx, service } = this;
    const params = JSON.parse(ctx.helper.base64ToStr(verify));
    const user = await service.user.findByEmail(params.email);
    if (!user) {
      ctx.throw(404, `用户不存在 ${params.email}`);
    }
    if (params.code !== user.code) {
      ctx.throw(412, '激活码已失效');
    }
    const role = await service.role.findByIdentity(9);
    if (!role) {
      ctx.throw(404, '角色信息有误，请联系管理员');
    }
    return service.user.findByIdAndUpdate(user.id, { code: '', role: role.id });
  }

  /**
   * 退出登录
   */
  async signOut() {
    const { ctx, service } = this;
    const id = ctx.state.user.data.id;
    return service.user.findByIdAndUpdate(id, { token: '' });
  }

  /**
   * 销毁账户
   */
  async destroy() {
    const { ctx, service } = this;
    const id = ctx.state.user.data.id;
    return service.user.findByIdAndUpdate(id, { deleted: 0, deletedReason: '用户主动销户' });
  }
}

module.exports = SignService;
