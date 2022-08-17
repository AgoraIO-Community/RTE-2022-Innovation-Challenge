from face_utils.fatigue_detector.code003_distance_cal import distance_finder
import cv2
import numpy as np

'''头部姿态检测器'''
class HeadDetector_real():

    def __init__(self):
        self.deltaX_threshold = 0   #点头瞌睡差分阈值
        self.NODDING_WINDOW_LENGTH = 0  #点头检测时间窗口长度
        self.deltaDist_threshold = 0  #距离差分阈值
        self.deltaY_threshold = 0  #距离差分的yaw移动阈值
        self.FRONT_BEHIND_WL = 0  #前后倾检测时间窗口长度
        self.action_threshold = 0 #运动阈值

        self.prePitch = 0  #前一帧pitch旋转角度
        self.preRoll = 0  #前一帧roll旋转角度
        self.preYaw = 0  #前一帧yaw旋转角度
        self.preDistance = 0  #前一帧的distance

        self.deltaDist_list = []  # 前后倾检测的距离差分的绝对值的时间窗口 (快动作),长度为 FRONT_BEHIND_WL
        self.pitch_list = []  # pitch时间窗口 (慢动作),长度为 NODDING_WINDOW_LENGTH
        self.deltaPitch_list = []  # pitch差分的绝对值的时间窗口 (慢动作),长度为 NODDING_WINDOW_LENGTH

        #self.preDetect = 0  #前一帧的检测结果（3个状态，0:静止，1:点头，2:前后倾，3:正常运动） 未用到，因为不用进行频数统计

    def setHeadPose_params(self,deltaX_threshold=2, NODDING_WINDOW_LENGTH=10, deltaDist_threshold=1.5,
                 deltaY_threshold=5, FRONT_BEHIND_WL=3, action_threshold=5):
        '''
        :param deltaX_threshold:  pitch差分阈值，用于检测点头
        :param NODDING_WINDOW_LENGTH: 点头是一个反复的动作，需要设置时间窗口长度，如果mean > deltaX_threshold，则标记为点头
        :param deltaDist_threshold:  距离差分阈值，用于检测前后倾
        :param deltaY_threshold:  yaw差分阈值，用于过滤掉左右旋转引起距离差分增强的问题
        :param FRONT_BEHIND_WL: 前后倾动作是一个快运动，默认时间窗口为3，如果mean.deltaD > deltaDist_threshold且mean.deltaY < deltaY_threshold，则标记为前后倾
        :param action_threshold: 正常运动检测阈值，如果pitch，roll，yaw超过该阈值，则标记为运动
        :return:
        '''
        self.deltaX_threshold = deltaX_threshold
        self.NODDING_WINDOW_LENGTH = NODDING_WINDOW_LENGTH
        self.deltaDist_threshold = deltaDist_threshold
        self.deltaY_threshold = deltaY_threshold
        self.FRONT_BEHIND_WL = FRONT_BEHIND_WL
        self.action_threshold = action_threshold

    def get_pitch_roll_yaw(self,detector,frame,det,landmark):
        '''
        获取pitch，roll，yaw三个旋转自由度
        @:param detector: feat.Detector实例
        @:param frame: 当前检测帧
        @:param dets: 当前提取的人脸
        @:param landmark: 当前提取的关键点
        '''
        out = detector.detect_facepose(frame, [[det]], landmark)
        normal2D = tuple(out[0][0])  # 头部姿态估计
        X, Z, Y = normal2D  # [pitch, roll, yaw]
        return X,Z,Y

    def reset_pre_pitch_yaw_roll_dist(self):
        '''清空前一帧的头部姿态特征值为0'''
        self.prePitch = 0
        self.preYaw = 0
        self.preRoll = 0
        self.preDistance = 0
        self.deltaPitch_list = []
        self.deltaDist_list = []
        pass

    def get_face_distance(self,det):
        '''
        :param dets: 人脸检测边框
        :return: 人脸关于摄像头的距离估计
        '''
        Focal_length = 1578.9473684210525
        Known_distance = 30  # inches   50cm
        # mine is 14.3 something, measure your face width, are google it
        Known_width = 5.7  # inches  14cm（人脸实际大小）
        # x, y, w, h, _ = dets[0]
        x, y, w, h, _ = det
        face_width_in_frame = w
        distance = distance_finder(Focal_length, Known_width, face_width_in_frame)

        return distance

    def head_action_detect(self,detector,frame,det,landmark):
        '''
        运动状态估计：点头（pitch + pitch差值阈值控制），前后倾（distance阈值控制），正常运动（yaw，roll基本差值阈值控制），静止
        :return: 返回一个元组(0/1/2, 3/4)   0:静止(无旋转)， 1:点头， 2:正常旋转运动  3:前后倾, 4:无前后倾  （两种运动不同）
        '''
        '''###############################   Distance差分时间窗口   ##############################'''
        distance = self.get_face_distance(det)
        if (self.preDistance != 0):  # 前一帧距离不为0时，才计算差分
            if (len(self.deltaDist_list) >= self.FRONT_BEHIND_WL):
                self.deltaDist_list.pop(0)  # 弹出最前一个值
            self.deltaDist_list.append(abs(distance - self.preDistance))  # 距离差分绝对值用来分析前后倾动作，不用考虑是前倾还是后倾

        deltaDist_mean = 0
        if(len(self.deltaDist_list) > 0):
            deltaDist_mean = np.mean(self.deltaDist_list)  #距离差分的绝对值的均值
        self.preDistance = distance

        '''###############################   pitch差分时间窗口   ##############################'''
        X, Z, Y = self.get_pitch_roll_yaw(detector, frame, det, landmark)
        deltaX, deltaY, deltaZ = abs(X - self.prePitch), abs(Y - self.preYaw), abs(Z - self.preRoll)
        self.prePitch = X  # 前一帧pitch旋转角度
        self.preRoll = Z  # 前一帧roll旋转角度
        self.preYaw = Y  # 前一帧yaw旋转角度

        # 加入到deltaPitch_list
        if (self.prePitch != 0):  # 前一帧距离不为0时，才计算差分
            if (len(self.deltaPitch_list) >= self.NODDING_WINDOW_LENGTH):
                self.deltaPitch_list.pop(0)  # 弹出最前一个值
                self.pitch_list.pop(0)
            self.pitch_list.append(X)
            self.deltaPitch_list.append(deltaX)  # 距离差分绝对值用来分析前后倾动作，不用考虑是前倾还是后倾

        pitch_mean = 0
        deltaPitch_mean = 0
        if (len(self.deltaPitch_list) > 0):
            deltaPitch_mean = np.mean(self.deltaPitch_list)  # 距离差分的绝对值的均值
            pitch_mean = np.mean(self.pitch_list)

        '''###############################   头部姿态行为判断（旋转判断 + 平移判断）   ##############################'''
        front_behind_flag = (deltaDist_mean > self.deltaDist_threshold and deltaY < self.deltaY_threshold)   # 如果距离差分大于阈值且yaw差分小于deltaY_threshold，则判定为前后倾
        # print(f"front_behind_flag = {front_behind_flag}, deltaDist_mean = {deltaDist_mean}, deltaY = {deltaY}")
        #1、点头判断 + 有无前后倾判断
        if(deltaPitch_mean > self.deltaX_threshold and pitch_mean < 0):
            if (front_behind_flag):
                return 1, 3
            else:
                return 1, 4  # 点头运动
        #2、旋转运动判断 + 有无前后倾判断
        # 正常旋转运动
        elif (deltaY > self.action_threshold or deltaZ > self.action_threshold or (deltaX > self.action_threshold and X > 0)):  # 如果yaw，roll差分大于阈值，则判定为正常旋转运动
            if (front_behind_flag):
                return 2, 3
            else:
                return 2, 4
        else:  #无旋转运动
            if (front_behind_flag):
                return 0,3
            else:
                return 0,4



