'use strict';

module.exports = app => {
	const { STRING, INTEGER, BIGINT } = app.Sequelize;
	const RoomUser = app.model.define('room_user', {
		id: {
			type: BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			comment: "id"
		},
		userid: {
			type: BIGINT,
			allowNull: false,
			comment: "用户id",
		},
		rtm_userid: {
			type: BIGINT,
			allowNull: true,
			comment: "云通信ID",
		},
		room_id: {
			type: BIGINT,
			allowNull: false,
			comment: "roomId",
		},
		nickName: {
			type: STRING(255),
			allowNull: false,
			comment: "昵称"
		},
		gender: {
			type: INTEGER,
			allowNull: true,
			comment: "性别"
		},
		avatar: {
			type: STRING(255),
			allowNull: false,
			comment: "头像"
		},
		create_time: {
			type: BIGINT,
			allowNull: false,
			comment: "创建时间"
		},
		update_time: {
			type: BIGINT,
			allowNull: false,
			comment: "更新时间"
		},
	});
	return RoomUser;
};