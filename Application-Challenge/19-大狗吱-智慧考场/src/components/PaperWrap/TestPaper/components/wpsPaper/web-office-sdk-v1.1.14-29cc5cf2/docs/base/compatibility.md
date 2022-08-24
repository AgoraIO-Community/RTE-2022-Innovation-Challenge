# 关于兼容性

`js-sdk`的兼容浏览器版本如下:

| 平台 | 支持浏览器 |
|---|---|
|iOS | Safari，QQ内置浏览器，QQ小程序，微信内置浏览器，微信小程序 |
|Android | QQ内置浏览器，QQ小程序，微信内置浏览器，微信小程序 |
|Windows | Chrome、QQ浏览器(非兼容模式)、EDGE、火狐、 IE11(只保证打开预览、不保证编辑功能完全兼容)|
|Mac OSX | Chrome、Safari、QQ浏览器、EDGE、火狐 | 

> 原则上会定期更新适配各平台的主流浏览器最新版本

!> 注意：`js-sdk` 使用期间，如果在低版本浏览器（例如 `IE11`）中使用 `Promise`、`async...await` 等语法，推荐在项目中使用 `Webpack + Babel` 编译或者直接在 HTML 中引用下面代码：

```html
<script src="https://cdn.bootcss.com/babel-core/5.8.35/browser.min.js"></script>
<script src="https://cdn.bootcss.com/babel-core/5.8.35/browser-polyfill.min.js"></script>

<!-- 注意添加 text/babel，否则无法编译 -->
<script type="text/babel">
// 具体代码
</script>
```

举个例子：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>兼容低版本浏览器</title>
</head>

<body>

  <!-- 引用 babel -->
  <script src="https://cdn.bootcss.com/babel-core/5.8.35/browser.min.js"></script>
  <script src="https://cdn.bootcss.com/babel-core/5.8.35/browser-polyfill.min.js"></script>
  
  <!-- 引用 js-sdk -->
  <script src="skd 地址"></script>
  
  <!-- 注意添加 text/babel，否则无法编译 -->
  <script type="text/babel">
    window.onload = function() {
      const demo = WebOfficeSDK.config({
        url: 'web office 预览地址',
      });
      const test = async () => {
        await demo.ready();
        console.log('api ready');
      }
      demo.on('fileOpen', function(data) {
        test();
        console.log('打开成功');
      });
    }
  </script>
</body>

</html>
```