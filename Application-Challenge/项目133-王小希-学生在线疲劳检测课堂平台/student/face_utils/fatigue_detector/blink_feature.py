import numpy as np
''''''
'''眨眼特征类'''
class BlinkFeature(object):

    def __init__(self):
        self.duration = 0  #眨眼持续时间（单位-帧数）
        self.amplitude = 0  #眨眼振幅
        self.EOV = 0  #眼睛睁开速度Eye Opening Velocity
        self.Perclos = 0  #眨眼时间百分比
        self.non_blink_EAR = 0  #睁眼状态下平均EAR

    '''BlinkFeature转ndarray'''
    def feature_2_ndarray(self):
        temp = [self.duration,self.amplitude,self.EOV,self.Perclos,self.non_blink_EAR]
        return np.array(temp)

    '''BlinkFeature转list'''
    def feature_2_list(self):
        temp = [self.duration, self.amplitude, self.EOV, self.Perclos, self.non_blink_EAR]
        return temp

    '''计算5维的blink特征'''
    def cal_feature(self,EAR,begin_b,bottom_b,end_b,EAR_threshold,duration_all,blinkFrameCount = 0):
        '''
        :param EAR: 眼睛闭合百分比序列
        :param begin_b: 开始闭眼帧数
        :param bottom_b: 闭眼时EAR最小的帧数
        :param end_b: 结束闭眼帧数
        :param EAR_threshold: EAR阈值
        :param duration_all: 当前总帧数
        :param blinkFrameCount: 当前眨眼总帧数
        :return:
        '''

        '''眨眼时间（帧数）'''
        self.duration = end_b - begin_b + 1
        #更新duration_all
        # duration_all += self.duration

        '''眨眼振幅'''
        self.amplitude = (EAR[begin_b] - 2 * EAR[bottom_b] + EAR[end_b]) / 2

        '''眼睛睁开速度'''
        self.EOV = (EAR[end_b] - EAR[bottom_b]) / (end_b - bottom_b)

        '''眨眼时间百分比(该滑动窗口后再计算)'''
        # self.Perclos = duration_all / len(EAR)
        self.Perclos = blinkFrameCount / duration_all

        '''睁眼状态下平均EAR'''
        EAR_arr = np.array(EAR)
        self.non_blink_EAR = np.mean(EAR_arr[EAR_arr > EAR_threshold])