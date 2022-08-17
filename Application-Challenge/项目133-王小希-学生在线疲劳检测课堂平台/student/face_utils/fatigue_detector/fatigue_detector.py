import cv2
import numpy as np

'''疲劳检测模型：多特征的构建 + 多特征的经验融合'''
class FatigueDetector():
    ''''''

    '''初始化各个疲劳检测器'''
    def __init__(self, cfg, detector, eyeDetector, browDetector, mouthDetector, headDetector, causalInferModel):
        self.cfg = cfg   #疲劳推理模型的配置属性
        self.detector = detector #人脸关键点检测器
        self.eyeDetector = eyeDetector   #眨眼检测器
        self.browDetector = browDetector  #提眉检测器
        self.mouthDetector = mouthDetector  #哈欠检测器
        self.headDetector = headDetector   #头部检测器
        self.causalInferModel = causalInferModel   #多疲劳行为融合的推理模型

        #变量
        self.preDetect = False  # 前一帧未眨眼
        self.preDetect1 = False  # 前一帧未提眉

    '''疲劳检测'''
    def fatigue_detect(self,frame,det,landmark,EAR_estimate,BAR_estimate):
        '''
        :param frame: 当前检测到视频帧
        :param det: 当前检测到的人脸边界框
        :param landmark: 当前检测到的人脸关键点
        :param EAR_estimate: 正脸下校准的EAR值
        :param BAR_estimate: 正脸下校准的BAR值
        :return: 返回疲劳类别
        '''
        '''——————————————————————————————眨眼检测（睁眼，闭眼，快眨，慢眨，正常）————————————————————————————'''
        # eyeDetector.EAR_threshold = 0.23  #手动设置阈值
        pitch, _, yaw = self.headDetector.get_pitch_roll_yaw(self.detector, frame, det, landmark)  # 头部姿态
        self.eyeDetector.adaptive_threshold(EAR_estimate, pitch, yaw,
                                       EAR_alpha = self.cfg["EAR_alpha"], EAR_pitch_range = self.cfg["EAR_pitch_range"],
                                       EAR_beta = self.cfg["EAR_beta"],
                                       EAR_yaw_threshold = self.cfg["EAR_yaw_threshold"])  # 自适应调整EAR阈值
        self.eyeDetector.frameCount += 1  # 帧数累加
        blink_detect = self.eyeDetector.blinkDetect(landmark[0][0], self.preDetect, yaw)  # 根据yaw修正EAR
        blink_state = "no blink" if blink_detect == 0 else "quick blink"  # 0表示不眨眼，1,2表示眨眼
        self.preDetect = False if blink_detect == 0 else True
        # cv2.putText(frame, blink_state, (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        # cv2.putText(frame, "EAR_threshold:" + str(self.eyeDetector.EAR_threshold), (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 1,
        #             (0, 0, 255), 2)
        cv2.putText(frame, "X:" + str(pitch), (60, 130), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, "Y:" + str(yaw), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        blink_speed_state = blink_state  # 如果眨眼过程未结束，没有眨眼特征，则默认标签为是否眨眼
        blinkFeature_seq = self.eyeDetector.blinkFeature_seq  # 眨眼特征(5维)
        if (len(blinkFeature_seq) > 0):  # 只有在眨眼结束的时候再判断是快眨，慢眨还是正常眨眼（而慢眨眼）
            duration, amplitude, EOV, Perclos, non_blink_EAR = blinkFeature_seq

        # 快眨眼，慢眨眼，正常眨眼检测
        blink_speed_detect, perclos = self.eyeDetector.get_blinkSpeedDetect_perclos(PERCLOS_range=self.cfg["PERCLOS_range"])
        if (blink_detect == 2):
            # 0表示不眨眼，1表示开始眨眼, 2表示正在眨眼，正在眨眼的时候检测是快眨，慢眨还是正常眨眼
            if (blink_speed_detect == 3):
                blink_speed_state = "quick blink"
            elif (blink_speed_detect == 4):
                blink_speed_state = "normal blink"
            elif (blink_speed_detect == 5):
                blink_speed_state = "slow blink"
            blink_detect = blink_speed_detect  # blink_detect取值范围为:0,1,2（2为正眨眼），取值范围为:3,4,5（快眨眼...）

        cv2.putText(frame, "Perclos:" + str(perclos), (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, blink_speed_state, (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)  # Perclos绘制有延迟
        self.causalInferModel.set_diagnosis_column(eye_detect=blink_detect)

        '''——————————————————————————————提眉检测——————————————————————————————————————'''
        # browRaisedDetector.BAR_threshold = 0.53
        self.browDetector.adaptive_threshold(BAR_estimate, pitch, yaw,
                                        BAR_alpha=self.cfg["BAR_alpha"], BAR_pitch_range=self.cfg["BAR_pitch_range"],
                                        BAR_beta=self.cfg["BAR_beta"], BAR_yaw_range=self.cfg["BAR_yaw_range"])  # 自适应调整BAR阈值
        BAR = self.browDetector.getBAR_withYaw(landmark[0][0], yaw)  # 根据yaw修正BAR
        raise_detect = self.browDetector.brow_raised_detect(landmark[0][0], self.preDetect1, yaw)
        raise_state = "no brow raised" if raise_detect == 0 else "brow raised"  # 0表示不提眉，1,2表示提眉
        preDetect1 = False if raise_detect == 0 else True
        cv2.putText(frame, raise_state, (60, 380), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        # cv2.putText(frame, "BAR_threshold:" + str(browDetector.BAR_threshold), (60, 380), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, "BAR:" + str(BAR), (60, 280), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        self.causalInferModel.set_diagnosis_column(brow_raise_detect=raise_detect)

        '''——————————————————————————————张大嘴检测（张大嘴，正常）——————————————————————————————'''
        self.mouthDetector.MAR_threshold = self.cfg["MAR_threshold"]  # 默认为0.6
        self.mouthDetector.adaptive_threshold(yaw)  # 自适应调整MAR阈值
        yawn_detect_first = self.mouthDetector.yawn_detect(landmark[0][0], preDetect1)
        # yawn_state = "no yawn" if yawn_detect == 0 else "yawn"  # 0表示不哈欠，1,2表示哈欠
        yawn_state = "no yawn"
        yawn_detect = 0  # 哈欠检测状态
        # 二阶段哈欠检测
        if (yawn_detect_first):
            # 基于FOM的哈欠检测
            yawn_by_FOM = self.mouthDetector.detect_yawn_from_FOM(ratio=self.cfg["FOM_threshold"])
            if (yawn_by_FOM):  # 检测到哈欠
                yawn_state = "yawn"
                yawn_detect = 1

        self.preDetect1 = False if yawn_detect_first == 0 else True
        cv2.putText(frame, yawn_state, (60, 430), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        self.causalInferModel.set_diagnosis_column(mouth_detect=yawn_detect)

        '''——————————————————————————————头部运动状态检测——————————————————————————————'''
        # 头部姿态预测
        # X,Z,Y = headDetector.get_pitch_roll_yaw(detector,frame, [det], landmark)#头部姿态估
        # cv2.putText(frame, "X:" + str(X), (60, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        # cv2.putText(frame, "Y:" + str(Y), (60, 130), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        # cv2.putText(frame, "Z:" + str(Z), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # #人脸距离估计
        # distance = headDetector.get_face_distance(det)
        # cv2.putText(frame, "distance:" + str(distance), (60, 230), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # 头部运动姿态预测
        self.headDetector.setHeadPose_params(deltaX_threshold=self.cfg["deltaX_threshold"],
                                        NODDING_WINDOW_LENGTH=self.cfg["nodding_window_length"],
                                        deltaDist_threshold=self.cfg["deltaDist_threshold"],
                                        deltaY_threshold=self.cfg["deltaY_threshold"],
                                        FRONT_BEHIND_WL=self.cfg["front_behind_WL"],
                                        action_threshold=self.cfg["action_threshold"])  # 头部检测参数设置
        rotate, shift = self.headDetector.head_action_detect(self.detector, frame, det, landmark)
        headAction_state = "headAction:"
        if (rotate == 0):
            headAction_state += "no rotate"
        elif (rotate == 1):
            headAction_state += "nodding"
        elif (rotate == 2):
            headAction_state += "rotating"

        if (shift == 3): headAction_state += ",forward and backward"  # 平移判断

        cv2.putText(frame, headAction_state, (60, 230), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        self.causalInferModel.set_diagnosis_column(head_detect=(rotate, shift))

        '''——————————————————————————————疲劳状态推理——————————————————————————————'''
        # startT = time.time()
        fatigue_state, suggest, kss_mean, fatigue_level = self.causalInferModel.fatigue_Infer()  # 疲劳状态推理
        return fatigue_state,suggest,kss_mean,fatigue_level