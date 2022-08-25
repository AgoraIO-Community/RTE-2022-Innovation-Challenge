/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组
 */

'use strict';

const Service = require('egg').Service;

class RoomService extends Service {

    async create(params) {
        const { ctx, service } = this;

        let timeStamp = new Date().getTime();
        params.create_time = timeStamp;
        params.update_time = timeStamp;
        const userId = ctx.state.user.id;
        const account = ctx.state.user.account;
        params.userid = userId;

        let roomId = parseInt(params.room_id)

        const id = roomId // await service.easemob.createRoom(params.name, params.desc, account)
        if (!id || id === '' || id === 0) {
            ctx.throw(500, '传递的room_id 不能为空!');
        }
        params.id = id;
        // await ctx.model.Room.create(params);
        const room = await ctx.model.Room.create(params);
        return room
    }

    async findAll() {
        const roomList = await this.ctx.model.Room.findAll()

        // 去三方服务查下当前房间人数，后续还要查下人员信息
        // for (const room of roomList) {
        //     const info = await this.service.easemob.roomInfo(room._id);
        //     room._doc.count = info.affiliations_count;
        // }

        return roomList;
    }

    /**
     *  查找用户
     * @param {*} id  用户 Id
     * @returns 
     */
    async find(id) {
        const user = await this.ctx.model.Room.findByPk(id)
        return user;
    }

    /**
   *  查找用户
   * @param {*} id  用户 Id
   * @returns 
   */
    async findOne(query) {
        const user = await this.ctx.model.Room.findOne(query)
        return user;
    }

    /**
     * 销毁用户
     * @param {*} id  用户 Id
     * @returns 
     */
    async destroy(id) {
        const { ctx, service } = this;
        const result = await this.ctx.model.Room.destroy(id)
        await service.easemob.destroyRoom(id);

        return result;
    }

    /**
     */
    async findByIdAndUpdate(id, params) {
        const user = await this.ctx.model.Room.findByPk(id)
        if (!user) {
            this.ctx.throw(404, `用户不存在 ${id}`);
        }
        const returnAttributes = ['account', 'createTime', 'updateTime', 'nickName', 'gender', 'avatar', 'token', 'id']
        let updateResult = await user.update(params, { attributes: returnAttributes });
        return {
            account: updateResult.account,
            nickName: updateResult.nickName,
            gender: updateResult.gender,
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
        await ctx.model.Room.sync({ force: true });
    }
}

module.exports = RoomService;
