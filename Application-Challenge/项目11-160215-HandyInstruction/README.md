# 手把手
## 项目简介
远程视频“手把手”式逼真协助教学工具。
本项目在双人视频通话过程中，通过画面混叠技术，将双方场景叠加渲染到同一画布，学生端只需将摄像头对准自己要请教的画面，老师端摄像头对准白色画布，通过手指或教鞭指定到白板恰当位置，与学生端画面绘制到同一空间，使用用认穴、机修等重操作场景的教学与指导。

## 安装部署指南
本项目是Android端程序，最低支持Android 8.0(26)系统版本。
编译步骤：
### 编译环境搭建
1. AndroidStudio 4.1.1
2. Java版本1.8.0 & Kotlin版本1.3.41
3. Gradle 3.5.2

### 配置
1. 申请声网APP Key
2. 声网环信APP Key
3. 在项目local.properties文件中配置申请的声网、环信App Key：

```
EASEMOB_APPKEY=xxxx\#xxxxx
AGORA_APKKEY=xxxxxxxxx
```
配置完成后usb连接手机直接通过AndroidStudio 运行项目即可将代码编译安装到手机。

## 功能简介
### 主要功能点
1. 注册登录（基于环信）
2. 添加好友/聊天（基于环信）
3. **视频通话**
   1. 画面叠加渲染模式
   2. 画中画渲染模式
   3. 画笔功能（可切换颜色）
   4. 切换摄像头
   5. 后置摄像头打开手电
### 核心功能介绍
![功能面板](https://mmbiz.qpic.cn/sz_mmbiz_jpg/MuMjFf2EKibF8gulraToONxSeFFymAOcFZGwWTKgn5Ou1fvNI29Oxvrtj9Dbxicvgia5VWD96KXnticILibEaVeZbYw/0?wx_fmt=jpeg)
![标注](https://mmbiz.qpic.cn/sz_mmbiz_jpg/MuMjFf2EKibF8gulraToONxSeFFymAOcFlchg7SFpyLo5eN5byQT1orxcobNeeVrfImG8YfjfsuibjTPO1f9lsPA/0?wx_fmt=jpeg)
![画中画模式](https://mmbiz.qpic.cn/sz_mmbiz_jpg/MuMjFf2EKibF8gulraToONxSeFFymAOcFIVghje4TY4m8nebWJicpIgJQLscJvEUUMrQIxFoVibm2BXiaWFeaNp8hw/0?wx_fmt=jpeg)
## 技术栈

### 开发语言
本应用主要开发语言为Java/Kotlin，有部分OpenGL GLSL脚本，依赖了声网的视频通话能力与环信的IM+通话呼叫能力，具体版本如下：
1. 声网SDK3.6.2（io.agora.rtc:full-rtc-basic:3.6.2）
2. 环信IM SDK 3.9.4
3. OpenGL

### 依赖核心SDK
本应用使用了声网SDK提供的视频自采集能力，由于声网SDK4.x与3.x版本自渲染接口有变换，暂未切换到4.xSDK。
本应用用到声网自定义视频模块API：
- setVideoSource
- setLocalVideoRenderer
- setRemoteVideoRenderer

### 原理简介
声网提供SDK渲染和采集都提供了ByteBuffer、byte数组、纹理三种数据传递方式。
```
public interface IVideoFrameConsumer {
  void consumeByteBufferFrame(ByteBuffer buffer, int format, int width, int height, int rotation, long timestamp);

  void consumeByteArrayFrame(byte[] data, int format, int width, int height, int rotation, long timestamp);

  void consumeTextureFrame(int textureId, int format, int width, int height, int rotation, long timestamp, float[] matrix);
}
```
分别为本地和远程设置关联的IVideoFrameConsumer接口实现与声网SDK进行数据通信。本项目使用三种纹理方式。OpenGl纹理有个强相关的线程上下文。渲染时，我们将本地与远端视频融合后，绘制到GlSurfaceView中。在GLSurfaceView的onSurfaceCreated回调创建关联的EGLContent，供其他关联线程使用。

## 二次开发
本应用使用了[环信IM APP](https://github.com/easemob/chat-android)进行了IM模块的快速开发，对环信APP依赖的[EaseCallKit](https://github.com/easemob/easecallkitui-android) 进行了二次开发，修改了通话界面。


## 其他资料
### 演示效果
https://www.bilibili.com/video/BV1ia41197SZ/

### 体验
测试包下载地址：https://www.pgyer.com/k1KS


---
# 许可协议
Copyright (c) 2022-2032 handyinstruction(qingkouwei)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
