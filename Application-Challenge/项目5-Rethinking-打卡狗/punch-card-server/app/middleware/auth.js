/**
 * Create by liaoyp 2022/08/06
 * 描述：权限及认证相关中间件
 */
'use strict';
module.exports = (options, app) => {
  return async function (ctx, next) {
    // 校验 Token
    const authorization = ctx.get('Authorization');
    const token = authorization && authorization.replace('Bearer ', '');
    const result = await ctx.service.token.verify(token);

    if (!result.verify) {
      // token 校验失败，抛出异常，由 errorHandler 中间件统一处理
      ctx.throw(401, result.message);
    }
    ctx.state.user = result.data;
    // ctx.state.user 可以提取到 JWT 编码的 data
    const id = ctx.state.user.id;
    const identity = ctx.state.user.identity;

    // 这里有两种做法，第一种每次都查库校验角色，优点：实时，角色变更对用户无感。缺点：查库效率低，可考虑用redis
    // 第二种，把角色信息放进session,优点：无需查库，效率高。z缺点：角色变更时需额外逻辑来处理老的session，否则客户端的用户角色无法实时更新
    if (id) {
      if (identity === 999) {
        app.logger.debug('身份：超级管理员');
      }
      await next();
    } else {
      ctx.throw(401, 'Token 校验失败，请进行登录认证');
    }
  };
};
