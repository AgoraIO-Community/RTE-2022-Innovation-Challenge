/**
 * Create by liaoyp 2022/08/06
 * 描述：用户信息
 */

'use strict';

const Service = require('egg').Service;

class UserService extends Service {
    /**
  * 创建用户
  * @param params 参数信息
  */
    async create(params) {
        const { ctx, service } = this;
        const hasUser = await this.ctx.model.User.findAll({ where: { account: params.account } })
        if (hasUser && hasUser.length > 0) {
            ctx.throw(200, `用户已存在 ${params.account}`);
        }
        // 密码加密，这里是简单的 md5 加密
        params.password = await ctx.helper.cryptoMD5(params.password);
        let timeStamp = new Date().getTime();
        params.createTime = timeStamp;
        params.updateTime = timeStamp;

        const user = await ctx.model.User.create(params);
        const result = await service.easemob.createUser(user.account, user.password);
        if (result) {
            return user;
        }
        return user
    }

    /**
     *  查找用户
     * @param {*} id  用户 Id
     * @returns 
     */
    async find(id) {
        const user = await this.ctx.model.User.findByPk(id)
        return user;
    }

    async findOne(query) {
        const user = await this.ctx.model.User.findOne(query)
        return user;
    }

    /**
     * 销毁用户
     * @param {*} id  用户 Id
     * @returns 
     */
    async destroy(id) {
        const { ctx, service } = this;
        const result = await this.ctx.model.User.destroy(id)
        // 删除环信账户
        const easeResult = await service.easemob.delUser(user.id);

        return result;
    }

    /**
     * 销毁用户
     * @param {*} id   用户 Id
     * @param {*} params 参数信息
     * @returns 
     */
    async findByIdAndUpdate(id, params) {
        const user = await this.ctx.model.User.findByPk(id)
        if (!user) {
            this.ctx.throw(404, `用户不存在 ${id}`);
        }
        const returnAttributes = ['account', 'createTime', 'updateTime', 'nickName', 'gender', 'avatar', 'token', 'id']
        console.log("params");
        console.log(params);

        let updateResult = await user.update(params);
        console.log("updateResult");

        console.log(updateResult);
        return {
            account: updateResult.account,
            nickName: updateResult.nickName,
            gender: updateResult.gender,
            password: updateResult.password,
            avatar: updateResult.avatar,
            token: updateResult.token,
            id: updateResult.id,
            updateTime: updateResult.updateTime,
            createTime: updateResult.createTime,
        }
        // return await this.ctx.model.User.update(params, { where: { id: id }, attributes: returnAttributes });
    }

    /**
     * 清空所有用户数据
     */
    async clearAll() {
        //  清空所有用户表
        const { ctx, service } = this;
        await ctx.model.User.sync({ force: true });
    }
}

module.exports = UserService;
