/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组记录
 */

'use strict';

const Controller = require('egg').Controller;
class RoomTodoRecordController extends Controller {

    async list() {
        const { ctx, service } = this;
        var params = ctx.request.query;
        params.roomid = ctx.helper.toInt(params.roomid);
        const list = await service.roomTodoRecord.listByRoomId(params.roomid);
        ctx.helper.success({ ctx, msg: '成功', data: list });
    }

    async isSign() {
        const { ctx, service } = this;
        // 组装参数
        var params = ctx.request.query;
        // 校验参数
        params.roomid = ctx.helper.toInt(params.roomid);
        const result = await service.roomTodoRecord.isSign(params);
        ctx.helper.success({ ctx, data: result })
    }

    async create() {
        const { ctx, service } = this;
        // 组装参数
        var params = ctx.request.body;
        // 校验参数
        params.roomid = ctx.helper.toInt(params.roomid);
        params.type = ctx.helper.toInt(params.type);
        params.att_id = ctx.helper.toInt(params.att_id);
        const result = await service.roomTodoRecord.signin(params);
        ctx.helper.success({ ctx, data: result })
    }

    async clear() {
        const { ctx, service } = this;
        const result = await service.roomTodoRecord.clearAll();
        ctx.helper.success({ ctx, data: result })
    }

    async index() {
        const { ctx, service } = this;
        let res = await ctx.service.roomTodoRecord.findAll();
        ctx.helper.success({ ctx, data: res });
    }
}

module.exports = RoomTodoRecordController;
