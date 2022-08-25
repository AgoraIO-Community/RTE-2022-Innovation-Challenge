'use strict';

module.exports = app => {
	const { STRING, INTEGER, BIGINT } = app.Sequelize;
	const Room = app.model.define('room', {
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
		name: {
			type: STRING(32),
			allowNull: false,
			comment: "群名",
		},
		type: {
			type: INTEGER,
			allowNull: false,
			comment: "群类型"
		},
		rule_count: {
			type: INTEGER,
			allowNull: false,
			comment: "打卡次数",
		},
		rule_time: {
			type: STRING(255),
			allowNull: false,
			comment: "打卡时间段"
		},
		rule_type: {
			type: STRING(255),
			allowNull: false,
			comment: "打卡方式 1,2,3"
		},
		extension: {
			type: STRING(255),
			allowNull: true,
			comment: "扩展信息"
		},
		room_count: {
			type: INTEGER,
			allowNull: true,
			comment: "群人数",
		},
		room_max_count: {
			type: INTEGER,
			allowNull: true,
			comment: "群最大人数",
		},
		managers: { 
			type: STRING(255),
			allowNull: true,
			comment: "管理员列表,[id,id2,id3]"
		},
		members: {
			type: STRING(255),
			allowNull: true,
			comment: "成员列表[id,id2,id3]"
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
	return Room;
};