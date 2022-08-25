module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    REACT_APP_ENV: true,
    APP_VERSION: true,
    APP_BUILD_TIME: true,
    DESKTOP_SDK: true,
  },
};
