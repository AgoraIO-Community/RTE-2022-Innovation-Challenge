
#  链播

## 项目简介
链播旨在创造一个将直播联系在一起的应用，通过链接不同的实时音视频流（相关联的），创造出一个新的视角

[安卓APP体验](https://agc-storage-drcn.platform.dbankcloud.cn/v0/assets-resume-yuhj-fun-k3zh7/livelink.14.apk?token=b680b45f-5f7f-4b07-bb42-b01d4b542aaf)

## 安装部署指南
确保安装了nodejs + yarn

```
yarn  // 安装依赖
yarn dev // 预览项目

```


## 功能简介
> 1. 用户注册和登录
> 2. 一对一聊天 和 联系人
> 3. 观看直播，收藏直播间
> 4. 进行直播
>> 开放两种直播方式： 1. 个秀（普通直播） ； 2 :导播 （类似联播或者转播）,可实时切换成其它直播间内容 --- 让合作更简单

>> 直播间可以进行聊天互动

>> 直播未开启时可自由切换模式

（直播功能基于Agora互动直播实现，消息通讯使用环信IM）


## 技术栈
vue,meteor,ionic,capacitor,android

"agora-rtc-sdk-ng": "^4.13.0",
"easemob-websdk": "^4.0.9",


## 二次开发
无


## 其他资料
 
#### 注意事项：直播过程中无法配置房间的类型属性，仅能编辑名称和描述等

> 个秀就是普通的直播，随处可见的那种\
> 直播列表：\
> ![进入直播列表](/Application-Challenge/项目59-友维小队-链播/image/1.png)\
> 开启个秀：\
> ![开启个秀直播](/Application-Challenge/项目59-友维小队-链播/image/2.png)

> 导播需要进行直播搜索，通过帧图或者关键字来筛选直播间，并添加到备选的资源列表\
> 开启直播后，就可以在多个视频直接进行切换，切换后观众看到的就是新的视频流，就像新闻联播一样。
> 修改直播\
> ![修改直播类型](/Application-Challenge/项目59-友维小队-链播/image/3.png)\
> 开启导播\
> ![开启导播直播](/Application-Challenge/项目59-友维小队-链播/image/4.png)\

> 观看直播，聊天需要登陆后才能参与\
> ![进入直播列表](/Application-Challenge/项目59-友维小队-链播/image/5.png)
### 如果有任何的意见、建议，欢迎联系，谢谢


# 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源
