import cv2
from face_utils.fatigue_detector.detector import Detector
from matplotlib import pyplot as plt
import numpy as np
from face_utils.fatigue_detector.head_detector import HeadDetector_real


'''
基于帧序列的眉毛检测器:
    实现功能: 
    1) 如果没有传入指定图片，则对视频进行皱眉ROI提取和裁剪(视频流使用VideoStream进行管理)
    2) 如果传入指定图片，则对单独的图片进行皱眉ROI提取和裁剪
'''
class BrowDetector(Detector):

    def __init__(self,videoStream,modelPath):
        super().__init__(videoStream,modelPath)

    '''提取两眉毛ROI区域'''
    def extract_brows_ROI(self):
        '''
        :return: 返回ROI矩形四个点
        '''
        return (None,None,None,None)

    '''绘制当前帧的人脸68个关键点'''
    def landmarkPlot(self,frame,landmark):
        # 检测到人脸，绘制关键点
        if (len(landmark) != 0):
            # 绘制68个关键点
            for j in range(len(landmark)):
                for i in range(68):
                    cv2.circle(frame, (tuple([int(landmark[j][i][0]),int(landmark[j][i][1])])), 2, (0, 525, 0), -1, 8)
        return frame

    '''清空detector中间变量,并修改videoStream'''
    def clear_detector_val(self,videoStream):
        self.videoStream = videoStream
        self.counter = 0  # 用来记录当前帧数


'''通过3个关键点(landmarks[22,23,28])，根据直线和垂线，计算斜矩形4个角点的坐标(A,B,C,D)'''
def cal_forthROILandmark(landmark_a,landmark_b,landmark_c):
    '''
    np方程组求解 参考 https://blog.csdn.net/sinat_41696687/article/details/109993517
    :param landmark_a: landmarks[22]  (x1,y1)
    :param landmark_b: landmarks[23]  (x2,y2)
    :param landmark_c: landmarks[28]  (x3,y3)
    :return: 求解出斜矩形的四个坐标点A,B,C,D, type = list()

    目的是求解出：
    1）平行于ab，过点c的直线ab‘；
    2）平行于ab，过点d的直线ab’‘；
    3）平行与cd，过点a的直线cd’
    4）平行与cd，过点b的直线cd’’
    进而两两联立上面的方程，求解出斜矩形的四个坐标点A,B,C,D
    '''
    x1, y1 = landmark_a
    x2, y2 = landmark_b
    x3, y3 = landmark_c

    '''
    Step1：计算ab，cd交点o，=> 得到cd直线方程co
        根据两点式方程，化简ab直线方程: y=(y2-y1)/(x2-x1) * x - (x1(y2-y1) - y1(x2-x1))/(x2-x1)
        计算ab直线的垂线方程cd: y = -(x2-x1)/(y2-y1) * x + b，代入c点化简得b = y3 + (x2-x1)/(y2-y1) * x3
        通过联立方程组：
            [(y2-y1)/(x2-x1) * x - y] = (x1(y2-y1) - y1(x2-x1))/(x2-x1)   （1）
            [(x2-x1)/(y2-y1) * x + y] = y3 + (x2-x1)/(y2-y1) * x3     （2）
        计算ab，cd的交点
    '''
    # P1 = np.array([[(y2-y1)/(x2-x1),-1],[(x2-x1)/(y2-y1), 1]])
    # P2 = np.array([(x1 * (y2-y1) - y1 * (x2-x1))/(x2-x1), y3 + (x2-x1)/(y2-y1) * x3])
    # X = np.linalg.inv(P1).dot(P2)  #ab与直线cd的交点o
    # print(f"直线ab与直线cd的交点O坐标为{X[0],X[1]}")

    '''
    Step2：计算co的距离
        根据点c到直线ab的距离公式: s = |(y2-y1)/(x2-x1) * x3 - y3 - (x1(y2-y1) - y1(x2-x1))/(x2-x1)| / sqrt((y2-y1)/(x2-x1)^2 + 1)
        求解c点到ab直线的距离dist
    '''
    dist = np.fabs((y2-y1)/(x2-x1) * x3 - y3 - (x1 * (y2-y1) - y1 * (x2-x1))/(x2-x1)) / np.sqrt((y2-y1)/(x2-x1)**2 + 1)

    '''
    Step3：求解平行于ab，过点c的直线ab‘ 
        设平行与ab的直线方程ab‘为 y=(y2-y1)/(x2-x1) * x - z,
        代入c点，得到z = (y2-y1)/(x2-x1) * x3 - y3
        即ab’方程为 y=(y2-y1)/(x2-x1) * x - ((y2-y1)/(x2-x1) * x3 - y3)
    '''
    z = (y2-y1)/(x2-x1) * x3 - y3  #ab‘方程中的常数项

    '''
    Step4：求解平行于ab，过点d的直线ab‘’ 
        设ab‘’直线方程:  y = (y2-y1)/(x2-x1) * x - u
        计算c点到ab‘’的距离: S = |(y2-y1)/(x2-x1) * x3 - y3 - u| / sqrt((y2-y1)/(x2-x1)^2 + 1) = 2 * dist
        化简S，得到 u = (y2 - y1)/(x2-x1) * x3 - y3 +/- sqrt((y2-y1)/(x2-x1)^2 + 1) * 2 * dist
        进而得到ab‘’直线方程
    '''
    #ab‘’方程的常数项（判断u1，u2哪个合适，可以根据常识，d点y4一定小于c点y3）
    u1 = (y2 - y1) / (x2 - x1) * x3 - y3 + np.sqrt((y2 - y1) / (x2 - x1) ** 2 + 1) * 2 * dist
    u2 = (y2 - y1) / (x2 - x1) * x3 - y3 - np.sqrt((y2 - y1) / (x2 - x1) ** 2 + 1) * 2 * dist
    #比较ab‘’与ab的截距，即选择u1,u2中最大的
    u = max(u1,u2)

    '''
    Step5：求解平行于cd，过点a的直线cd‘ (cd‘垂直于ab)
        设cd‘直线方程:  y = -(x2-x1)/(y2-y1) * x - v
        代入a点(x1,y1)，y1 = -(x2-x1)/(y2-y1) * x1 - v
        得到v = -(x2-x1)/(y2-y1) * x1 - y1
        进而得到cd'方程
    '''
    A, B, C, D = [],[],[],[]

    # landmark_a = (293, 298), landmark_b = (330, 298), landmark_c = (312, 332)
    # y2 - y1 = 298 - 298 = 0
    if(((y2 - y1) * x1 == 0) or ((y2 - y1) * x2 == 0)):  #y2 = y1,方程求解失效，这里注意纵轴为y，横轴为x（和以往的x表示height，y表示width不同）

        # print(f"landmark_a = {landmark_a}, landmark_b = {landmark_b}, landmark_c = {landmark_c}")
        # print(f"y2 - y1 = {y2}  - {y1} = {y2 - y1}")

        dist = y3 - y2
        temp = y2 - dist
        if(temp < 0):
            A = np.array([x1,0])
            B = np.array([x2,0])
        else:
            A = np.array([x1, temp])
            B = np.array([x2, temp])

        C = np.array([x1,y3])
        D = np.array([x2,y3])

        return A, B, C, D

    v = -(x2 - x1) / (y2 - y1) * x1 - y1

    '''
    Step6：求解平行于cd，过点b的直线cd‘‘ 
        设cd‘‘直线方程:  y = -(x2-x1)/(y2-y1) * x - w
            代入b点(x2,y2)，y2 = -(x2-x1)/(y2-y1) * x2 - w
            得到w = -(x2-x1)/(y2-y1) * x2 - y2
            进而得到cd'方程
    '''
    w = -(x2 - x1) / (y2 - y1) * x2 - y2

    '''
    联立ab’和cd‘，求解A
        ab’: y = (y2-y1)/(x2-x1) * x - z
        cd‘: y = -(x2-x1)/(y2-y1) * x - v
    '''
    M1 = np.array([[(y2-y1) / (x2-x1), -1], [(x2 - x1) / (y2 - y1), 1]])
    M2 = np.array([ z, -v])
    A = np.linalg.inv(M1).dot(M2)  #ab‘与直线cd’的交点A(前提是M1有逆)
    # print(f"直线ab‘与直线cd’的交点A: (x = {A[0]},y = {A[1]})")

    '''
    联立ab’和cd’‘，求解B
        ab’: y = (y2-y1)/(x2-x1) * x - z
        cd‘’: y = -(x2-x1)/(y2-y1) * x - w
    '''
    M1 = np.array([[(y2 - y1) / (x2 - x1), -1], [(x2 - x1) / (y2 - y1), 1]])
    M2 = np.array([z, -w])
    B = np.linalg.inv(M1).dot(M2)  # ab‘与直线cd’‘的交点B
    # print(f"直线ab‘与直线cd’’的交点B: (x = {B[0]},y = {B[1]})")

    '''
    联立ab’’和cd‘，求解C
        ab’’: y = (y2-y1)/(x2-x1) * x - u
        cd‘: y = -(x2-x1)/(y2-y1) * x - v
    '''
    M1 = np.array([[(y2 - y1) / (x2 - x1), -1], [(x2 - x1) / (y2 - y1), 1]])
    M2 = np.array([u, -v])
    C = np.linalg.inv(M1).dot(M2)  # ab‘‘与直线cd’的交点C
    # print(f"直线ab‘‘与直线cd’的交点C: (x = {C[0]},y = {C[1]})")

    '''
    联立ab‘’和cd‘‘，求解D
        ab’’: y = (y2-y1)/(x2-x1) * x - u
        cd‘’: y = -(x2-x1)/(y2-y1) * x - w
    '''
    M1 = np.array([[(y2 - y1) / (x2 - x1), -1], [(x2 - x1) / (y2 - y1), 1]])
    M2 = np.array([u, -w])
    D = np.linalg.inv(M1).dot(M2)  # ab‘‘与直线cd’’的交点D
    # print(f"直线ab‘‘与直线cd’’的交点D: (x = {D[0]},y = {D[1]})")

    '''返回的坐标位置如下:
        [C  A]
        [D  B]
    '''
    return A,B,C,D

'''不规则ROI提取 参考 https://blog.csdn.net/lyxleft/article/details/90675666 '''
def irregularROI_extract(img, ROI_locPoints):
    '''
    :param img: type=ndarray
    :param ROI_locPoints: type=list, [[x1,y1],[x2,y2]...]
    :return: ROI区域图片
    '''

    global src, ROI, ROI_flag, mask2
    mask = np.zeros(img.shape, np.uint8)
    pts = np.array([ROI_locPoints], np.int32)  # pts是多边形的顶点列表（顶点集）
    pts = pts.reshape((-1, 1, 2))
    # 这里 reshape 的第一个参数为-1, 表明这一维的长度是根据后面的维度的计算出来的。
    # OpenCV中需要先将多边形的顶点坐标变成顶点数×1×2维的矩阵，再来绘制

    # --------------画多边形---------------------
    mask = cv2.polylines(mask, [pts], True, (255, 255, 255))
    ##-------------填充多边形---------------------
    mask2 = cv2.fillPoly(mask, [pts], (255, 255, 255))
    # cv2.imshow('mask', mask2)
    # cv2.imwrite('mask.jpg', mask2)
    contours, hierarchy = cv2.findContours(cv2.cvtColor(mask2, cv2.COLOR_BGR2GRAY), cv2.RETR_TREE,
                                                  cv2.CHAIN_APPROX_NONE)
    ROIarea = cv2.contourArea(contours[0])
    # print("ROIarea:", ROIarea)

    ROI = cv2.bitwise_and(mask2, img)

    #将ROI黑色区域填充上ROI区域的像素均值

    # cv2.imwrite('ROI.jpg', ROI)
    # cv2.imshow('ROI', ROI)
    return ROI

'''通过ROI区域的4个角点和处理过的图片，将不规则的ROI裁剪成正规矩形'''
def crop_ROI(img,A,B,C,D):
    '''
    :param img: 经过ROI提取的，边缘部分用黑色填充的要裁剪的图片
    :param A: 角点1
    :param B: 角点2
    :param C: 角点3
    :param D: 角点3
    :return:经过裁剪的ROI，和要计算旋转角的两个向量
    '''
    x_min,y_min = np.min(np.array([A,B,C,D]),axis=0)  #求各列的最小值
    x_max,y_max = np.max(np.array([A,B,C,D]),axis=0)  #求各列的最大值
    ROI = img[round(y_min) : round(y_max), round(x_min) : round(x_max),:]
    return ROI

# #非ROI区域填充上黑色
# def irregularROI_extract(img, ROI_locPoints):
#     '''
#     :param img: type=ndarray
#     :param ROI_locPoints: type=list, [[x1,y1],[x2,y2]...]
#     :return: ROI区域图片
#     '''
#
#     global src, ROI, ROI_flag, mask2
#     mask = np.zeros(img.shape, np.uint8)
#     pts = np.array([ROI_locPoints], np.int32)  # pts是多边形的顶点列表（顶点集）
#     pts = pts.reshape((-1, 1, 2))
#     # 这里 reshape 的第一个参数为-1, 表明这一维的长度是根据后面的维度的计算出来的。
#     # OpenCV中需要先将多边形的顶点坐标变成顶点数×1×2维的矩阵，再来绘制
#
#     # --------------画多边形---------------------
#     mask = cv2.polylines(mask, [pts], True, (255, 255, 255))
#     ##-------------填充多边形---------------------
#     mask2 = cv2.fillPoly(mask, [pts], (255, 255, 255))
#     # cv2.imshow('mask', mask2)
#     # cv2.imwrite('mask.jpg', mask2)
#     contours, hierarchy = cv2.findContours(cv2.cvtColor(mask2, cv2.COLOR_BGR2GRAY), cv2.RETR_TREE,
#                                            cv2.CHAIN_APPROX_NONE)
#     ROIarea = cv2.contourArea(contours[0])
#     # print("ROIarea:", ROIarea)
#
#     ROI = cv2.bitwise_and(mask2, img)
#     # cv2.imwrite('ROI.jpg', ROI)
#     # cv2.imshow('ROI', ROI)
#     return ROI

#将ROI黑色区域填充上ROI区域的像素均值
def irregularROI_extract_and_crop(img, ROI_locPoints):
    '''
    :param img: type=ndarray
    :param ROI_locPoints: type=list, [[x1,y1],[x2,y2]...]
    :return: ROI区域图片
    '''
    A, B, C, D = ROI_locPoints
    x_min, y_min = np.min(np.array([A, B, C, D]), axis=0)  # 求各列的最小值
    x_max, y_max = np.max(np.array([A, B, C, D]), axis=0)  # 求各列的最大值
    padding_b = np.mean(img[round(y_min): round(y_max), round(x_min): round(x_max), 0])
    padding_g = np.mean(img[round(y_min): round(y_max), round(x_min): round(x_max), 1])
    padding_r = np.mean(img[round(y_min): round(y_max), round(x_min): round(x_max), 2])

    global src, ROI, ROI_flag, mask2
    mask = np.zeros(img.shape, np.uint8)
    pts = np.array([ROI_locPoints], np.int32)  # pts是多边形的顶点列表（顶点集）
    pts = pts.reshape((-1, 1, 2))
    # 这里 reshape 的第一个参数为-1, 表明这一维的长度是根据后面的维度的计算出来的。
    # OpenCV中需要先将多边形的顶点坐标变成顶点数×1×2维的矩阵，再来绘制

    # --------------画多边形---------------------
    mask = cv2.polylines(mask, [pts], True, (255, 255, 255))
    ##-------------填充多边形---------------------
    mask2 = cv2.fillPoly(mask, [pts], (255, 255, 255))
    # cv2.imshow('mask', mask2)
    # cv2.imwrite('mask.jpg', mask2)
    contours, hierarchy = cv2.findContours(cv2.cvtColor(mask2, cv2.COLOR_BGR2GRAY), cv2.RETR_TREE,
                                           cv2.CHAIN_APPROX_NONE)
    ROIarea = cv2.contourArea(contours[0])
    # print("ROIarea:", ROIarea)

    #ROI区域提取
    ROI = cv2.bitwise_and(mask2, img)
    #ROI区域裁剪
    ROI = ROI[round(y_min): round(y_max), round(x_min): round(x_max), :]
    # 将ROI黑色区域填充上ROI区域的像素均值
    for i in range(len(ROI)):
        for j in range(len(ROI[0])):
            if(ROI[i][j][0] == 0):
                ROI[i][j][0] = padding_b
            if (ROI[i][j][1] == 0):
                ROI[i][j][1] = padding_g
            if (ROI[i][j][2] == 0):
                ROI[i][j][2] = padding_r

    # cv2.imshow('ROI', ROI)
    return ROI

# '''按给定的旋转中心和旋转角度，旋转图片'''
# def rotate_img(img,center,angle):
#
#     #获取二维旋转矩阵
#     M = cv2.getRotationMatrix2D(center,angle,1.0)
#
#     r, c, ch = img.shape
#     size = (c, r)
#     #仿射变换
#     rst = cv2.warpAffine(img,M,dsize=size)
#     return rst

'''提眉检测（BAR）'''
def browRaised_detect(landmark,threshold):
    '''
    @:param landmark: ndarray [(),(),...,]
    @:param threshold: 提眉检测阈值
    @:return BAR,isRaised
    BAR计算公式  BAR = \frac{|p_{20} - p_{42}| + |p_{21} - p_{41}|}{2 \times |p_{22} - p_{18}|}
    '''
    isRaised = False
    BAR = (np.fabs(landmark[20][1] - landmark[42][1]) + np.fabs(landmark[21][1] - landmark[41][1])) / (2 * np.fabs(landmark[22][0] - landmark[18][0]))
    if(BAR > threshold):
        isRaised = True
    return BAR,isRaised

'''关于距离一阶差分绘制折线图'''
def BAR_linePlot(x_list,y_list):

    plt.clf()  # 可以避免重复出现标签
    # 动态绘制折线图
    # x_list.append(frame_count)
    # d_list.append(delta_d)
    # plt.subplot(2, 1, 1)
    plt.xlabel("frame_count")
    plt.plot(x_list, y_list, c='b', ls='-', marker=',', label="BAR取值")  ## 保存历史数据
    plt.legend(loc="upper left")
    plt.pause(0.1)
    pass

'''实时提眉检测'''
class BrowDetector_real():

    def __init__(self):
        self.BAR_threshold = 0
        self.preDetect = False  #前一帧未检测到提眉
        self.frameCount = 0

    '''绘制当前帧的人脸68个关键点'''
    def landmarkPlot(self, frame, landmark):
        # 检测到人脸，绘制关键点
        if (len(landmark) != 0):
            # 绘制68个关键点
            for j in range(len(landmark)):
                for i in range(68):
                    cv2.circle(frame, (tuple([int(landmark[j][i][0]), int(landmark[j][i][1])])), 2, (0, 525, 0), -1, 8)
        return frame

    #左眉毛BAR
    def get_BAR(self,landmark):
        BAR = 0.4
        division = 2 * np.fabs(landmark[21][0] - landmark[17][0])
        if (division != 0):
            BAR = (np.fabs(landmark[19][1] - landmark[41][1]) + np.fabs(
                landmark[20][1] - landmark[40][1])) / division
        return BAR

    #右眉毛BAR
    def get_right_BAR(self,landmark):
        BAR = 0.4
        division = 2 * np.fabs(landmark[26][0] - landmark[22][0])
        if (division != 0):
            BAR = (np.fabs(landmark[23][1] - landmark[47][1]) + np.fabs(
                landmark[24][1] - landmark[46][1])) / division
        return BAR

    '''根据校准的人脸图片和实时的头部姿态（yaw）校准BAR取值'''
    def getBAR_withYaw(self, landmark, yaw, BAR_yaw_range=[-20,20]):
        '''
        通过单帧图像的人脸关键点计算img中人眼BAR（如果单帧的Yaw > 10，则选择左眼计算EAR，如果单帧的Yaw < -10, 则选择右眼计算EAR
        :param landmark: 当前帧的人脸关键点
        :param yaw: 头部姿态偏航角
        :param BAR_yaw_range: 根据头部姿态yaw值，选择用那个眉毛计算BAR, yaw < -20选择左眉计算EAR； yaw > 20,选择右眉计算EAR；其他情况两眉去平均
        :return:
        '''
        BAR = 0.7  # 默认为提眉
        if (len(landmark) != 0):

            if(yaw < BAR_yaw_range[0]):
                # 左眼
                division = 2 * np.fabs(landmark[21][0] - landmark[17][0])
                if (division != 0):
                    BAR = (np.fabs(landmark[19][1] - landmark[41][1]) + np.fabs(
                        landmark[20][1] - landmark[40][1])) / division
                    
            elif(yaw > BAR_yaw_range[1]):
                # 右眼
                division = 2 * np.fabs(landmark[26][0] - landmark[22][0])
                if (division != 0):
                    BAR = (np.fabs(landmark[23][1] - landmark[47][1]) + np.fabs(
                        landmark[24][1] - landmark[46][1])) / division
            else:
                #两边取平均
                BAR_mean = 0
                division = 2 * np.fabs(landmark[21][0] - landmark[17][0])
                if (division != 0):
                    BAR = (np.fabs(landmark[19][1] - landmark[41][1]) + np.fabs(
                        landmark[20][1] - landmark[40][1])) / division
                BAR_mean += BAR

                BAR = 0.7  # 默认为睁眼
                division = 2 * np.fabs(landmark[26][0] - landmark[22][0])
                if (division != 0):
                    BAR = (np.fabs(landmark[23][1] - landmark[47][1]) + np.fabs(
                        landmark[24][1] - landmark[46][1])) / division

                BAR_mean += BAR
                BAR = BAR_mean / 2

        return BAR

    def brow_raised_detect(self,landmark,preDetect,yaw = None):
        '''
        :param landmark: 人脸关键点
        :param preDetect: 前一帧是否检测到提眉
        :param yaw 头部姿态偏航角
        :return: 是否提眉，0:开始提眉，1:正在提眉, 2:结束提眉
        '''
        self.preDetect = preDetect
        if (yaw != None):
            BAR = self.getBAR_withYaw(landmark, yaw)
        else:
            BAR = self.get_BAR(landmark)

        if (self.preDetect == False and BAR > self.BAR_threshold):  # 如果EAR小于阈值且前一帧未检测到眨眼，则当前为开始帧
            # 开始提眉
            return 1
        elif (self.preDetect == True and BAR > self.BAR_threshold):  # 如果EAR小于阈值且前一帧也检测到眨眼（正在眨眼）
            # 正在提眉
            return 2
        return 0  #没有提眉

    '''根据校准的人脸图片和实时的头部姿态（pitch）校准BAR阈值'''
    def adaptive_threshold(self, BAR_estimate, pitch, yaw, BAR_alpha=1.2, BAR_pitch_range=[-3,8,14,20], BAR_beta=[0.95,1,0.95,0.9,0.88], BAR_yaw_range=[-20,20]):
        '''
        :param BAR_estimate: 正脸下的校准BAR值
        :param pitch: pitch越大，BAR阈值越小
        :param BAR_alpha: 通过校准图片的BAR * BAR_alpha得到初始BAR阈值
        :param BAR_pitch_range: 通过头部姿态pitch区间，根据对应的BAR_beta更新初始BAR阈值, len(BAR_pitch_range) = 4, 元素从小到大
        :param BAR_beta:  pitch<-3时，通过BAR_threshold * 0.95来更新阈值, len(EAR_pitch_range) = 5
        :param BAR_yaw_range: 根据头部姿态yaw值，选择用那个眉毛计算BAR, yaw < -20选择左眉计算EAR； yaw > 20,选择右眉计算EAR；其他情况两眉去平均
        :return: None
        '''
        BAR = BAR_estimate
        self.BAR_threshold = BAR * BAR_alpha

        # 根据pitch自适应调整BAR阈值
        if (pitch < BAR_pitch_range[0]):
            self.BAR_threshold = self.BAR_threshold * BAR_beta[0]

        elif (pitch >= BAR_pitch_range[0] and pitch < BAR_pitch_range[1]):
            self.BAR_threshold = self.BAR_threshold * BAR_beta[1]

        elif (pitch >= BAR_pitch_range[1] and pitch < BAR_pitch_range[2]):
            self.BAR_threshold = self.BAR_threshold * BAR_beta[2]

        elif (pitch >= BAR_pitch_range[2] and pitch < BAR_pitch_range[3]):
            self.BAR_threshold = self.BAR_threshold * BAR_beta[3]

        else:
            self.BAR_threshold = self.BAR_threshold * BAR_beta[4]

    '''皱眉检测'''
    # def frown_detect_withThreshold(self,ROI,PIXEL_THRESHOLD=52,RATIO_THRESHOLD=0.3):
    #     '''
    #     :param ROI: 眉毛ROI图片 ndarray
    #     :param PIXEL_THRESHOLD: 灰度像素阈值，用于将SOBEL算子处理后的图片二值化 (0~255)
    #     :param RATIO_THRESHOLD: 黑白像素比值的阈值，如果大于该值，则为皱眉
    #     :return:
    #     '''
    #
    #     #SOBEL算子
    #     ROI = cv2.medianBlur(ROI, ksize=3)
    #     # sobel_xy = cv2.Sobel(ROI, cv2.CV_64F, 1, 1)  #对x，y方向使用sobel算子
    #     # edge = cv2.convertScaleAbs(sobel_xy)  #对x，y方向使用sobel算子
    #     # edge = filters.sobel(ROI)   #sobel算子
    #     threshold1 = cv2.getTrackbarPos('threshold1', 'Canny')  # 阈值1
    #     threshold2 = cv2.getTrackbarPos('threshold2', 'Canny')  # 阈值2
    #     L2gradient = cv2.getTrackbarPos('L2gradient', 'Canny')  # 参数
    #     edge = cv2.Canny(ROI, threshold1=threshold1, threshold2=threshold2, L2gradient=L2gradient, apertureSize=5) # canny边缘检测
    #
    #     cv2.imshow("Canny",edge)


'''提眉模型评估'''
def browRaisedModel_estimate(video,face_detector,BAR_threshold):
    '''
    模型评估：输出视频中检测到的提眉次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param BAR_threshold BAR阈值
    @:return raiseCount:检测到的提眉次数
    '''
    raiseCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  # 视频总帧数

    detector = BrowDetector_real()
    detector.BAR_threshold = BAR_threshold
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
                    raise_detect = detector.brow_raised_detect(landmark[0][0], preDetect)
                    preDetect = False if raise_detect == 0 else True
                    if (raise_detect == 1): raiseCount += 1

            # print(f"detect frameNum = {detector.frameCount}")
            # cv2.putText(frame,str(raiseCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.imshow("res",frame)
            # key = cv2.waitKey(15)
            # if(key == 27):  #ESC键退出
            #     break

        detector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return raiseCount

'''提眉模型（real）评估（自适应阈值）'''
def browRaisedModel_adaptive_estimate(video,face_detector,cal_landmark):
    '''
    模型评估：输出视频中检测到的提眉次数
    @:param video 要检测的视频
    @:param face_detector 人脸检测器
    @:param cal_landmark 校准图片的关键点
    @:return raiseCount:检测到的提眉次数
    '''
    raiseCount = 0
    frame_total = video.get(cv2.CAP_PROP_FRAME_COUNT)  # 视频总帧数

    detector = BrowDetector_real()
    headDetector = HeadDetector_real()
    detector.frameCount = 0
    preDetect = False  # 前一帧未检测到眨眼
    while (detector.frameCount < frame_total):
        ret, frame = video.read()

        if (ret == True):
            dets = face_detector.detect_faces(frame)[0]
            if (len(dets) > 0):
                landmark = face_detector.detect_landmarks(frame, [dets])

                if (len(landmark) > 0):

                    pitch, _, yaw = headDetector.get_pitch_roll_yaw(face_detector, frame, dets, landmark)  # 头部姿态
                    detector.adaptive_threshold(cal_landmark, pitch, yaw)

                    '''提眉检测'''
                    raise_detect = detector.brow_raised_detect(landmark[0][0], preDetect,yaw)
                    preDetect = False if raise_detect == 0 else True
                    if (raise_detect == 1): raiseCount += 1

            # print(f"detect frameNum = {detector.frameCount}")
            # cv2.putText(frame,str(raiseCount), (60, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            # cv2.imshow("res",frame)
            # key = cv2.waitKey(15)
            # if(key == 27):  #ESC键退出
            #     break

        detector.frameCount += 1

    # os.system('cls') #清空控制台
    video.release()
    return raiseCount

'''基于图片的提眉检测'''
def browRaisedModel_adaptive_img_estimate(img,face_detector,cal_landmark):
    '''
    模型评估：输出视频中检测到的提眉次数
    @:param img 要检测的图片
    @:param face_detector 人脸检测器
    @:param cal_landmark 校准图片的关键点
    @:return raiseCount:检测到的提眉次数
    '''
    detector = BrowDetector_real()  #提眉检测器
    headDetector = HeadDetector_real()  #头部姿态检测器
    dets = face_detector.detect_faces(img)[0]
    preDetect = False  # 前一帧未检测到眨眼
    if (len(dets) > 0):
        landmark = face_detector.detect_landmarks(img, [dets])

        if (len(landmark) > 0):
            pitch, _, yaw = headDetector.get_pitch_roll_yaw(face_detector, img, dets, landmark)  # 头部姿态
            detector.adaptive_threshold(cal_landmark, pitch, yaw)

            '''提眉检测'''
            raise_detect = detector.brow_raised_detect(landmark[0][0], preDetect, yaw)
            if (raise_detect == 1):
                return "raise"  #检测到提眉

    return "normal"  #未检测到提眉