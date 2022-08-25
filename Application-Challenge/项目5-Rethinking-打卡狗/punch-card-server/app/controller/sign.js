/**
 * Create by liaoyp 2022/08/06
 * 描述：登录注册接口
 */
'use strict';
const Controller = require('egg').Controller;

class SignController extends Controller {

  /**
   * 通过邮箱注册
   */
  async signUpByAccount() {
    const { ctx, service } = this;
    // 组装参数
    const params = ctx.params.permit('account', 'password');
    // 校验参数
    ctx.validate({ account: 'account', password: 'password', }, params);

    // 调用 Service 进行业务处理
    const user = await service.sign.signUpByAccount(params);

    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: '注册成功', data: user });
  }



  /**
   * 通用登录，内部会查询 username phone email 三种情况
   */
  async signIn() {
    const { ctx, service } = this;

    // 组装参数
    const params = ctx.params.permit('account', 'password');
    // 校验参数
    ctx.validate({ account: 'account', password: 'password' }, params);

    // 调用 Service 进行业务处理
    const user = await service.sign.signIn(ctx.request.body);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: '登录成功', data: user });
  }

  async rtmToken() {
    const { ctx, service } = this;
    // 调用 Service 进行业务处理
    const user = await service.rtc.create(1222);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: '登录成功', data: user });
  }

  /**
   * 用户登出
   */
  async signOut() {
    const { ctx, service } = this;
    // 调用 Service 进行业务处理
    await service.sign.signOut();
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: '退出登录成功' });
  }

  /**
   * 激活
   */
  async activate() {
    const { ctx, service } = this;
    const { verify } = ctx.params;
    // 调用 Service 进行业务处理
    await service.sign.activate(verify);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: '激活账户成功' });
  }

  /**
   * 发送激活邮件
   */
  async sendVerifyEmail() {
    const { ctx, service } = this;
    const { email } = ctx.params;
    // 调用 Service 进行业务处理
    const result = await service.sign.sendVerifyEmail(email);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: result ? '邮件发送成功' : '邮件发送失败' });
  }

  /**
   * 发送验证码邮件
   */
  async sendCodeEmail() {
    const { ctx, service } = this;
    const { email } = ctx.params;
    // 调用 Service 进行业务处理
    const result = await service.sign.sendCodeEmail(email);
    // 设置响应内容和响应状态码
    ctx.helper.success({ ctx, msg: result ? '邮件发送成功' : '邮件发送失败' });
  }
}

module.exports = SignController;
