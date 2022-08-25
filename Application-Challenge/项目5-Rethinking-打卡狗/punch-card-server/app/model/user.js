'use strict';

module.exports = app => {
	const { STRING, INTEGER, BIGINT } = app.Sequelize;
	const User = app.model.define('user', {
		id: {
			type: BIGINT,
			allowNull: false,
			primaryKey: true,
			// defaultValue: 100000, // 普
			autoIncrement: true,
			comment: "id",
		},
		unionId: {
			type: STRING(255),
			allowNull: true,
			comment: "平台unionid",

		},
		account: {
			type: STRING(255),
			allowNull: false,
			comment: "密码",
			unique: 'compositeIndex'
		},
		password: {
			type: STRING(255),
			allowNull: false,
			comment: "密码"
		},
		role: {
			type: INTEGER,
			allowNull: true,
			comment: "角色",
			defaultValue: 1 // 普通用户1 超级用户999
		},
		email: {
			type: STRING(255),
			allowNull: true,
			comment: "邮箱"
		},
		// 账户 token，记录账户登录认证信息
		token: {
			type: STRING(255),
			allowNull: true,
			comment: "用户登录验证"
		},
		emailVerify: {
			type: STRING(255),
			allowNull: true,
			comment: "邮箱验证状态"
		},
		platform: {
			type: STRING(255),
			allowNull: true,
			comment: "注册平台",
			defaultValue: "app"
		},
		nickName: {
			type: STRING(255),
			allowNull: true,
			comment: "昵称"
		},
		gender: {
			type: INTEGER,
			allowNull: true,
			comment: "性别"
		},
		avatar: {
			type: STRING(255),
			allowNull: true,
			comment: "头像"
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
	return User;
};