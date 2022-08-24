<!-- 内容建议:以下为建议你可以补充的内容要点和方向 -->

# DQLive
<!-- 请将上面“项目名”替换为你本次参赛作品的项目名 -->
作品地址：[https://github.com/duqian291902259/DQLive](https://github.com/duqian291902259/DQLive)

## 项目简介
<!-- 请描述此次参赛作品的简介，建议用「一句话简介」+ 详细介绍的形式 -->
一线直播实战，直播基础架构设计、声网推流、Exo拉流播放、Hilt依赖注入、CameraX、AutoService、UETool、MMKV、应有尽有。不断完善。


## 安装部署指南
<!-- 请描述该应用的使用步骤，包括下载、依赖安装、参数及软硬件配置（如有）等，特别提醒：如果需要特殊硬件支持，请在 README 中写明，也和大赛官方沟通。 -->
AndroidStudio开发工具，安装好依赖，运行即可。
声网需要配置开发者AppId和有效的token。

## 功能简介
<!-- 请给出该应用的主要功能点 -->
基于声网SDK实现的推拉流，项目虽小，五脏俱全。

特色：优良的直播间的架构设计，全面的功能，优美的UI。
观众端直播间和主播端，模块复用、可扩展性强，
自定义生命周期感知的controller组件，实现按钮粒度的逻辑分离、自由组合。


## 技术栈
<!-- 请给出该应用主要的技术栈，包括使用的声网和环信（如有用） SDK 版本 -->
主播端：推流基于声网SDK，然后旁路推流到CDN，其他常规的功能跟观众端类似。

观众端：拉流播放，可选的播放器有ijkplayer，exoplayer（本项目），或者声网MPK；其他主播资料、公屏、IM聊天，充值、送礼等功能按钮，自定义点击处理。

UI架构：Activity+Fragment+ViewModle+LiveData

自定义的controller（支持热插拔的模块化，生命周期感知）

组件通信：目前EventBus，会新增LiveDataBus。 

模块化、组件化：AutoService。 

依赖注入：Hilt。 

网络相关：Retrofit + Kotlin Coroutine + Gson。 

持久化：Room，MMKV。 

动画：前期SVGA，后期会+Lottie、Alpha MP4。

直播使用哪种技术，需要结合各自项目的技术特点，后续也会逐步引入一些很Nice的技术。有空再更新完善。。。


## 二次开发
<!-- 1、如果是基于已有项目进行二次开发的参赛作品，请在此说明主要变更点，并附上原项目链接。2、如果是本次全新开发，请写“无” -->
无

## 其他资料
<!-- 能全方位展示你的作品亮点的资料，包括：1、如果是文件，可以放到该仓库你的文件中，在这里附上链接。2、如果是外部视频可以附上链接 -->

主播端自定义采集，支持人脸检测、卡通换脸，计划后续再做。

---
# 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源

开源地址：[https://github.com/duqian291902259/DQLive](https://github.com/duqian291902259/DQLive)
请用我的仓库地址，不要单独发布。


<!-- 往年作品 README 参考
https://github.com/AgoraIO-Community/RTE-2021-Innovation-Challenge/blob/master/Application-Challenge/%E3%80%90%E5%8A%A0%E6%B2%B9%EF%BC%8C%E6%89%93%E5%B7%A5%E4%BA%BA%E3%80%91AgoraHomeAI/README.zh.md

https://github.com/AgoraIO-Community/RTE-2021-Innovation-Challenge/blob/master/Application-Challenge/%5Brethinking%5D%E9%83%BD%E5%B8%82%E6%8E%A2%E9%99%A9%E5%AE%B6/Readme.md

https://github.com/AgoraIO-Community/RTE-2021-Innovation-Challenge/blob/master/Application-Challenge/%5B%E5%8F%B2%E5%A4%A7%E4%BC%9F%5D%20%E6%95%99%E5%AD%A6%E5%8A%A9%E6%89%8B/README.md

https://github.com/AgoraIO-Community/RTE-2021-Innovation-Challenge/blob/master/Application-Challenge/%E3%80%90AnakinChen%E3%80%91%E8%BF%9E%E9%BA%A6%E9%97%AE%E7%AD%94PK/README.md -->
