import os
os.environ['QT_MAC_WANTS_LAYER'] = '1'
import agorartc
from PyQt5 import QtGui
from PyQt5.QtGui import QImage
from PyQt5.QtCore import Qt
from face_utils.scrfd.scrfd import SCRFD
import numpy as np
from copy import deepcopy
# from face_utils.landmark_mbv2.detector import Detector
from face_utils.landmark_mbv2.onnx.detector import Detector
from face_utils.fatigue_detector.head_detector import HeadDetector_real
from face_utils.fatigue_detector.mouth_detector import MouthDetector_real
from face_utils.fatigue_detector.eye_Detector import EyeDetector_real
from face_utils.fatigue_detector.brow_detector import BrowDetector_real
from face_utils.fatigue_detector.causalModel.causal_infer import CausalInferModel_real
from face_utils.yaml_load import load_yaml
from util.detect_queue import FaceState_Queue
from util.detect_queue import FatigueState_Queue
import leancloud
from face_utils.fatigue_detector.fatigue_detector import FatigueDetector

import ctypes
from PIL import Image
import cv2

# localWinId = -1
# remoteWinId = -1
global painter
global pixmap

# fc = faceRecognition.faceRecognition()
# scrfd_model = SCRFD('scrfd_500m_kps.onnx')
global draw_label   #大流视窗
# global draw_label_1, draw_label_2   #小流视窗
age_gender_predict = False

localRawDataCounter = 0
remoteRawDataCounter = 0

# DUAL_STREAM_MODE_UPDATED = True   #双流模式状态变量
#定时任务对这两个变量进行更新
stream_high = ""    #大流uid
stream_low = []     #小流uids
uid_drawLabel_dict = {}  #uid和drawLabel绑定， key = uid, value = QLabel, 由完成定时任务完成更新

'''#######################################   人脸检测 & 疲劳检测阈值   ###############################################'''
front_face_threshold = 10  #头部姿态正脸校准阈值（太小的话，正脸约束太大）
eyes_ratio_threshold = 1.2  #大的EAR与小的EAR的比值
estimate_param_isSaved = False  #校准参数是否已保存

'''#######################################   人脸检测 & 疲劳检测对象   ###############################################'''
onnxPath = "scrfd_500m_kps.onnx"
cfgPath = "detect_config.yaml"
fatigueStrategyPath = "fatigue_strategies.txt"

scrfd_model = SCRFD(onnxPath)
detector = Detector()  # 初始化mbv2人脸关键点检测器
headDetector = HeadDetector_real()   #头部姿态检测器
eyeDetector = EyeDetector_real()  #人眼检测器
browDetector = BrowDetector_real()  #眉毛检测器
mouthDetector = MouthDetector_real()  #眉毛检测器

# 模型配置文件加载
cfg = load_yaml(cfgPath)
# 暂时只适用于单个人脸检测（如果要检测多个人脸，需要为每个ID分配一个检测器）
AVG_FPS = cfg["AVG_FPS"]
eyeDetector.TIMEWINDOW_LENGTH = int(
    round(cfg["PERCLOS_time_window_length"] * AVG_FPS / 30))  # 修改PERCLOS_time_window_length
mouthDetector.TW_length = int(round(cfg["FOM_TIMEWINDOW_LENGTH"] * AVG_FPS / 30))  # 修改FOM_TIMEWINDOW_LENGTH
headDetector.NODDING_WINDOW_LENGTH = int(
    round(cfg["nodding_window_length"] * AVG_FPS / 30))  # 修改nodding_window_length
headDetector.FRONT_BEHIND_WL = int(round(cfg["front_behind_WL"] * AVG_FPS / 30))  # 修改front_behind_WL

causalInferModel = CausalInferModel_real(fatigueStrategyPath)   #因果推理模型
fatigueDetector = FatigueDetector(cfg,detector,eyeDetector,browDetector,mouthDetector,headDetector,causalInferModel)   #疲劳检测器

faceState = None

faceState_queue = FaceState_Queue(size=20)  # 人脸检测队列, 每20帧一次更新
fatigueState_queue = FatigueState_Queue(size=30)  # 人脸检测队列, 每30帧一次更新
EAR_estimate = 0  #校准正脸下的EAR值
BAR_estimate = 0  #校准正脸下的BAR值

'''判断是否为正脸'''
def is_front_face(pitch,roll,ratio):
    '''
    :param pitch:
    :param roll:
    :param ratio:
    :return: 返回是否为正脸，左右眼是否对称
    '''
    symmetry_state = False
    if (ratio < eyes_ratio_threshold):  # 左右眼对称
        symmetry_state = True
        if (abs(pitch) < front_face_threshold and abs(roll) < front_face_threshold):  #旋转点头动作幅度较小
            return True,symmetry_state
    return False,symmetry_state

'''使用QLabel绘制视频帧图像（人脸检测 & 疲劳检测）'''
def draw_IMG_with_QLabel(qlabel, width, height, ybuffer, MODE=False, id = None):
    '''
    :param qlabel: 绘制图像的QLabel控件
    :param width: 图像分辨率宽度
    :param height: 图像分辨率高度
    :param ybuffer: 对 YUV 数据，表示 Y 缓冲区的指针；对 RGBA 数据，表示数据缓冲区。
    :param MODE: True 进行人脸检测
    :return:
    '''
    global EAR_estimate, BAR_estimate, estimate_param_isSaved

    '''Step1：用PIL Image从ybuffer中读取 RGBA 数据'''
    rgba_array = (ctypes.c_ubyte * (width * height * 4)).from_address(ybuffer)
    rgba_img = Image.frombuffer('RGBA', (width, height), rgba_array, 'raw', 'RGBA', 0, 1)

    '''Step2: 将PIL格式图片转化成cv2格式图片，并使用SCRFD模型进行人脸定位'''
    cv2_img = cv2.cvtColor(np.asarray(rgba_img), cv2.COLOR_RGBA2BGR)
    frame = deepcopy(cv2_img)
    # print(f"cv2_img.size = {cv2_img.size}")

    #人脸检测 & 疲劳检测
    if(MODE):
        dets = scrfd_model.detect_faces(cv2_img)[0]  # return 边界框

        face_state_el = 0  # face_state_el初始化为无人脸
        fatigue_state_el = 0  # fatigue_state_el初始化为警觉
        if (len(dets) != 0):
            largest_face_index = eyeDetector.getlargest_face(dets)  # 获取最大人脸

            det = dets[largest_face_index]

            landmark = detector.detect_landmarks(frame, [[det]])

            ''' 正脸校准: pitch，roll阈值判断，左右眼大小判断'''
            pitch, roll, _ = headDetector.get_pitch_roll_yaw(detector, frame, dets, landmark)  # 头部姿态
            # 左右眼EAR
            left_EAR = eyeDetector.getEAR(landmark[0][0])
            right_EAR = eyeDetector.get_right_EAR(landmark[0][0])
            # 左右眉BAR
            left_BAR = browDetector.get_BAR(landmark[0][0])
            right_BAR = browDetector.get_right_BAR(landmark[0][0])

            max_EAR, min_EAR = max(left_EAR, right_EAR), min(left_EAR, right_EAR)
            ratio = (max_EAR / min_EAR)
            flag, symmetry_state = is_front_face(pitch, roll, ratio)

            # 如果为正脸
            if (flag):
                '''Step1、先判断校准参数是否已保存'''
                if (estimate_param_isSaved == False):
                    EAR_estimate = (left_EAR + right_EAR) / 2
                    BAR_estimate = (left_BAR + right_BAR) / 2
                    faceState.set("EAR_estimate", EAR_estimate)
                    faceState.set("BAR_estimate", BAR_estimate)
                    estimate_param_isSaved = True

                face_state_el = 2
                print("face_state: 正脸")
            else:  # 非正脸
                face_state_el = 1

            '''Step2、疲劳检测'''
            if (estimate_param_isSaved):
                fatigue_state, suggest, kss_mean, fatigue_level = fatigueDetector.fatigue_detect(frame, det, landmark,
                                                                                                 EAR_estimate,
                                                                                                 BAR_estimate)
                print(f"fatigue_state = {fatigue_state}, suggest = {suggest}")
                cv2.putText(frame, "KSS " + str(round(kss_mean, 4)), (450, 430), cv2.FONT_HERSHEY_SIMPLEX, 1,
                            (0, 0, 255), 2)
                fatigue_state_el = int(fatigue_level)

            # x1, y1, x2, y2, _ = det
            # x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            # # 绘制人脸边框
            # cv2.rectangle(frame, (x1, y1), (x2, y2), color=(0, 0, 255), thickness=2)  # 目标的bbox
            # cv2.putText(frame, "X:" + str(pitch), (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.putText(frame, "Z:" + str(roll), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.putText(frame, "symmetry:" + str(symmetry_state), (60, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.putText(frame, "left_BAR:" + str(left_BAR), (60, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.putText(frame, "right_BAR:" + str(right_BAR), (60, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        else:  # 未检测到人脸
            face_state_el = 0

        print(f"face_state_el = {face_state_el}")
        faceState_queue.insert(face_state_el,faceState)  #利用队列，间歇性地将人脸状态数据更新到云端
        fatigueState_queue.insert(fatigue_state_el, faceState)  # 利用队列，间歇性地将人脸疲劳状态数据更新到云端

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

    def __init__(self,chatroom_objId, userAccount, username_temp, cfg):
        '''
        :param chatroom_objId: 房间id号
        :param userAccount: 当前用户uid
        :param cfg: leancloud配置文件
        '''
        super(MyVideoFrameObserver, self).__init__()

        self.cfg = cfg
        self.chatroom_objId = chatroom_objId
        self.username = username_temp
        self.CHAT_TABLE = self.cfg["leancloud_chatroom"]  # 房间表
        self.userAccount = userAccount
        self.is_Stream_high = False  #当前用户视频设置为大流
        self.index_drawLabel_dict = dict()   #建立索引和QLabel对象的关系  key:index,value: 小流 QLabel 对象

        global faceState
        query = leancloud.Query("Face_detection")
        query.equal_to("chatroom_id", self.chatroom_objId)
        query.equal_to("username", self.username)
        try:
            faceState = query.first()
        except:  # 没有找到，则创建新的对象
            FaceState = leancloud.Object.extend("Face_detection")
            faceState = FaceState()
            faceState.set("chatroom_id", self.chatroom_objId)
            faceState.set("username", self.username)

    #获取本地camera 原生视频
    def onCaptureVideoFrame(self, width, height, ybuffer, ubuffer, vbuffer):
        global localRawDataCounter

        print("onCaptureVideoFrame: width {}, height {}, ybuffer {}, ubuffer {}, vbuffer {}".format(width, height,
                                                                                                    ybuffer, ubuffer,
                                                                                                   vbuffer))

        # print(f"onCaptureVideoFrame: userAccount = {self.userAccount}, stream_high = {stream_high}")
        if (self.userAccount == stream_high):   #本地视频流设置为大流
            draw_IMG_with_QLabel(draw_label, width, height, ybuffer, MODE=False)
            self.is_Stream_high = True
        else:
            if(self.is_Stream_high == True):  #如果前一刻为大流，则需要清空draw_label
                draw_label.clear()
                self.is_Stream_high = False

            #如果不设置userAccount为大流，则本地视频默认绘制在第一个小流窗口
            draw_label_low = uid_drawLabel_dict[self.userAccount]
            # print(f"self.userAccount = {self.userAccount}, draw_label_low = {draw_label_low}")
            if(draw_label_low != None):
                draw_IMG_with_QLabel(draw_label_low, width,height,ybuffer, MODE=True)

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
        #大视窗绘制大流区
        if(uid == stream_high):
            draw_IMG_with_QLabel(draw_label, width, height, ybuffer, MODE=False)

        if uid in stream_low:
            draw_label_low = uid_drawLabel_dict[uid]
            print(f"onRenderVideoFrame: uid = {uid}, draw_label_low = {draw_label_low}")
            if(draw_label_low != None):
                draw_IMG_with_QLabel(draw_label_low, width, height, ybuffer, MODE=False, id = uid)

