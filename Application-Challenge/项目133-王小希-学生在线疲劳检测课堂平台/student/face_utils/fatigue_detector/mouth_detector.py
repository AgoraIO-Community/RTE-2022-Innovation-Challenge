import cv2
import numpy as np

'''哈欠检测'''
class MouthDetector_real():

    def __init__(self):
        self.MAR_threshold = 0
        self.preDetect = False  #前一帧未检测到提眉
        self.frameCount = 0
        self.TW_length = 65  #MAR时间窗口长度,依次哈欠2-5s,如果fps为30,则长度为70~150较为适应
        self.MAR_timeWindow = []  #MAR时间窗口
        self.MAR_threshold_timeWindow = []  #MAR_threshold时间窗口

    def get_MAR(self,landmark):
        MAR = (abs(landmark[50][1] - landmark[58][1]) + abs(landmark[52][1] - landmark[56][1])) / (2 * (abs(landmark[54][0] - landmark[48][0])))
        return MAR

    def yawn_detect(self,landmark,preDetect):
        '''
        :param landmark: 人脸关键点
        :return: 是否提眉，0:开始打哈欠，1:正在打哈欠, 2:结束打哈欠
        '''
        self.preDetect = preDetect
        MAR = self.get_MAR(landmark)

        if(len(self.MAR_timeWindow) > self.TW_length):
            del(self.MAR_timeWindow[0])  #删除掉list第一个元素
            del(self.MAR_threshold_timeWindow[0])  #删除掉list第一个元素

        self.MAR_timeWindow.append(MAR)
        self.MAR_threshold_timeWindow.append(self.MAR_threshold)
        if (self.preDetect == False and MAR > self.MAR_threshold):  # 如果EAR小于阈值且前一帧未检测到眨眼，则当前为开始帧
            # 开始打哈欠
            return 1
        elif (self.preDetect == True and MAR > self.MAR_threshold):  # 如果EAR小于阈值且前一帧也检测到眨眼（正在眨眼）
            # 正在打哈欠
            return 2
        return 0  #没有打哈欠

    def detect_yawn_from_FOM(self,ratio=0.8):

        #如果时间窗口内MAR大于阈值占比超过ratio，则标记为打哈欠
        # if(len(self.MAR_timeWindow) == self.TW_length):
        FOM = self.get_FOM()
        if(FOM > ratio):
            return True
        return False

    # 获取FOM特征
    def get_FOM(self):
        if(len(self.MAR_timeWindow) != 0):
            yawn_mar_list = [mar for index, mar in enumerate(self.MAR_timeWindow) if
                             mar >= self.MAR_threshold_timeWindow[index]]
            FOM = len(yawn_mar_list) / len(self.MAR_timeWindow)
            return FOM
        else:
            return 0

    '''根据校准的人脸图片和实时的头部姿态（pitch）校准EAR阈值'''
    def adaptive_threshold(self, yaw, MAR_alpha=2.5, MAR_yaw_range=[-6, -3],
                           MAR_beta=[1.3, 1.2, 1]):
        '''
        :param cal_landmark: 正常图像（校准图像）的人脸关键点
        :param pitch: pitch越大，MAR阈值越小
        :param MAR_alpha: 通过校准图片的MAR * MAR_alpha得到初始MAR阈值
        :param MAR_pitch_range: 通过头部姿态pitch区间，根据对应的EAR_beta更新初始EAR阈值, len(EAR_pitch_range) = 4, 元素从小到大
        :param MAR_beta: pitch<-8时，通过EAR_threshold * 0.75来更新阈值, len(EAR_beta) = 5
        :param MAR_yaw_threshold: 根据头部姿态yaw值，选择用那只眼睛计算EAR, yaw < -20选择左眼计算EAR； yaw > -20,选择右眼计算EAR
        :return: None
        '''
        # MAR = self.get_MAR(cal_landmark[0][0])
        # self.MAR_threshold = MAR * MAR_alpha  # 根据缩放因子计算初始MAR阈值
        # self.MAR_threshold = 0.6  #固定初始阈值

        # 根据pitch自适应调整MAR阈值
        if (yaw < MAR_yaw_range[0]):
            self.MAR_threshold = self.MAR_threshold * MAR_beta[0]

        elif (yaw >= MAR_yaw_range[0] and yaw < MAR_yaw_range[1]):
            self.MAR_threshold = self.MAR_threshold * MAR_beta[1]
        else:
            self.MAR_threshold = self.MAR_threshold * MAR_beta[2]


'''哈欠模型评估'''
def yawnModel_estimate(video,face_detector,MAR_threshold):
    '''
    模型评估：输出视频中检测到的提眉次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param MAR_threshold MAR阈值
    @:return raiseCount:检测到的提眉次数
    '''
    yawnCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  # 视频总帧数

    detector = MouthDetector_real()
    detector.MAR_threshold = MAR_threshold
    detector.frameCount = 0
    preDetect = False  # 前一帧未检测到眨眼
    while (detector.frameCount < frame_total):
        ret, frame = video.read()

        if (ret == True):
            dets = face_detector.detect_faces(frame)[0]
            if (len(dets) > 0):
                landmark = face_detector.detect_landmarks(frame, [dets])

                if (len(landmark) > 0):
                    '''提眉检测'''
                    yawn_detect = detector.yawn_detect(landmark[0][0], preDetect)
                    preDetect = False if yawn_detect == 0 else True
                    if (yawn_detect == 1): yawnCount += 1

            print(f"detect frameNum = {detector.frameCount}")
            cv2.putText(frame,str(yawnCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imshow("res",frame)
            key = cv2.waitKey(15)
            if(key == 27):  #ESC键退出
                break

        detector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return yawnCount