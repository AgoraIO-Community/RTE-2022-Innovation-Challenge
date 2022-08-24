# SuperRent(随心租)

![RTE 2022](https://img.shields.io/badge/RTE%202022-Innovation%20Challenge-blue?style=for-the-badge&logo=appveyor) ![LICENSE](https://img.shields.io/badge/LICENSE-MIT-green?style=for-the-badge) ![Flutter_Version](https://img.shields.io/badge/Flutter-stable-blue?style=for-the-badge&logo=flutter) ![go-version](https://img.shields.io/badge/Go-v1.19-blue?style=for-the-badge&logo=go) ![platform](https://img.shields.io/badge/platform-ios%20%7C%20android-orange?style=for-the-badge)

[前往官网，先睹为快](https://rent-engine.rainbowbridge.top)

告别耗时耗力、还需要费心甄别虚假房源的租房过程，用`实时音视频`带您体验更现代化的租住体验

## 项目简介

面对高昂与不确定的房产市场，租房绝对是当下青年人不二的选择。

但是租房过程中又不得不面对以下问题

- 中介利用虚假房源信息骗租客上门看房
- 距离目标房源太远，看房成本过高
- 看房过程中的个人隐私泄漏

随心租利用实时音视频技术让你足不出户就能挑选自己心仪的房源。

## 团队简介

- Design: wechat-GGBot

- Flutter: wechat-GGBot

- iOS/Android Native: wechat-GGBot

- Backend Go-lang: wechat-GGBot

- Devops: wechat-GGBot
  
联系方式：wechat-GGBot 备注：superRent

## 使用指南

> 以下安装方式均使用默认的后端服务

目前随心租支持iOS及Android客户端，有以下几种安装方式

### 1. 直接[下载Release版本](https://www.pgyer.com/bm0p)

![https://www.pgyer.com/bm0p](https://www.pgyer.com/app/qrcode/bm0p)

> [iOS系统需要手动信任开发者证书](https://www.pgyer.com/doc/view/inhouse_app_ios9)
>
> 特别鸣谢好朋友的企业开发者签名

### 2. 默认参数编译安装

- a. 在本地配置`flutter stable`开发环境
  
- b. clone 代码到你本地任意目录， 然后进入`./client`目录
  
- c.安装依赖

``` shell
flutter pub get
```

- d. 编译打包

```shell

# android
flutter apk --release --target-platform android-arm64

# ios
# ios 需要在xcode中选择自己的开发者账号
flutter build ios --release --no-codesign

```

- e. 将编译产物(apk或者ipa)安装至测试手机即可

### 3. 使用App automation工具 [fastlane](https://fastlane.tools)

安装部署好对应工具以后只需要执行以下命令即可

```shell

bundle install

bundle exec fastlane beta

```

### 4. 自定义参数编译安装

[高级安装](./CUSTOM_BUILD.md)

## 功能简介

### 租房社区

直接点击首页轮播banner即可进入全国租房交流社群，你可以在群里寻找心仪的房源、合适的室友或者把他当作一个小型的跳蚤市场。
>
> 技术上主要是用用环信聊天室来承载社群聊天通信

社群功能演示:

https://user-images.githubusercontent.com/5820203/185913501-84ed5e3b-2a4e-497a-9978-dbeea2ae8c7b.mp4

### 发房寻租

任何经过实名认证的随心租客户(下称租友)如果有出租需求均可以点击中间的加号发布自己的房源。**🙅注意：在随心租社区为了保持房源的真实性，不允许租友手动上传房源图片和视频**。租友发布的房源会在有效期内全站推送。

发房演示:

https://user-images.githubusercontent.com/5820203/186055768-4c6a1b16-140e-4fb2-b165-e364f2870be1.mp4

### 发帖求租

租友可以在随心租主动求租，经过简单的需求录入就可以等待有房的租友主动联系啦。

https://user-images.githubusercontent.com/5820203/186052884-6996ce06-3534-4e56-bb29-1cae27a11a06.mp4

### 直播带看

随心租的核心功能即在线带看。租友可以在房源详情或者求租贴详情页邀请房源所有者在线带看，带看过程中可以随时通过文字（环信IM）或者语音（声网互动直播）与业主互动。业主在直播过程中可以为自己的房源添加照片(截图)或者视频（云端录制），直播结束以后可以对所有照片视频进行挑选排序。

https://user-images.githubusercontent.com/5820203/186054882-9a059a28-e44c-4c9d-837b-70d8fb22fe4e.mp4

### 实时互动

随心租支持 关注/粉丝 好友系统，租友关注任何感兴趣的其他租友。

https://user-images.githubusercontent.com/5820203/186053770-8babf257-9720-4fcc-b164-750d3511eee0.mp4

## 技术栈

### [Server](./server/)

后台是使用 `leancloud`的云引擎部署服务。

#### 用户体系

系统整体的用户登录以及注册都是由云引擎维护，在用户注册成功以后会自动分配一个`int`类型的id（因为后续会用到云端录制，必须使用int。[详见这里](https://docs.agora.io/cn/cloud-recording/cloud_recording_rest?platform=RESTful)），此id为用户后续加入带看直播间的唯一标识。同时也会为此用户注册相应的`环信IM`账号

> 用户`int`类型的id简称`emUid` 用来登录环信和声网
>
> [环信用户相关详细见这里](./server/functions/user.go)
>
> `emUid` 0-1000 为系统保留id，主要为后续云端录制时使用，这里我们实现了一个云端录制id生成规则，详细可以看[这里](./server/rtc/id_pool.go)

#### 声网相关

- [Token 鉴权](https://docs.agora.io/cn/cloud-recording/token_server?platform=RESTful)

> 使用 Token 鉴权需要为不通的ID和channel生成对应的token。[代码见这里](./server/rtc/access_token.go)

- [云端录制](https://docs.agora.io/cn/cloud-recording/product_cloud_recording?platform=RESTful)

> 封装云端录制相关接口，为客户端提供更友好的借口。[代码见这里](./server/rtc/api.go)

- [频道管理](https://docs.agora.io/cn/live-streaming-premium-4.x/rtc_channel_management_restfulapi?platform=iOS#查询项目的频道列表)

> 实现客户端列出所有正在进行的带看活动，租友可以随时围观自己感兴趣的直播。[代码见这里](./server/rtc/api.go)

#### 环信相关

- [环信账号注册](./server/functions/user.go)
- [聊天室创建与维护](./server/functions/post.go)
- [房源群组相关](./server/functions/house.go)
- [社群相关](./server/functions/todo.go)

#### 其他

- [百度地图相关服务](./server/functions/baidu.go)
- [项目官网](./server/landing-page/)
  
### [Client](./client/)

客户端使用跨平台技术`flutter`开发。除个别功能使用iOS/Android原生开发语言外，其他均为dart。

- agora_rtc_engine: ^5.3.0

> 主要用来支持App内的在线带看

- im_flutter_sdk: ^3.9.4+2

> 求租贴动态评论、私信、以及社群功能由`环信IM`实现

- leancloud_storage: ^0.7.8

> 用户体系、存储数据、与后台通讯

- flutter_baidu_mapapi_base: ^3.2.0

> lbs 相关

客户端各个模块简介

- `controllers` 逻辑层，所有的业务逻辑均在controller层实现
- `models` 模型
- `pages` UI
- `services` 所有的服务，例如 环信、api 等等
- `utils` 工具类
- `widgets` 公用组件

## 后续版本路线图

- [ ] 直播过程中语音转文字并保存 `v1.0`
- [ ] 发布房源前身份验证（实名认证）`v1.0`
- [ ] 支持在线签约，签订双方和三方电子合同 `v1.1`
- [ ] 支持在线支付押/定金 `v1.1`
- [ ] 设计盈利模式 `v2.0`
- [ ] 房源信息上链（联盟链或者私链）`v2.5`
- [ ] 支持web版(主要依赖于声网与环信Flutter SDK支持web)

## 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源。[请查看LICENSE文件](./LICENSE)了解详情。

![logo](https://img-bss.csdnimg.cn/202207060947342527.png)
