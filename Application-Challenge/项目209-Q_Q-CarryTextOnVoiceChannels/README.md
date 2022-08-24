# CarryTextOnVoiceChannels
<!-- 请将上面“应用名”替换为你本次参赛作品的应用名 -->
Android Studio不允许出现汉字路径，所以你看到的路径是英语，翻译成汉语，使用语音频道承载文本信息

## 项目简介
<!-- 请描述此次参赛作品的简介 -->
语音通信全过程使用agora的sdk,地图部分使用百度地图的sdk。
获取语音通话最原始的数据，修改原始数据，使其能承载文本信息。
关于如何修改原始数据，agora默认的48000HZ，就是1秒有48000个short(16位)数据，
我们能直接修改这一秒内的48000个数字吗，实际上是不能的，比如其中4800个（0.1秒）为440（只是一个16位数字范围内的数字，随便举个例子哈），
发送方当然可以随意修改，但是接收方只能获得找不到规则的一串数字，没法承载信息，因为语音编码就是压缩编码，会压缩成找不到规则的数字。
，不能修改数字为一个常数，修改成类似于1000HZ的脉冲信号，这个其实很简单，sin(2*pi*f)之类的就行
但是解码就比较复杂，就是用傅里叶变换，获取到这个1000HZ，这个过程是完全OK的，基本上没有误码

## 使用指南
<!-- 请描述该应用的使用步骤，包括下载、依赖安装、参数及软硬件配置（如有）等 -->
1.如果您想编译一遍，直接用android studio编译就行
2.如果您不想编译，在RTE-2022-Innovation-Challenge\Application-Challenge\Q_Q-CarryTextOnVoiceChannels\integrated_version\app\build\outputs\apk\debug里面有.apk
3.代码是依据Android 10作为target api,在小米11和小米8上都能跑，但是vivo iqoo z5却跑不了，非常奇怪，估计是vivo自己的坑，也可能是因为编译的是32位程序，暂时原因不明
4.详情可以看https://www.bilibili.com/video/BV1NF411P7hQ?share_source=copy_web&vd_source=7a854409f0cbb2c08b19a1e8a513aebc
5.应举办方要求，删掉了库函数和输出内容，其中库包括agora的全量Android库，和百度地图的Android库，为防止您不能编译通过，把主要路径写在下面
6.百度地图sdk的下载链接：https://lbs.baidu.com/index.php?title=sdk/download&action#selected=location_all  当然，因为传输地图信息后，解析经纬度并不是一个必要项，
若不需要，可以删除baiduMap包下面的所有java文件。record包下面的java也能删除。
7.核心功能，均在agora包里面的java文件里面。其中心代码是agora_MainActivity.java这个java文件，
8.agora是3.8版本，百度地图是7.4版本，若您仍不能通过编译，https://cloud.189.cn/web/share?code=7biuAbqi6nMb（访问码：8n8a）包换全部的库和输出结果，稍微有点大，大概300M，
libs\agora-rtc-sdk.jar\	
libs\arm64-v8a\	
libs\armeabi\	
libs\armeabi-v7a\	
libs\BaiduLBS_Android.jar\	
libs\include\	
libs\arm64-v8a\libagora-core.so	
libs\arm64-v8a\libagora-fdkaac.so	
libs\arm64-v8a\libagora-ffmpeg.so	
libs\arm64-v8a\libagora-mpg123.so	
libs\arm64-v8a\libagora-rtc-sdk.so	
libs\arm64-v8a\libagora-soundtouch.so	
libs\arm64-v8a\libagora_ai_denoise_extension.so	
libs\arm64-v8a\libagora_dav1d_extension.so	
libs\arm64-v8a\libagora_fd_extension.so	
libs\arm64-v8a\libagora_jnd_extension.so	
libs\arm64-v8a\libagora_segmentation_extension.so	
libs\arm64-v8a\libBaiduMapSDK_base_v6_3_0.so	
libs\arm64-v8a\libBaiduMapSDK_base_v7_4_0.so	
libs\arm64-v8a\libBaiduMapSDK_map_v6_3_0.so	
libs\arm64-v8a\libBaiduMapSDK_map_v7_4_0.so	
libs\arm64-v8a\libgnustl_shared.so	
libs\arm64-v8a\libindoor.so	
libs\arm64-v8a\liblocSDK8a.so	
libs\armeabi\libBaiduMapSDK_base_v6_3_0.so	
libs\armeabi\libBaiduMapSDK_base_v7_4_0.so	
libs\armeabi\libBaiduMapSDK_map_v6_3_0.so	
libs\armeabi\libBaiduMapSDK_map_v7_4_0.so	
libs\armeabi\libgnustl_shared.so	
libs\armeabi\libindoor.so	
libs\armeabi\liblocSDK8a.so	
libs\armeabi-v7a\libagora-core.so	
libs\armeabi-v7a\libagora-fdkaac.so	
libs\armeabi-v7a\libagora-ffmpeg.so	
libs\armeabi-v7a\libagora-mpg123.so	
libs\armeabi-v7a\libagora-rtc-sdk.so	
libs\armeabi-v7a\libagora-soundtouch.so	
libs\armeabi-v7a\libagora_ai_denoise_extension.so	
libs\armeabi-v7a\libagora_dav1d_extension.so	
libs\armeabi-v7a\libagora_fd_extension.so	
libs\armeabi-v7a\libagora_jnd_extension.so	
libs\armeabi-v7a\libagora_segmentation_extension.so	
libs\armeabi-v7a\libBaiduMapSDK_base_v6_3_0.so	
libs\armeabi-v7a\libBaiduMapSDK_base_v7_4_0.so	
libs\armeabi-v7a\libBaiduMapSDK_map_v6_3_0.so	
libs\armeabi-v7a\libBaiduMapSDK_map_v7_4_0.so	
libs\armeabi-v7a\libgnustl_shared.so	
libs\armeabi-v7a\libindoor.so	
libs\armeabi-v7a\liblocSDK8a.so	
libs\include\AgoraBase.h	
libs\include\IAgoraLog.h	
libs\include\IAgoraMediaEngine.h	
libs\include\IAgoraRtcChannel.h	
libs\include\IAgoraRtcEngine.h	
libs\include\IAgoraService.h	
libs\x86\libagora-core.so	
libs\x86\libagora-fdkaac.so	
libs\x86\libagora-ffmpeg.so	
libs\x86\libagora-mpg123.so	
libs\x86\libagora-rtc-sdk.so	
libs\x86\libagora-soundtouch.so	
libs\x86\libagora_ai_denoise_extension.so	
libs\x86\libagora_dav1d_extension.so	
libs\x86\libBaiduMapSDK_base_v6_3_0.so	
libs\x86\libBaiduMapSDK_base_v7_4_0.so	
libs\x86\libBaiduMapSDK_map_v6_3_0.so	
libs\x86\libBaiduMapSDK_map_v7_4_0.so	
libs\x86\libgnustl_shared.so	
libs\x86\libindoor.so	
libs\x86\liblocSDK8a.so	
libs\x86_64\libagora-core.so	
libs\x86_64\libagora-fdkaac.so	
libs\x86_64\libagora-ffmpeg.so	
libs\x86_64\libagora-mpg123.so	
libs\x86_64\libagora-rtc-sdk.so	
libs\x86_64\libagora-soundtouch.so	
libs\x86_64\libagora_ai_denoise_extension.so	
libs\x86_64\libagora_dav1d_extension.so	
libs\x86_64\libBaiduMapSDK_base_v6_3_0.so	
libs\x86_64\libBaiduMapSDK_base_v7_4_0.so	
libs\x86_64\libBaiduMapSDK_map_v6_3_0.so	
libs\x86_64\libBaiduMapSDK_map_v7_4_0.so	
libs\x86_64\libgnustl_shared.so	
libs\x86_64\libindoor.so	
libs\x86_64\liblocSDK8a.so	



## 功能简介
<!-- 请给出该应用的主要功能点 -->
三个功能，总的来说，就是在不中断语音通话的情况下，传输文本信息
1.传输经纬度信息，1.5秒传输，然后还可以在地图上打点，获取彼此的方位，计算彼此的距离，精度最高可达5米以内
2.传输普通文本信息，每分钟120个汉字，实现加密的效果，对比来看，现在所有的文本估计能被轻松备份保存，即使删除了很容易被恢复，
而这个技术是用语音承载的，语音数据量那可是非常滴大，对语音本身做备份几乎不太可能，
并且文本中间态都是脉冲数据，即使窃听了，也没法直接获取传输的文本信息。
3.附属功能，与1类似，对特定格式的数据进行压缩编码，减少传输时长。


## 技术栈
<!-- 请给出该应用主要的技术栈，包括声网和环信（如有用） SDK 版本 -->
1.agora  Java API Reference for Android v3.8
2.baiduMap_sdk_v7_4
3.Android Studio 4.1.1 Build #AI-201.8743.12.41.6953283, built on November 5, 2020
4.Windows 10 10.0
5.gradle5.6
6.java x86 jre1.8(32位程序)
7.target compileSdkVersion 29  android10(小米8 MIUI12.5  小米11 MIUI13)
## 二次开发
<!-- 1、如果是基于已有项目进行二次开发的参赛作品，请在此说明主要变更点，并附上原项目链接。2、如果是本次全新开发，请写“无” -->
无


---
# 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源