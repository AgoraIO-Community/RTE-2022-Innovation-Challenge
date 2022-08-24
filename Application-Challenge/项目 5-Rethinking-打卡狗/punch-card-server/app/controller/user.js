/**
 * Create by liaoyp 2022/08/06
 * 描述：用户信息
 */

'use strict';

const Controller = require('egg').Controller;

const returnAttributes = ['account', 'createTime', 'updateTime', 'nickName', 'gender', 'avatar', 'token', 'id']

class UserController extends Controller {
    async create() {
        const { ctx, service } = this;
        // 组装参数
        const params = ctx.request.query;
        // 校验参数
        ctx.validate({ account: 'string', password: 'string' }, params);
        const user = await service.user.create(params);
        ctx.helper.success({ ctx, data: user })
    }

    async clear() {
        const { ctx, service } = this;
        const user = await service.user.clearAll();
        ctx.helper.success({ ctx, data: user })
    }

    async index() {
        const { ctx, service } = this;
        const createRule = {
            limit: { type: 'string' },
            offset: { type: 'string' },
        };
        // 校验参数
        ctx.validate(createRule, ctx.request.query);

        // const params = ctx.query.permit('limit', 'offset');
        // // 校验参数
        // ctx.validate({ limit: 'limit?', offset: 'offset?' }, ctx.query);

        const query = {
            limit: ctx.helper.toInt(ctx.query.limit | 10), offset: ctx.helper.toInt(ctx.query.offset | 0), attributes: returnAttributes
        };
        let res = await ctx.model.User.findAll(query);
        ctx.helper.success({ ctx, data: res });

    }

    async update() {
        const { ctx, service } = this;
        const createRule = {
            nickName: { type: 'string' },
            gender: { type: 'string' },
            avatar: { type: 'string' },
        };

        // 校验参数
        ctx.validate(createRule, ctx.params);
        // 组装参数
        const params = ctx.params;
        params.gender = ctx.helper.toInt(params.gender);

        const user = await service.user.findByIdAndUpdate(params.id, params);
        ctx.helper.success({ ctx, data: user })
    }
}

module.exports = UserController;
