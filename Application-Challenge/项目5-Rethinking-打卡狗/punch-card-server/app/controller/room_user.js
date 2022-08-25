/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组用户
 */

'use strict';

const { relativeTime } = require('../extend/helper');

const Controller = require('egg').Controller;

class RoomUserController extends Controller {

    async list() {
        const { ctx, service } = this;

        var params = ctx.request.query;
        const list = await service.roomUser.listByRoomId(params.room_id);
        ctx.helper.success({ ctx, msg: '成功', data: list });
    }

    async create() {
        const { ctx, service } = this;
        // 组装参数
        var params = ctx.request.body;
        // 校验参数
        params.room_id = ctx.helper.toInt(params.room_id);
        const room = await service.roomUser.join(params);
        ctx.helper.success({ ctx, data: room })
    }

    async clear() {
        const { ctx, service } = this;
        const room = await service.roomUser.clearAll();
        ctx.helper.success({ ctx, data: room })
    }

    async index() {
        const { ctx, service } = this;
        let res = await ctx.service.roomUser.findAll();
        ctx.helper.success({ ctx, data: res });
    }

    async update() {
        const { ctx, service } = this;
        // const createRule = {
        //     nickName: { type: 'string' },
        //     gender: { type: 'string' },
        //     avatar: { type: 'string' },
        // };

        // // 校验参数
        // ctx.validate(createRule, ctx.params);
        // 组装参数
        const params = ctx.params;
        params.gender = ctx.helper.toInt(params.gender);

        const room = await service.roomUser.findByIdAndUpdate(params.id, params);
        ctx.helper.success({ ctx, data: room })
    }
}

module.exports = RoomUserController;
