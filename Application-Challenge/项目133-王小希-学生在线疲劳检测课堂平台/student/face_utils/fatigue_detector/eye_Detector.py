import cv2
from face_utils.fatigue_detector.detector import Detector
from matplotlib import pyplot as plt
import numpy as np
from face_utils.fatigue_detector.blink_feature import BlinkFeature
from face_utils.fatigue_detector.head_detector import HeadDetector_real


'''眼睛检测器(基于多个视频帧序列的EAR阈值检测)'''
class EyeDetector(Detector):

    def __init__(self,videoStream,modelPath):
        super().__init__(videoStream,modelPath)
        self.EAR = []
        self.EAR_Threshold = 0.3
        self.PERCLOS= None
        self.PERCLOS_Threshold = None
        self.blinks = dict()  #记录第i次眨眼的时长
        self.N_blink = 0
        self.blink = 0

        self.preFrame = None  #前一帧的EAR
        self.curFrame = None  #当前帧的EAR
        self.begin_b = None  # 眨眼开始
        self.end_b = None  # 眨眼结束
        self.bottom_b = None # 眨眼过程中的EAR最小值所在帧数

        self.counter = 0  #用来记录当前帧数

    def getEAR(self, mode = False):

        # start = time.time()
        '''
        :param mode: 是否绘制EAR曲线，如果为True，则绘制
        :return:
        '''

        # 判断EAR是否为空，如果不空，则先清除
        if (len(self.EAR) != 0):
            self.EAR.clear()

        for landmark in self.landmarks:
            temp = 0.4  #如果检测不到人脸，EAR默认为0.4
            if(len(landmark) != 0):
                division = (2 * (abs(landmark[39][0] - landmark[36][0])))
                if(division != 0):
                    temp = (abs(landmark[37][1] - landmark[41][1]) + abs(landmark[38][1] - landmark[40][1])) / division
            # print(temp)
            self.EAR.append(temp)

        # print("FPS",self.videoStream.get_videoFPS())
        if(mode):
            plt.figure(figsize=(10,5))
            plt.title("EAR曲线",fontsize=16)
            x = np.linspace(0,len(self.landmarks) // self.videoStream.get_videoFPS(),len(self.landmarks))
            plt.plot(x,self.EAR)
            plt.show()

        #默认EAR阈值
        # self.EAR_Threshold = 0.6 * np.mean(self.EAR) / max(1,np.var(self.EAR))

        # end = time.time()
        # print("EAR time",end - start)
        return self.EAR

    def getPERCLOS_ByEAR(self):
        return None

    # 眨眼检测
    def blinkDetect(self):

        '''
        :return: 返回眨眼检测帧区间集合 (List[tuple])
        :return: 该窗口下眨眼特征序列 (List[List[]])
        '''

        # start = time.time()
        if(self.EAR_Threshold == None):
            raise Exception("please set EAR_Threshold first")

        pred_sets = []  #预测的眨眼帧序列集合
        blink_features_seq = []  #眨眼特征序列
        duration_all = 0  #用于计算Perclos
        for i in range(1,len(self.EAR)):

            self.preFrame = self.EAR[i - 1]
            self.curFrame = self.EAR[i]

            '''开始眨眼的帧数'''
            if(self.curFrame < self.EAR_Threshold and self.preFrame > self.EAR_Threshold):
                self.begin_b = i
            '''开始睁眼的帧数'''
            if(self.preFrame < self.EAR_Threshold and self.curFrame > self.EAR_Threshold):
                self.end_b = i

                if(self.begin_b != None):

                    '''计算bottom_b'''
                    temp = self.EAR[self.begin_b:self.end_b]
                    if(len(temp) != 0):
                        self.bottom_b = np.argmin(temp) + self.begin_b

                        '''计算5维特征：眨眼持续时间，振幅，速度，眨眼时间百分比，睁眼状态下平均EAR'''
                        blink_feature = BlinkFeature()
                        blink_feature.cal_feature(self.EAR,self.begin_b,self.bottom_b,self.end_b,self.EAR_Threshold,duration_all)
                        blink_features_seq.append(blink_feature.feature_2_list())

                        self.N_blink += 1

                        # blinkNum = str(self.N_blink)
                        # self.blinks[blinkNum] = blink_feature.duration
                        '''更新当前时间窗口的眨眼时间总帧数'''
                        duration_all += blink_feature.duration

                        pred = (self.counter + self.begin_b,self.counter + self.end_b)
                        pred_sets.append(pred)

        self.counter += len(self.EAR)
        # end = time.time()
        # print("blink detect time", end - start)
        # print(self.blinks)
        return pred_sets,blink_features_seq

    def setEAR_Threshold(self,rate1 = 0.8,rate2 = 200):
        #如果frames小，threshold * 均值并不能反映眨眼情况
        # self.EAR_Threshold = EAR_Threshold
        self.EAR_Threshold = rate1 * np.mean(self.EAR) / max(1,np.var(self.EAR) * rate2)
        print("var(EAR)",np.var(self.EAR) * rate2)

    def pupilDetect(self):
        '''
        使用霍夫圆变换进行瞳孔检测
        :return:
        '''
        k = 0
        for landmark in self.landmarks:

            if(len(landmark) != 0):

                leftEye = self.frames[k][min(landmark[37][1], landmark[38][1]): max(landmark[40][1], landmark[41][1]),
                          landmark[36][0] : landmark[39][0]]

                # 原图转为灰度图
                gray = cv2.cvtColor(leftEye, cv2.COLOR_BGR2GRAY)
                # 显示灰度图
                # cv2.imshow('gray', gray)

                # 灰度图转为二值图
                ret, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY)
                # 显示二值图
                # cv2.imshow('binary', binary)

                # 霍夫圆变换
                circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1, minDist=1, param1=5, param2=5,
                                           minRadius=1, maxRadius=3)

                if((type(circles) is np.ndarray) == False):
                    # print("minDist=25 circles = ", circles)
                    # print("circles = {}, type = None:{}".format(circles,type(circles)))
                    self.blink += 1
                cv2.putText(self.frames[k], "blink: " + str(self.blink), (60, 120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

                if(type(circles) is np.ndarray):
                    for circle in circles[0, :, :]:
                        x, y, r = circle[0], circle[1], circle[2]
                        cv2.circle(leftEye, (x, y), r, color=(0, 0, 255), thickness=1)

                    cv2.imshow("leftEyePupil", leftEye)

                cv2.imshow("img", self.frames[k])
                cv2.waitKey(40)
            k += 1
        pass

    '''清空detector中间变量,并修改videoStream'''
    def clear_detector_val(self,videoStream):
        self.EAR = []
        # self.EAR_Threshold = None
        self.PERCLOS = None
        self.PERCLOS_Threshold = None
        self.blinks = dict()  # 记录第i次眨眼的时长
        self.N_blink = 0
        self.blink = 0

        self.preFrame = None  # 前一帧
        self.curFrame = None  # 当前帧
        self.begin_b = None  # 眨眼开始
        self.end_b = None  # 眨眼结束
        self.bottom_b = None  # 眨眼过程中的EAR最小值所在帧数

        self.videoStream = videoStream
        self.counter = 0  # 用来记录当前帧数

'''实时眨眼检测模型'''
class EyeDetector_real(Detector):

    def __init__(self, TIMEWINDOW_LENGTH = 30):
        super(EyeDetector_real, self).__init__()

        self.EAR_threshold = None  #EAR检测阈值

        self.EAR_timeWindow = []  #用于存放当前EAR值的时间窗，用于计算PERCLOS
        self.TIMEWINDOW_LENGTH = TIMEWINDOW_LENGTH  #时间窗口大小，用来统计眨眼特征

        self.blinkFeature_seq = []  #眨眼特征序列

        self.blinkFrameCount = 0  #累积眨眼总帧数
        self.frameCount = 0
        self.preDetect = None  #前一帧是否检测为眨眼
        self.begin = 0  #开始眨眼帧数（相对end）
        self.end = 0  #结束眨眼帧数（相对begin）
        self.bottom = 0  #在(begin，end)之间最小EAR所在的帧数
        self.EAR_buffer = []  #眨眼时候暂存EAR序列

        self.fatigue_state = None

    def getEAR(self,landmark):

        '''通过单帧图像的人脸关键点计算img中人眼EAR'''
        temp = 0.4   #默认为睁眼
        if (len(landmark) != 0):

            #左眼
            division = (2 * (abs(landmark[39][0] - landmark[36][0])))
            if (division != 0):
                temp = (abs(landmark[37][1] - landmark[41][1]) + abs(landmark[38][1] - landmark[40][1])) / division

            #右眼

        return temp

    #获取右眼EAR
    def get_right_EAR(self,landmark):
        temp = 0.4  # 默认为睁眼
        if (len(landmark) != 0):
            # 右眼
            division = (2 * (abs(landmark[45][0] - landmark[42][0])))
            if (division != 0):
                temp = (abs(landmark[43][1] - landmark[47][1]) + abs(
                    landmark[44][1] - landmark[46][1])) / division
        return temp

    '''根据校准的人脸图片和实时的头部姿态（yaw）校准EAR取值'''
    def getEAR_withYaw(self, landmark, yaw, EAR_yaw_threshold=-20):

        '''
        通过单帧图像的人脸关键点计算img中人眼EAR（如果单帧的Yaw > 10，则选择左眼计算EAR，如果单帧的Yaw < -10, 则选择右眼计算EAR
        :param landmark: 人脸关键点
        :param yaw: 头部姿态偏航角
        :return:
        '''

        temp = 0.4  # 默认为睁眼
        if (len(landmark) != 0):

            if(yaw < EAR_yaw_threshold):
                # 左眼
                division = (2 * (abs(landmark[39][0] - landmark[36][0])))
                if (division != 0):
                    temp = (abs(landmark[37][1] - landmark[41][1]) + abs(
                        landmark[38][1] - landmark[40][1])) / division
            else:
                # 右眼
                division = (2 * (abs(landmark[45][0] - landmark[42][0])))
                if (division != 0):
                    temp = (abs(landmark[43][1] - landmark[47][1]) + abs(
                        landmark[44][1] - landmark[46][1])) / division

        return temp

    def blinkDetect(self,landmark,preDetect,yaw=None):
        '''
        单帧进行眨眼检测: EAR，
        :param landmark: 人脸关键点 ndarray([[]])
        :param preDetect: 前一帧是否眨眼(True,False)
        :return:res: 0:未眨眼，1:开始眨眼，2:正在眨眼,
        '''
        '''眨眼检测'''
        self.preDetect = preDetect
        if(yaw != None):
            EAR = self.getEAR_withYaw(landmark,yaw)
        else:
            EAR = self.getEAR(landmark)

        #将EAR加入到滑动时间窗口中
        if(len(self.EAR_timeWindow) >= self.TIMEWINDOW_LENGTH):
            del(self.EAR_timeWindow[0])  #删除掉list第一个元素
        self.EAR_timeWindow.append(EAR)

        # print(f"EAR = {EAR}, preDetect = {self.preDetect}")
        if(self.preDetect == False and EAR < self.EAR_threshold):  #如果EAR小于阈值且前一帧未检测到眨眼，则当前为开始帧
            #开始眨眼
            self.begin = 0
            self.EAR_buffer.append(EAR)
            return 1
        elif (self.preDetect == True and EAR < self.EAR_threshold):  # 如果EAR小于阈值且前一帧也检测到眨眼（正在眨眼）
            self.EAR_buffer.append(EAR)
            return 2

        self.blinkFeature_seq = []  #清空眨眼特征序列
        #结束眨眼
        if(self.preDetect == True and EAR > self.EAR_threshold):
            self.EAR_buffer.append(EAR)
            self.end = len(self.EAR_buffer) - 1

            self.bottom = np.argmin(self.EAR_buffer)  #bottom

            duration_all = self.TIMEWINDOW_LENGTH
            self.blinkFrameCount = len([el for el in (self.EAR_timeWindow < self.EAR_threshold) if el == True])  #获取滑动时间窗口下小于EAR阈值的总帧数

            '''计算5维特征：眨眼持续时间，振幅，速度，眨眼时间百分比，睁眼状态下平均EAR'''
            blink_feature = BlinkFeature()
            blink_feature.cal_feature(self.EAR_buffer, self.begin, self.bottom, self.end, self.EAR_threshold,
                                      duration_all,self.blinkFrameCount)
            self.blinkFeature_seq = blink_feature.feature_2_list()  #将眨眼特征赋值到到眨眼特征序列上
            self.EAR_buffer = [] #清空EAR序列

        return 0

    '''只计算perclos，不计算5维眨眼特征(必须先执行blinkDetect()),识别眨眼类型：快眨眼，慢眨眼，正常眨眼'''
    def get_blinkSpeedDetect_perclos(self,PERCLOS_range=[0.3,0.5]):
        '''
        :param PERCLOS_range: perclos阈值范围，用于区分快眨眼，慢眨眼和正常眨眼
        :return: 眨眼检测结果，perclos
        '''
        frame_count = len([el for el in (self.EAR_timeWindow < self.EAR_threshold) if el == True])
        perclos = frame_count / self.TIMEWINDOW_LENGTH
        blink_speed_detect = self.slow_blink_detect(perclos,PERCLOS_range)
        return blink_speed_detect,perclos

    def slow_blink_detect(self,perclos,PERCLOS_range=[0.3,0.5]):
        '''
        #快眨眼，慢眨眼检测（perclos阈值判断）
        :return: 3:快眨眼，4:正常眨眼，5:慢眨眼
        '''
        if(perclos < PERCLOS_range[0]):
            return 3
        elif(perclos >= PERCLOS_range[0] and perclos < PERCLOS_range[1]):
            return 4
        else:
            return 5

    '''根据校准的人脸图片和实时的头部姿态（pitch）校准EAR阈值'''
    def adaptive_threshold(self,EAR_estimate,pitch,yaw, EAR_alpha=0.8, EAR_pitch_range=[-8,-5,10,16], EAR_beta=[0.75,0.85,1,0.85,0.75], EAR_yaw_threshold=-20):
        '''
        :param EAR_estimate: 正脸校准下的EAR值
        :param pitch: pitch越大，EAR阈值越小
        :param EAR_alpha: 通过校准图片的EAR * EAR_alpha得到初始EAR阈值
        :param EAR_pitch_range: 通过头部姿态pitch区间，根据对应的EAR_beta更新初始EAR阈值, len(EAR_pitch_range) = 4, 元素从小到大
        :param EAR_beta: pitch<-8时，通过EAR_threshold * 0.75来更新阈值, len(EAR_beta) = 5
        :param EAR_yaw_threshold: 根据头部姿态yaw值，选择用那只眼睛计算EAR, yaw < -20选择左眼计算EAR； yaw > -20,选择右眼计算EAR
        :return: None
        '''
        # EAR = self.getEAR(landmark[0][0])
        EAR = EAR_estimate
        self.EAR_threshold = EAR * EAR_alpha  #根据缩放因子计算初始EAR阈值
        # self.EAR_threshold = np.float64(0.25)  #根据缩放因子计算初始EAR阈值

        #根据pitch自适应调整EAR阈值
        if(pitch < EAR_pitch_range[0]):
            self.EAR_threshold = self.EAR_threshold * EAR_beta[0]

        elif(pitch >= EAR_pitch_range[0] and pitch < EAR_pitch_range[1]):
            self.EAR_threshold = self.EAR_threshold * EAR_beta[1]

        elif(pitch >= EAR_pitch_range[1] and pitch < EAR_pitch_range[2]):
            self.EAR_threshold = self.EAR_threshold * EAR_beta[2]

        elif(pitch >= EAR_pitch_range[2] and pitch < EAR_pitch_range[3]):
            self.EAR_threshold = self.EAR_threshold * EAR_beta[3]

        else:
            self.EAR_threshold = self.EAR_threshold * EAR_beta[4]



'''眨眼模型（real）评估（硬阈值）'''
def blinkModel_estimate(video,face_detector,EAR_threshold):
    '''
    模型评估：输出视频中检测到的眨眼次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param EAR_threshold EAR阈值
    @:return blinkCount:检测到的眨眼次数, blinkFeature_seq: 视频中提取的眨眼特征序列
    '''
    blinkCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  #视频总帧数

    eyeDetector = EyeDetector_real()
    eyeDetector.EAR_threshold = EAR_threshold
    eyeDetector.frameCount = 0
    preDetect = False  #前一帧未检测到眨眼
    #视频帧数
    while (eyeDetector.frameCount < frame_total):
        ret,frame = video.read()

        if(ret == True):
            dets = face_detector.detect_faces(frame)[0]
            if(len(dets) > 0):
                landmark = face_detector.detect_landmarks(frame,[dets])

                if (len(landmark) > 0):
                    '''眨眼检测'''
                    blink_detect = eyeDetector.blinkDetect(landmark[0][0],preDetect)
                    preDetect = False if blink_detect == 0 else True
                    if(blink_detect == 1): blinkCount += 1

            # print(f"detect frameNum = {frameCount}")
            # frameCount += 1
            # cv2.putText(frame,str(blinkCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.imshow("res",frame)
            # key = cv2.waitKey(15)
            # if(key == 27):  #ESC键退出
            #     break

        eyeDetector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return blinkCount,eyeDetector.blinkFeature_seq

'''眨眼模型（real）评估（自适应阈值）'''
def blinkModel_adaptive_estimate(video,face_detector,cal_landmark):
    '''
    模型评估：输出视频中检测到的眨眼次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param cal_landmark 校准图片的关键点
    @:return blinkCount:检测到的眨眼次数, blinkFeature_seq: 视频中提取的眨眼特征序列
    '''
    blinkCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  #视频总帧数

    eyeDetector = EyeDetector_real()
    eyeDetector.frameCount = 0
    headDetector = HeadDetector_real()
    preDetect = False  #前一帧未检测到眨眼
    frameCount = 0 #视频帧数
    while (eyeDetector.frameCount < frame_total):
        ret,frame = video.read()

        if(ret == True):
            dets = face_detector.detect_faces(frame)[0]
            if(len(dets) > 0):
                landmark = face_detector.detect_landmarks(frame,[dets])

                if (len(landmark) > 0):

                    pitch, _, yaw = headDetector.get_pitch_roll_yaw(face_detector, frame, dets, landmark)  # 头部姿态
                    eyeDetector.adaptive_threshold(cal_landmark, pitch, yaw)  #自适应阈值

                    '''眨眼检测'''
                    blink_detect = eyeDetector.blinkDetect(landmark[0][0],preDetect,yaw)
                    preDetect = False if blink_detect == 0 else True
                    if(blink_detect == 1): blinkCount += 1

                    # cv2.putText(frame, "EAR_threshold:" + str(eyeDetector.EAR_threshold), (60, 80),
                    #             cv2.FONT_HERSHEY_SIMPLEX, 1,
                    #             (0, 0, 255), 2)
                    # cv2.putText(frame, "X:" + str(pitch), (60, 130), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "Y:" + str(yaw), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # print(f"detect frameNum = {frameCount}")
            # frameCount += 1
            # cv2.putText(frame,str(blinkCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            #
            # cv2.imshow("res",frame)
            # key = cv2.waitKey(15)
            # if(key == 27):  #ESC键退出
            #     break

        eyeDetector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return blinkCount,eyeDetector.blinkFeature_seq

'''眨眼模型（real）评估（自适应阈值）: 人脸检测器为scrfd，landmark检测器为pyfeat_detector'''
def blinkModel_adaptive_estimate_scrfd(video,face_detector,landmark_detector, cal_landmark, cfg):
    '''
    模型评估：输出视频中检测到的眨眼次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param landmark_detector 人脸关键点检测器
    @:param cal_landmark 校准图片的关键点
    @:param cfg 配置文件
    @:return blinkCount:检测到的眨眼次数, blinkFeature_seq: 视频中提取的眨眼特征序列
    '''
    blinkCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  #视频总帧数

    eyeDetector = EyeDetector_real()
    eyeDetector.frameCount = 0
    headDetector = HeadDetector_real()
    preDetect = False  #前一帧未检测到眨眼
    frameCount = 0 #视频帧数
    while (eyeDetector.frameCount < frame_total):
        ret,frame = video.read()

        if(ret == True):
            dets = face_detector.detect_faces(frame)[0]
            if(len(dets) > 0):
                landmark = landmark_detector.detect_landmarks(frame,[dets])

                if (len(landmark) > 0):

                    pitch, _, yaw = headDetector.get_pitch_roll_yaw(landmark_detector, frame, dets, landmark)  # 头部姿态
                    eyeDetector.adaptive_threshold(cal_landmark, pitch, yaw,
                                                   EAR_alpha=cfg["EAR_alpha"], EAR_pitch_range=cfg["EAR_pitch_range"],
                                                   EAR_beta=cfg["EAR_beta"],
                                                   EAR_yaw_threshold=cfg["EAR_yaw_threshold"])  #自适应阈值
                    # eyeDetector.EAR_threshold = 0.25

                    '''眨眼检测'''
                    blink_detect = eyeDetector.blinkDetect(landmark[0][0],preDetect,yaw)
                    preDetect = False if blink_detect == 0 else True
                    if(blink_detect == 1): blinkCount += 1

                    # cv2.putText(frame, "EAR_threshold:" + str(eyeDetector.EAR_threshold), (60, 80),
                    #             cv2.FONT_HERSHEY_SIMPLEX, 1,
                    #             (0, 0, 255), 2)
                    # cv2.putText(frame, "X:" + str(pitch), (60, 130), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    # cv2.putText(frame, "Y:" + str(yaw), (60, 180), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            # print(f"detect frameNum = {frameCount}")
            # frameCount += 1
            # cv2.putText(frame,str(blinkCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            #
            # cv2.imshow("res",frame)
            # key = cv2.waitKey(15)
            # if(key == 27):  #ESC键退出
            #     break

        eyeDetector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return blinkCount,eyeDetector.blinkFeature_seq