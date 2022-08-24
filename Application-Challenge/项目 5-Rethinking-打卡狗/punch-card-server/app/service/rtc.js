/**
 * Create by liaoyp 2022/08/06
 * 描述：JWT token 生成服务
 */
'use strict';

const { RtcTokenBuilder, RtmTokenBuilder } = require('agora-access-token');

const Service = require('egg').Service;

const RtmRole = require('agora-access-token').Role;
const Priviledges = require('agora-access-token').priviledges;

class RTCTokenService extends Service {
  /**
   * 生成 token
   * @param {Object} params 生成 token 所包含的数据
   */
  async create(accountNum) {
    const { app } = this;

    console.log("accountNum:" + accountNum);

    const appID = app.config.rtc.clientId;
    const appCertificate = app.config.rtc.clientSecret;
    const account = accountNum + "";
    const expirationTimeInSeconds = 3600 * 24 * 30
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, "test", account, RtmRole, privilegeExpiredTs);
    console.log("Rtm Token: " + token);
    return token;

  }

  /**
   * 验证token的合法性
   * @param {String} token
   */
  async verify(token) {
    const { app } = this;
    try {
      const result = await app.jwt.verify(token, app.config.jwt.secret);
      result.verify = true;
      return result;
    } catch (e) {
      return { verify: false, message: 'Token 校验失败，请进行登录认证' };
    }
  }
}

module.exports = RTCTokenService;
