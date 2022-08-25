# Piloteer 领航者

## 项目简介
在我国有8500万残疾人，这其中超1700万是视障人群。其中23.5%是30岁以下的年轻人，而在视障网民中，80、90后占比75%。有30%的视障者基本呆在家中不出门，大部分人出行是需要家人朋友陪同的。完全不需要家人朋友出行的视障人士比例很低，而且大部分不是全盲人。因此，在“十四五”规划和2035年远景目标纲要内容的背景下，如何更好提升残障人员的幸福感值得更多的关注和投入。依托声网高性能的音视频传输服务及其附带的各类增值服务，通过市场调研和产品规划形成领航者音视辅助服务管理平台，配合智能设备和轻便的外置摄像头，在各类人群可承受成本的范围内，提供一个比较优化的解决方案，提升视障人群、老人等人群的幸福感。


## 使用指南
### 系统需求
#### 安卓平台
开发平台：android studio 2021.2.1  
安卓版本：6.0.1  
一般支持OTG摄像头的系统即可使用，当前未作机型适配。
#### Windows平台
当前测试系统使用的是：
系统：win10  
CPU：I7 9700K  
GPU：GTX1050TI  
内存：16G  
开发平台：Unity3D 2021.2.14  
AI算法：Yolo v3  
其他：云虚拟主机（可暂时用我的）  
### 使用步骤
1、安卓和windows分别下载到本地，安装到对应平台上；网盘下载地址  
安卓：链接：https://pan.baidu.com/s/1wUIVpTCPul0ibx0CPfPS9Q 提取码：nz26  
windows：链接：https://pan.baidu.com/s/1fvn3wIyf-C8NuAkjLNbicQ 提取码：ufqn  
2、手边需要有一个UVC摄像头，支持OTG接入到手机（抱歉没有做调用本机摄像头，之前考虑做个终端的，没来得及）；类似这种：https://item.taobao.com/item.htm?spm=a230r.1.14.191.4eb73cccZjQiJ9&id=522001212720&ns=1&abbucket=8#detail  
3、运行windows端Piloteer文件夹内Piloteer.exe即可；  
4、安卓端安装应用，打开输入房间号即可（需要用网络和UVC摄像头）；  
5、下载源代码（工程太大，gitlab传不完）  
安卓：链接：https://pan.baidu.com/s/1gWSkzJwcVFdkNSWN0fQWVA 提取码：d10d  
Unity3D：链接：https://pan.baidu.com/s/1KxQF-NLSAwzSnSi31P0beA 提取码：lcaj  
## 功能简介
### 移动端
安卓端主要包含用户登录和音视频通话，为方便视障人员使用，尽量做了简化  
![image](https://user-images.githubusercontent.com/7076435/185784191-34449fae-1ef7-48f0-849c-5e47e3a9bd95.png)

### Win服务端
包含数据大屏、设备管理、工单管理、导航管理等模块
#### 数据大屏
展示运营数据分析，设备使用信息，服务质量等内容，如用户年龄分布、周服务排名、当前呼叫信息、日活用户分布等数据问题  
![image](https://user-images.githubusercontent.com/7076435/185784175-b11af33c-e632-46a0-b1e8-704531e1dc12.png)

#### 设备管理
采购设备的企业、单独购买的用户，通过集中注册或者个人注册的方式，将自身设备注册到系统平台上，通过该界面对设备的使用者基本信息进行编辑  
![image](https://user-images.githubusercontent.com/7076435/185784201-627b07be-67a1-4541-8f62-958b6526aed5.png)
#### 工单管理
系统采用了AI辅助识别功能，因此系统设计支持通过网页端（非AI）和本地端（AI辅助）进行系统登录和远程服务，包含导航信息的获取、查看、检索等功能  
![image](https://user-images.githubusercontent.com/7076435/185784218-3b4b9d3d-bc48-446b-bd4b-57580746dae7.png)

#### 导航管理
以卫星图、街道图为服务人员提供导航服务，可以进行初步的线路规划，实时视频对话、RTM及时信令控制等
![image](https://user-images.githubusercontent.com/7076435/185788183-c37ca815-d32e-453a-89bf-54412578ff39.png)
#### 数据库管理
为了完成项目，应用了云虚拟主机、本地数据库等，对数据处理需要有相关专业知识
![image](https://user-images.githubusercontent.com/7076435/185793388-b4865d45-dd01-4487-afd0-3d414241f9af.png)

## 技术栈
<!-- 请给出该应用主要的技术栈，包括声网和环信（如有用） SDK 版本 -->
### 安卓开发
SDK版本：  
RTM 1.5+  
RTC 4.0+  
### Unity3D C#开发
开发工具：Unity3D 2021.2.4
SDK版本：  
RTM 1.4+  
RTC 3.7+  
### 网站后台开发
PHP：5.2  
MySQL5.1  
SQLite 3.0.6  
## 二次开发
无
# 许可协议
MIT