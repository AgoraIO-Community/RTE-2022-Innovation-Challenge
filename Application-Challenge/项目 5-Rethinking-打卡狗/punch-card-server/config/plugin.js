'use strict';

/** @type Egg.EggPlugin */

module.exports = {
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  /**
 * 启用 插件 egg-alinode，用于监控分析服务
 */
  alinode: {
    enable: true,
    env: ['prod'],
    package: 'egg-alinode',
  },

  bcrypt: {
    enable: true,
    package: 'egg-bcrypt',
  },

  cors: {
    enable: true,
    package: 'egg-cors',
  },

  /**
   * 启用插件 egg-jwt，用于 token 生成与校验
   */
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },

  /**
   * 启用 插件 egg-parameters，用于校验参数
   */
  parameters: {
    enable: true,
    package: 'egg-parameters',
  },
};
