import sys

import agorartc
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QImage, QPixmap, QKeyEvent,QPainter
from PyQt5.QtWidgets import QMessageBox
from PyQt5 import QtOpenGL
from PyQt5.QtCore import Qt
import leancloud

import agora.my_videoFrameObserver
from GUI.teacher_display import Ui_Display_MainWindow
from agora.my_rtcEngineEventHandler import MyRtcEngineEventHandler
from agora.my_videoFrameObserver import MyVideoFrameObserver
from agora.my_sheduler import MyScheduler

class DisplayWindow(QtWidgets.QMainWindow, Ui_Display_MainWindow):

    def __init__(self,chatroom_objId, userAccount, cfg):
        super(DisplayWindow, self).__init__()

        '''################   mainWindows页面传递的信息   ############'''
        self.chatroom_objId = chatroom_objId  # 房间id
        self.userAccount = userAccount  # 用户uid编号
        self.CHAT_TABLE = cfg["leancloud_chatroom"]  # 房间表

        self.setupUi(self)  # 创建窗体对象
        self.init()  #绑定事件

        draw_label = self.label
        self.pixmap = QtGui.QPixmap(469, 349)
        self.painter = QtGui.QPainter(self.pixmap)
        p_r = QtGui.QPen(QtGui.QColor(254, 173, 0))
        p_r.setWidth(2)
        self.painter.setPen(p_r)
        p_f = QtGui.QFont()
        p_f.setPixelSize(12)
        self.painter.setFont(p_f)

        self.rtc = agorartc.createRtcEngineBridge()
        self.eventHandler = MyRtcEngineEventHandler(self.rtc)
        self.rtc.initEventHandler(self.eventHandler)
        self.videoFrameObserver = MyVideoFrameObserver(self.chatroom_objId, userAccount, cfg)

        agora.my_videoFrameObserver.draw_label = draw_label  # 修改全局draw_label

        # 开启定时任务, 监听哪些用户uid的视频为大流，哪些视频为小流
        self.dual_scheduler = MyScheduler(chatroom_objId, userAccount, cfg, self.scrollAreaWidgetContents,self.verticalLayoutWidget,self.verticalLayout, self.textBrowser,self.rtc)
        self.dual_scheduler.DUAL_STREAM_MODE_Listener()  #双流模式更新状态监听

        self.microPhone_opened = True  #麦克风控制
        self.speaker_opened = True  #扬声器控制

    def init(self):
        self.pushButton.clicked.connect(lambda : self.local_volume_control())   #绑定麦克风
        self.pushButton_1.clicked.connect(lambda : self.playBack_control())   #绑定扬声器
        self.pushButton_2.clicked.connect(lambda : self.attendance())   #绑定上台
        self.pushButton_3.clicked.connect(lambda : self.step_down())   #绑定下台
        self.pushButton_4.clicked.connect(lambda : self.detect_students_face_status())   #绑定查询学生人脸情况
        self.pushButton_5.clicked.connect(lambda : self.detect_students_fatigue_status())   #绑定查询学生疲劳状况

    # 麦克风控制（本地禁音/打开语音）
    def local_volume_control(self):
        if(self.microPhone_opened == True):  #禁音
            audioDevice = self.rtc.adjustRecordingSignalVolume(volume=0)  #设置本地播放音量 0 < volume < 100  (有效果)
            print(f"audioDevice = {audioDevice}")
            QMessageBox.information(self, '提示', '你已禁音')
            self.microPhone_opened = False
        else:  #解除禁音
            audioDevice = self.rtc.adjustRecordingSignalVolume(volume=100)   #设置本地播放音量 0 < volume < 100  (有效果)
            print(f"audioDevice = {audioDevice}")
            QMessageBox.information(self, '提示', '你已解除禁音')
            self.microPhone_opened = True
        return None

    # 扬声器控制（禁止播放/打开语音）
    def playBack_control(self):
        if (self.speaker_opened == True):  # 关闭播放功能
            audioDevice = self.rtc.setPlaybackDeviceVolume(volume=0)  # 设置本地播放音量 0 < volume < 100  (有效果)
            print(f"audioDevice = {audioDevice}")
            QMessageBox.information(self, '提示', '你已关闭播放功能')
            self.speaker_opened = False
        else:  # 打开播放功能
            audioDevice = self.rtc.setPlaybackDeviceVolume(volume=30)  # 设置remote用户播放音量 0 < volume < 255 (有效果)
            print(f"audioDevice = {audioDevice}")
            QMessageBox.information(self, '提示', '你已打开播放功能')
            self.speaker_opened = True
        return None

    # 上台
    def attendance(self):

        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("objectId", self.chatroom_objId)
        chatroom = query.first()
        # 判断大流端是否有人占用
        stream_high = chatroom.get("stream_high")

        if (stream_high == self.userAccount):
            QMessageBox.warning(self, '警告', '现在你已经在台上！')
        elif (stream_high != None):
            QMessageBox.warning(self, '警告', '现在不能上台！')
        else:
            # 将该用户id从小流设置为大流
            chatroom.set("stream_high", self.userAccount)
            chatroom.remove("stream_low", self.userAccount)
            chatroom.increment("dual_status", 1)  # 更新标志位
            chatroom.save()
            QMessageBox.information(self, '提示', '请开始你的表演！')
        return None

    # 下台
    def step_down(self):

        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("objectId", self.chatroom_objId)
        chatroom = query.first()
        # 判断大流端是否被你占用
        stream_high = chatroom.get("stream_high")
        if (stream_high != self.userAccount):
            QMessageBox.critical(self, '错误', '现在你不在台上！')
        else:
            # 将该用户id从大流设置为小流
            chatroom.set("stream_high", None)
            chatroom.add("stream_low", self.userAccount)
            chatroom.increment("dual_status", 1)  # 更新标志位
            chatroom.save()
            # QMessageBox.information(self, '提示', '表演结束，请回到座位上！')
        return None

    #检测学生人脸是否在屏幕前
    def detect_students_face_status(self):
        self.textBrowser.clear()  #清空textBrower
        self.dual_scheduler.STUDENTS_STATE_Listener(MODE = 0)  # 学生人脸状态监听
        QMessageBox.information(self, '提示', '监视学生人脸状况')
        return None

    # 检测学生人脸是否存在疲劳
    def detect_students_fatigue_status(self):
        self.textBrowser.clear()  # 清空textBrower
        self.dual_scheduler.STUDENTS_STATE_Listener(MODE = 1)  # 学生疲劳状态监听
        QMessageBox.information(self, '提示', '监视学生疲劳状况！')
        return None

    # 加入通道，更新信令状态
    def joinChannel(self, appId, token, chatroom_name, uid):

        '''
        :param appId: agora项目 appId
        :param token: 为agora校验信息生成token
        :param chatroom_name: 房间名称
        :param uid: uid: (Optional) User ID. A 32-bit unsigned integer with a value ranging from 1 to 2 32-1. The ``uid`` must be unique.
        '''
        global localWinId, remoteWinId

        self.rtc.initialize(appId, None, agorartc.AREA_CODE_GLOB & 0xFFFFFFFF)
        self.rtc.enableVideo()

        # 设置双流模式，指定某些uid为小流，某个uid为大流
        streamType = agorartc.REMOTE_VIDEO_STREAM_LOW
        remote_uid = 13
        remote_streamType_setting = self.rtc.setRemoteVideoStreamType(remote_uid, streamType)
        print(f"remote_streamType_setting = {remote_streamType_setting}")  # 0: 方法调用成功   < 0: 方法调用失败

        self.rtc.joinChannel(token, chatroom_name, "", int(uid))
        self.rtc.startPreview()
        agorartc.registerVideoFrameObserver(self.rtc, self.videoFrameObserver)

     # 退出通道后，更新信令状态
    def leaveChannel(self):
        self.rtc.leaveChannel()
        agorartc.unregisterVideoFrameObserver(self.rtc, self.videoFrameObserver)
        self.painter.setCompositionMode(QPainter.CompositionMode_Source)
        self.painter.fillRect(0, 0, 469, 349, QtCore.Qt.transparent)
        self.painter.setCompositionMode(QPainter.CompositionMode_SourceOver)
        self.draw_label.setPixmap(self.pixmap)

    def closeEvent(self, event):
        # self.rtc.release(True)
        #更新chatroom.members状态,remove chatroom_objId
        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("objectId",self.chatroom_objId)
        chatroom = query.first()
        chatroom.remove("members", self.userAccount)   #将自己的uid移除members
        if(self.userAccount == chatroom.get("stream_high")):  #如果老师当前在台上，则将老师的uid移除stream_high发流端
            chatroom.set("stream_high",None)
        chatroom.remove("stream_low", self.userAccount)  #如果老师下台了，则在stream_low中移除老师uid
        # 检查此时的members是否为空，如果为空，则将stream_high置为None
        if(len(chatroom.get("members")) == 0):  #已删除当前uid，如果此时members数为0，则将stream_high置为None
            chatroom.set("stream_high", None)
        chatroom.increment("dual_status", 1)  # 更新标志位
        chatroom.save()
        event.accept()
