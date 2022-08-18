'''诊断表每一行对象'''
class Diagnosis_Column():

    def __init__(self,kss_map):

        self.detect_map = {"e1" : False, "e2" : False, "e3" : False, #眨眼检测结果表
                        "h1" : False, "h2" : False, "h3" : False, "h4" : False,  #头部姿态检测结果表
                        "m1" : False, "m2" : False,   #嘴巴检测结果表
                        "b1" : False, "b2" : False, "b3" : False}  #眉毛检测结果表

        self.kss_map = kss_map

    def set_detect_map(self,eye_detect = None,head_detect = None,mouth_detect = None,brow_detect = None, brow_raise_detect = None):
        '''
        将检测状态写入detect_map
        :param eye_detect  眨眼检测状态
        :param head_detect 头部检测状态
        :param mouth_detect  嘴巴检测状态
        :param brow_detect  皱眉检测状态
        '''
        if (eye_detect != None):
            #正在眨眼时：分为快眨眼，正常眨眼和慢眨眼
            if(eye_detect == 3 or eye_detect == 1): #开始blink时eye_detect = 1, 或者eye_detect = 2时，perclos属于一个范围内则为快眨眼
                self.detect_map['e1'] = True
            elif (eye_detect == 4):  # 正常眨眼
                self.detect_map['e3'] = True
            elif (eye_detect == 5):  # 慢眨眼
                self.detect_map['e2'] = True

        if(brow_detect != None and brow_detect != 0): self.detect_map['b2'] = True
        if(brow_raise_detect != None):
            if(brow_raise_detect == 1):
                self.detect_map['b1'] = True
            elif(brow_detect == 0):  #未检测到皱眉
                self.detect_map['b3'] = True

        if(mouth_detect != None):
            if(mouth_detect == 1):
                self.detect_map['m1'] = True
            else:
                self.detect_map['m2'] = True

        if(head_detect != None):
            rotate,shift = head_detect
            if(rotate == 0): self.detect_map['h4'] = True
            elif(rotate == 1): self.detect_map['h1'] = True
            elif (rotate == 2): self.detect_map['h3'] = True

            if(shift == 3): self.detect_map['h2'] = True

    def get_detect_KSS(self):
        '''
        根据每个检测状态对应的KSS，写入序列中，并返回最大KSS值
        :return  max(KSS)
        '''
        kss_list = []
        keys = self.detect_map.keys()
        for key in keys:
            if(self.detect_map[key] == True):
                kss_list.append(self.kss_map[key])

        return max(kss_list)