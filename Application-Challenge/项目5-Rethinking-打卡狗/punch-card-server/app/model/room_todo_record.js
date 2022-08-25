'use strict';

module.exports = app => {
	const { STRING, INTEGER, BIGINT } = app.Sequelize;
	const RoomTodoRecord = app.model.define('room_todo_record', {
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
		roomid: {
			type: BIGINT,
			allowNull: false,
			comment: "群ID"
		},
		type: {
			type: INTEGER,
			allowNull: false,
			comment: "打卡方式 1,2,3"
		},
		path: {
			type: STRING,
			allowNull: false,
			comment: "文件存放路径",
		},
		att_id: {
			type: BIGINT,
			allowNull: true,
			comment: "id"
		},
		desc: {
			type: STRING(255),
			allowNull: true,
			comment: "描述信息"
		},
		extension: {
			type: STRING(255),
			allowNull: true,
			comment: "扩展信息"
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
	return RoomTodoRecord;
};