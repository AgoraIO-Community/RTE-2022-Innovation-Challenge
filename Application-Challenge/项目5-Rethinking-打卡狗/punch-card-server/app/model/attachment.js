'use strict';

module.exports = app => {
	const { STRING, INTEGER, BIGINT } = app.Sequelize;
	const Attachment = app.model.define('attachment', {
		id: {
			type: BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			comment: "id"
		},
		owner: {
			type: BIGINT,
			allowNull: false,
			comment: "上传者",
		},
		extname: {
			type: STRING,
			allowNull: true,
			comment: "扩展名",
		},
		filename: {
			type: STRING,
			allowNull: true,
			comment: "文件名",
		},
		path: {
			type: STRING,
			allowNull: true,
			comment: "文件存放路径",
		},
		extra: {
			type: STRING,
			allowNull: true,
			comment: "扩展信息",
		},
		createTime: {
			type: BIGINT,
			allowNull: false,
			comment: "创建时间"
		},
		updateTime: {
			type: BIGINT,
			allowNull: false,
			comment: "更新时间"
		},
	});
	return Attachment;
};