# 引用

我们提供了支持非模块化以及`AMD`,`CommonJs`、`ES6`多种模块化规范的包， 以下是不同版本包对应的模块化规范

| 文件名 | 模块化规范 | 说明 |
| ----- | ---- | ----    |
| web-office-sdk.umd.js | UMD | 兼容非模块化、AMD、CommonJS |
| web-office-sdk.cjs.js | CommonJS | Commonjs 规范 |
| web-office-sdk.es.js | ES6 | ES6 模块化规范 | 

!> 注意，js-sdk不包含promise-polyfill, 如果需要兼容没有内置Promise对象的低版本浏览器(例如IE11)， 则需要在js-sdk之前引入promise polyfill。
```html
<script src="//unpkg.com/promise-polyfill@8.1.3/dist/polyfill.min.js"></script>
```

## 非模块化
```html
<script src="web-office-sdk.umd.js"></script>
```

## CommonJS 规范

```javascript
var WebOfficeSDK = require('./web-office-sdk.cjs.js')
```

## AMD 规范

```javascript
define(["./web-office-sdk.umd.js"], function(WebOfficeSDK){
    // do something...
});
```

## ES6 模块化规范

```javascript
import WebOfficeSDK from './web-office-sdk.es.js'
```
