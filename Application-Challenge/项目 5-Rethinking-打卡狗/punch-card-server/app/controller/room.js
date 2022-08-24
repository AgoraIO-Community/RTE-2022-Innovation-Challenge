/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组
 */

'use strict';

const { relativeTime } = require('../extend/helper');

const Controller = require('egg').Controller;

class RoomController extends Controller {

    /**
     *  默认打卡模版列表
     */
    async catelist() {
        const { ctx, service } = this;
        var list = await this.config.kagoCategoryList;
        ctx.helper.success({ ctx, msg: '成功', data: list });
    }

    /**
     *  创建群组
     */
    async create() {
        const { ctx, service } = this;
        // 组装参数
        var params = ctx.request.body;
        // 校验参数
        // ctx.validate({ account: 'string', password: 'string' }, params);

        const room = await service.room.create(params);

        ctx.helper.success({ ctx, data: room })
    }

    /**
    *  清空群组信息
    */

    async clear() {
        const { ctx, service } = this;
        const room = await service.room.clearAll();
        ctx.helper.success({ ctx, data: room })
    }


    /**
    *  查询所有群组信息
    */
    async index() {
        const { ctx, service } = this;

        let res = await ctx.service.room.findAll();
        ctx.helper.success({ ctx, data: res });
    }

    async update() {
        const { ctx, service } = this;
        // // 校验参数
        // ctx.validate(createRule, ctx.params);
        // 组装参数
        const params = ctx.params;
        params.gender = ctx.helper.toInt(params.gender);

        const room = await service.room.findByIdAndUpdate(params.id, params);
        ctx.helper.success({ ctx, data: room })
    }
}

module.exports = RoomController;
