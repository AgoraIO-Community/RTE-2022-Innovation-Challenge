# ΩPaking
<!-- 请将上面“应用名”替换为你本次参赛作品的应用名 -->

## 项目简介
<!-- 请描述此次参赛作品的简介 -->
1v1 & 1vn直播教学平台。通过注册登录，进入该平台。选择感兴趣的教学直播间，然后进入直播间学习。


## 使用指南


<!-- 请描述该应用的使用步骤，包括下载、依赖安装、参数及软硬件配置（如有）等 -->
### 服务端
`RTE-2022-Innovation-Challenge/Application-Challenge/JunaYa-ΩPaking/server`
按照 readme 中操作步骤来启动本地服务

### 客户端
在该路径下配置，声网后台 token `RTE-2022-Innovation-Challenge/Application-Challenge/JunaYa-ΩPaking/omega_paking/lib/config/agora.config.dart`

dev
> * `flutter pub get`
> * `flutter run`

build
> * flutter run ios
> * flutter run macos


## 功能简介
<!-- 请给出该应用的主要功能点 -->
todo
* [x] 注册
* [x] 登录
* [x] 平台首页（教学直播间列表）
* [x] 进入直播间
* [x] 分享屏幕（仅 macOS、win、Linux）
* [ ] 内嵌网页白板

演示视频
【声网 RTC 2022 创新编程挑战赛作品- omega-paking-哔哩哔哩】 声网 RTC 2022 创新编程挑战赛作品- omega-paking_哔哩哔哩_bilibili https://b23.tv/gbnA83w
## 技术栈
<!-- 请给出该应用主要的技术栈，包括声网和环信（如有用） SDK 版本 -->
### 第三方框架

>当前 Flutter SDK 版本 3.0

| 库                          | 功能             |
| -------------------------- | -------------- |
| **http**                   | **网络框架**       |
| **shared_preferences**     | **本地数据缓存**     |
| **fluttertoast**           | **toast**      |
| **provider**               | **redux**      |
| **device_info**            | **设备信息**       |
| **connectivity**           | **网络链接**       |
| **iconfont**               | **字库图标**       |
| **flutter_webview_plugin** | **全屏的webview** |
| **flutter_statusbar**      | **状态栏**        |
| **agora_rtc_engine**       | **agora_rtc_engine: ^5.3.0**         |
| **path_provider**          | **本地路径**       |
| **path**                   | **本地路径**       |
| **permission_handler**     | **权限**         |
| **rive**                 | **svg动画**    |

## 二次开发
<!-- 1、如果是基于已有项目进行二次开发的参赛作品，请在此说明主要变更点，并附上原项目链接。2、如果是本次全新开发，请写“无” -->

server 在此开源项目开发
https://github.com/an-zolkin/axum_jwt_example

---

# 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源
