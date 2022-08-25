# 下载
以下是js-sdk发布记录
_____
## Release v1.1.14

资源:  [web-office-sdk-v1.1.14-29cc5cf2.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.14-29cc5cf2.zip)

- fix: 优化iframe安全域校验因为www跳转导致的匹配错误问题
- fix: 修复“恢复历史版本”后, 原有的wps.on事件监听不执行的问题
- fix: 修复Safari浏览器无法显示导出按钮的兼容性问题

## Release v1.1.13

资源:  [web-office-sdk-v1.1.13-a5961d00.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.13-a5961d00.zip)

fix: 修复过滤 isParentFullscreen 信息后导致配置失效的问题

## Release v1.1.12

资源:  [web-office-sdk-v1.1.12-3f961a29.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.12-3f961a29.zip)

- fix: 修复SDK序列化消息时解析React节点报错的问题

## Release v1.1.11

资源:  [web-office-sdk-v1.1.11-a8f5794e.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.11-a8f5794e.zip)

- fix: 修复全屏事件在Safari浏览器中的兼容性问题
- feat：isParentFullscreen 配置项支持传入指定节点作为全屏对象 

## Release v1.1.10

资源:  [web-office-sdk-v1.1.10-6c9f9d11.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.10-6c9f9d11.zip)

修改记录：
- feat: 在文件打开时将offcie服务版本挂到sdk实例的mainVersion下并在控制台打印出来 [`#94`](https://ksogit.kingsoft.net/wow/wpswebapi/merge_requests/94)

发布内容：

- feat：将weboffcie服务版本挂到sdk实例的mainVersion下并在控制台打印出来。

## Release v1.1.9

资源:  [web-office-sdk-v1.1.9-56ec51b4.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.9-56ec51b4.zip)

- fixed：修复 IE11 下高级 API 调用错误问题。
- feat：加强 JSSDK 消息通讯安全。

## Release v1.1.8

资源:  [web-office-sdk-v1.1.8-0ff45e29.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.8-0ff45e29.zip)

- fix： 修复IE11下事件监听失效问题。
- fix： 修复`fullscreenChange`全屏事件不可用问题。

## Release v1.1.7

资源:  [web-office-sdk-v1.1.7-e3c99509.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.7-e3c99509.zip)

- fix: 修复页面没初始化完直接调用ready后续无法响应问题。
- feat: ready方法执行完返回application对象。

## Release v1.1.6

资源:  [web-office-sdk-v1.1.6-1bb6872b.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.6-1bb6872b.zip)

- feat: 提供SDK通过配置getClipboardData函数对接系统剪贴板功能（目前仅支持表格和文字）。
- feat: 提供拷贝回调事件（表格和文字）
- fix: 修复url参数没有?时，simple模式打不开问题。

## Release v1.1.5

资源:  [web-office-sdk-v1.1.5-93afad9c.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.5-93afad9c.zip)

- 【feature】PC_全屏方式控制配置：iframe内全屏以及浏览器内全屏。
- 【fix】修复setter的callback问题。

## Release v1.1.4

资源:  [web-office-sdk-v1.1.4-e19c61b.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.4-e19c61b.zip)

- feat-新增 【演示】评论入口commandbarId。
- feat-新增 事件解绑API，通过off方法解绑on方法的绑定的事件。
- feat-新增 fullscreenchange（进入或退出全屏）事件。
- fix- 修复refreshToken错误过一次下次不触发问题。

## Release v1.1.3

资源:  [web-office-sdk-v1.1.3-9864b8e.zip](https://js.cache.openplatform.wpscdn.cn/sdk/web-office-sdk-v1.1.3-9864b8e.zip)

1. 新增缩放控制API。
2. 新增PPT全屏播放时隐藏toolbar配置项。
3. 新增自定义toast API，可以替换成自己定制的toast。
4. 【移动端】【文字】【演示】新增直接进入编辑模式配置。
5. 【pc】【文字】【演示】【PDF】支持隐藏底部状态栏配置。
6. 【文字】新增控制隐藏显示“目录”API。
7. 【文字】新增控制隐藏显示“评论”API。

## Release v1.1.2

资源:  [web-office-sdk-v1.1.2-063052e.zip](http://js3.cache.weboffice.wpsgo.com/wwo/sdk/web-office-sdk-v1.1.2-063052e.zip)

- feat- 支持更多的组件状态设置。
- feat- 新增获取、切换头部tab接口和事件回调。
- feat- 新增错误事件。
- feat-【演示】新增上一步、下一步接口和事件回调。
- feat-【演示】新增播放状态切换接口和事件回调。
- feat-【PDF】新增单页模式切换接口。
- feat-【文字】新增书签功能接口（列表、新增、删除、跳转）。
- feat-【文字】新增获取修订记录接口。
- feat-【文字】新增获取评论接口。
- fix-修复`save()`方法失效问题。

## Release v1.1.1 

资源:  [web-office-sdk-v1.1.1-a06b0eb.zip](http://js3.cache.weboffice.wpsgo.com/wwo/sdk/web-office-sdk-v1.1.1-a06b0eb.zip)

- fix: 修复偶现api调用时序错乱问题。 
- feat: 没有配置mount默认占满全屏 
- fix: 单个接口调用catch()不生效问题 
- feat: updateConfig() 方法兼容处理，该函数即将废弃。 
- fix: 修复重复调用config时文档类型没更新问题。 
- fix: 修复事件回调顺序问题 

## Release v1.1.0 

资源:  [web-office-sdk-1.1.0.zip](http://js3.cache.weboffice.wpsgo.com/wwo/sdk/web-office-sdk-1.1.0.zip)

- feat: 添加wps配置对应的接口声明 
- fix: 修复WordApplication、PPTApplication、PDFApplication等对象丢失问题 
- fix: 修复错误中断时,下次调用api无法发送消息问题
