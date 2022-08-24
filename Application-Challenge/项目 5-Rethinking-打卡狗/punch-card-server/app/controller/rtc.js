'use strict';

const Controller = require('egg').Controller;

class RTMController extends Controller {
    async create() {
        const { ctx, service } = this;
        const { id } = ctx.request.body;
        if (id != null) {
            const token = await service.rtc.create(id);
            ctx.helper.success({ ctx, data: token })
        }
        else {
            ctx.throw(200, `id不能为空 ${id}`);
        }
    }
}

module.exports = RTMController;
