
'use strict';
const path = require('path');
module.exports = app => {

  // 加载自定义参数校验规则
  const directory = path.join(app.config.baseDir, 'app/validator');
  app.loader.loadToContext(directory, 'validator');

};
