# 快速开始

此章节将介绍如何快速使用js-sdk接入在线Office文档编辑功能

## 第一步：下载
先下载最新版本的js-sdk包， 前往[下载](./download.md)

## 第二步：引用
我们提供了支持非模块化以及`AMD`,`CommonJs`、`ES6`多种模块化规范的包，下面以非模块化方式引用为例:
```html
<script src="web-office-sdk.umd.js"></script>
```
!> 注意，js-sdk不包含promise-polyfill, 如果需要兼容没有内置Promise对象的低版本浏览器(例如IE11)， 则需要在js-sdk之前引入promise polyfill。
```html
<script src="//unpkg.com/promise-polyfill@8.1.3/dist/polyfill.min.js"></script>
<script src="web-office-sdk.umd.js"></script>
```
详细的引用文档请查看[引用](./import.md)章节
## 第三步： 初始化
通过初始化配置, js-sdk会在配置的mount节点下创建一个iframe，并自动初始化相关数据和事件。
```javascript
var demo = WebOfficeSDK.config({
    url: '在线文档预览地址', // 如果需要通过js-sdk传递token方式鉴权，则需要包含_w_tokentype=1参数
})
// 如果需要对iframe进行特殊的处理，可以通过以下方式拿到iframe的dom对象
console.log(demo.iframe)
// 打开文档结果
demo.on('fileOpen', function(data) {
    console.log(data.success)
})
```
!> 温馨提示， 请在`domcontentloaded`事件触发后确保挂载节点存在再执行初始化操作。 

> FAQ: 什么是挂载节点? [挂载节点](./mount.md) 是指js-sdk插入iframe时挂载的节点。

## 第四步: 鉴权设置

!> 注意！！！如果需要通过js-sdk传递token进行鉴权, 在线文档预览地址的url参数中必须设置`_w_tokentype=1`(注意，这个参数也是需要参与签名的)

```javascript
// 根据自身的业务需求，通过异步请求或者模板输出的方式取得token
var token = 'yourToken'; 
// 设置token
demo.setToken({token: token}) 
```

## 总结

通过简单的五个步骤，可以快速接入在线Office文档编辑功能，鉴于应用场景的复杂性，我们提供了[文档模式](../custom/mode.md)、[自定义功能选项](../custom/options.md)、[组件](../custom/component-state.md)等灵活的配置应对不同的应用场景，详细可以查看相关的章节。
