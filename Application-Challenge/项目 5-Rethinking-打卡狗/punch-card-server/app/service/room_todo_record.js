/**
 * Create by liaoyp 2022/08/10
 * 描述 打卡群组记录
 */

'use strict';

const Service = require('egg').Service;

class RoomTodoRecordService extends Service {

    /**
   *  是否签到
   * @param {*} id  用户 Id
   * @returns 
   */
    async isSign(params) {
        const { ctx, service } = this;
        const userId = ctx.state.user.id;
        const roomTodoRecordList = await this.ctx.model.RoomTodoRecord.findAll({
            where: { userid: userId, roomid: params.roomid },
        })
        if (roomTodoRecordList && roomTodoRecordList.length > 0) {
            return true;
        }
        return false;
    }

    /**
   *  签到
   * @param {*}
   * @returns 
   */
    async signin(params) {
        const { ctx, service } = this;

        let timeStamp = new Date().getTime();
        params.create_time = timeStamp;
        params.update_time = timeStamp;
        const userId = ctx.state.user.id;
        params.userid = userId;
        const todo = await ctx.model.RoomTodoRecord.create(params);
        return todo
    }

    /**
     * 根据群ID 查询 所有打卡记录
     * @param {*} roomId 
     * @returns 
     */
    async listByRoomId(roomId) {
        const roomTodoRecordList = await this.ctx.model.RoomTodoRecord.findAll({
            where: {
                roomid: roomId,
            }
        })
        return roomTodoRecordList;
    }

    /**
     *  查询所有
     * @param {*}
     * @returns 
     */
    async findAll() {
        const roomTodoRecordList = await this.ctx.model.RoomTodoRecord.findAll()
        return roomTodoRecordList;
    }



    /**
     * 销毁打卡记录
     * @param {*} id 记录ID
     * @returns 
     */
    async destroy(id) {
        const result = await this.ctx.model.RoomTodoRecord.destroy(id)
        return result;
    }

    /**
     * 清空所有
     */
    async clearAll() {
        //  清空所有
        const { ctx, service } = this;
        await ctx.model.RoomTodoRecord.sync({ force: true });
    }
}

module.exports = RoomTodoRecordService;
