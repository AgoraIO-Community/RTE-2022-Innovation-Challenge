/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组用户
 */

'use strict';

const Service = require('egg').Service;

class RoomUserService extends Service {

    async join(params) {
        const { ctx, service } = this;

        let timeStamp = new Date().getTime();
        params.create_time = timeStamp;
        params.update_time = timeStamp;
        const userId = ctx.state.user.id;
        const user = await ctx.service.user.find(userId);

        params.userid = user.id;
        params.nickName = user.nickName;
        params.avatar = user.avatar;
        params.gender = user.gender;

        const room = await ctx.model.RoomUser.create(params);
        return room
    }

    async findAll() {
        const roomList = await this.ctx.model.RoomUser.findAll()
        return roomList;
    }

    async listByRoomId(roomId) {
        const roomList = await this.ctx.model.RoomUser.findAll({
            where: {
                room_id: roomId,
            }
        })
        return roomList;
    }

    /**
     * 销毁用户
     * @param {*} id  用户 Id
     * @returns 
     */
    async destroy(id) {
        const result = await this.ctx.model.RoomUser.destroy(id)
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
        await ctx.model.RoomUser.sync({ force: true });
    }
}

module.exports = RoomUserService;
