import os
os.environ['QT_MAC_WANTS_LAYER'] = '1'
import agorartc
from PyQt5 import QtGui
from PyQt5.QtGui import QImage
from PyQt5.QtCore import Qt
import numpy as np

import ctypes
from PIL import Image
import cv2

# localWinId = -1
# remoteWinId = -1
import leancloud
global painter
global pixmap

# fc = faceRecognition.faceRecognition()
global draw_label   #大流视窗
global draw_label_1, draw_label_2   #小流视窗
age_gender_predict = False

localRawDataCounter = 0
remoteRawDataCounter = 0

# DUAL_STREAM_MODE_UPDATED = True   #双流模式状态变量
#定时任务对这两个变量进行更新
stream_high = ""    #大流uid
stream_low = []     #小流uids
uid_drawLabel_dict = {}  #uid和drawLabel绑定， key = uid, value = QLabel, 由完成定时任务完成更新

'''使用QLabel绘制视频帧图像'''
def draw_IMG_with_QLabel(qlabel, width, height, ybuffer):
    '''
    :param qlabel: 绘制图像的QLabel控件
    :param width: 图像分辨率宽度
    :param height: 图像分辨率高度
    :param ybuffer: 对 YUV 数据，表示 Y 缓冲区的指针；对 RGBA 数据，表示数据缓冲区
    :return:
    '''
    '''Step1：用PIL Image从ybuffer中读取 RGBA 数据'''
    rgba_array = (ctypes.c_ubyte * (width * height * 4)).from_address(ybuffer)
    rgba_img = Image.frombuffer('RGBA', (width, height), rgba_array, 'raw', 'RGBA', 0, 1)

    '''Step2: 将PIL格式图片转化成cv2格式图片，并使用SCRFD模型进行人脸定位'''
    cv2_img = cv2.cvtColor(np.asarray(rgba_img), cv2.COLOR_RGBA2BGR)
    # print(f"cv2_img.size = {cv2_img.size}")

    '''Step3：根据draw_label和图片尺寸比例，绘制到QT GUI中'''
    height, width, bytesPerComponent = cv2_img.shape
    bytesPerLine = 3 * width
    cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB, cv2_img)
    qImg = QImage(cv2_img.data, width, height, bytesPerLine, QImage.Format_RGB888)  # 利用QImage加载图片到组件中
    # 按照draw_label的尺寸缩放图片
    qImg_scaled = qImg.scaled(qlabel.width(), qlabel.height(), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
    pixmap = QtGui.QPixmap.fromImage(qImg_scaled)
    qlabel.setPixmap(pixmap)  # 利用QPixmap组件绘制图片

class MyVideoFrameObserver(agorartc.VideoFrameObserver):

    def __init__(self,chatroom_objId, userAccount, cfg):
        '''
        :param chatroom_objId: 房间id号
        :param userAccount: 当前用户uid
        :param cfg: leancloud配置文件
        '''
        super(MyVideoFrameObserver, self).__init__()

        self.cfg = cfg
        self.chatroom_objId = chatroom_objId
        self.CHAT_TABLE = self.cfg["leancloud_chatroom"]  # 房间表
        self.userAccount = userAccount

    #获取本地camera 原生视频
    def onCaptureVideoFrame(self, width, height, ybuffer, ubuffer, vbuffer):
        global localRawDataCounter

        print("onCaptureVideoFrame: width {}, height {}, ybuffer {}, ubuffer {}, vbuffer {}".format(width, height,
                                                                                                    ybuffer, ubuffer,
                                                                                                   vbuffer))

        # print(f"onCaptureVideoFrame: userAccount = {self.userAccount}, stream_high = {stream_high}")
        if (self.userAccount == stream_high):  # 本地视频流设置为大流
            draw_IMG_with_QLabel(draw_label, width, height, ybuffer)
            self.is_Stream_high = True
        else:
            if (self.is_Stream_high == True):  # 如果前一刻为大流，则需要清空draw_label
                draw_label.clear()
                self.is_Stream_high = False

            # 如果不设置userAccount为大流，则本地视频默认绘制在第一个小流窗口
            draw_label_low = uid_drawLabel_dict[self.userAccount]
            # print(f"self.userAccount = {self.userAccount}, draw_label_low = {draw_label_low}")
            if (draw_label_low != None):
                draw_IMG_with_QLabel(draw_label_low, width, height, ybuffer)

    #获取remote用户(uid) 的 原生视频
    def onRenderVideoFrame(self, uid, width, height, ybuffer, ubuffer, vbuffer):
        global remoteRawDataCounter

        print(f"remote user uid = {uid}")
        print("onRenderVideoFrame: uid {}, width {}, height {}, ybuffer {}, ubuffer {}, vbuffer {}".format(uid, width,
                                                                                                           height,
                                                                                                           ybuffer,
                                                                                                                  ubuffer,
                                                                                                           vbuffer))
        # print(f"onRenderVideoFrame: uid = {uid}, stream_low = {stream_low}")
        uid = str(uid)
        # 大视窗绘制大流区
        if (uid == stream_high):
            draw_IMG_with_QLabel(draw_label, width, height, ybuffer)

        if uid in stream_low:
            draw_label_low = uid_drawLabel_dict[uid]
            print(f"onRenderVideoFrame: uid = {uid}, draw_label_low = {draw_label_low}")
            if (draw_label_low != None):
                draw_IMG_with_QLabel(draw_label_low, width, height, ybuffer)

