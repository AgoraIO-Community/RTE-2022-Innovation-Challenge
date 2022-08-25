import pandas as pd
import datetime
import copy
from face_utils.fatigue_detector.causalModel.diagnosis_column import Diagnosis_Column
from face_utils.fatigue_detector.causalModel.diagnosis_analysis import Diagnosis_Analysis
from face_utils.fatigue_detector.causalModel.utils.strategy_load import Fati_strategy_parser
from face_utils.fatigue_detector.causalModel.utils.behavior_plot import behaviors_linePlot,df_preprocess
import matplotlib.pyplot as plt
from face_utils.fatigue_detector.causalModel.knn.fatigue_evaluate_withKNNs import Fatigue_KNNs

'''因果推理模型'''
class CausalInferModel_real():

    def __init__(self,filePath = "./config/fatigue_strategies.txt",avg_fps = 8):
        '''
        :param filePath: 疲劳检测算法配置文件路径
        :param avg_fps: 实时检测下平均FPS
        '''
        # 每个疲劳编码类别的先验KSS值
        # 眨眼检测状态（快眨眼: KSS=8, 慢眨眼: KSS=9, 正常: KSS=4）
        # self.e1, self.e2, self.e3 = False, False, False
        # 头部检测状态（点头: KSS=9，前后倾: KSS=6，正常旋转运动：KSS=4，静止：KSS=5
        # self.h1, self.h2, self.h3, self.h4 = False, False, False, False
        # 嘴巴检测状态（张大嘴：KSS=5,正常：KSS=4）
        # self.m1, self.m2 = False,False
        # 眉毛检测状态（提眉：KSS=6，皱眉：KSS=5， 正常：KSS=4）
        # self.b1, self.b2, self.b3 = False,False,False
        #
        # 疲劳编码先验kss值
        # self.kss_map = {"e1": 4, "e2": 9, "e3": 5, "e4": 5,  # 眨眼KSS映射字典
        #                 "h1": 8, "h2": 6, "h3": 4, "h4": 5,  # 头部姿态KSS映射字典
        #                 "m1": 7, "m2": 4,  # 嘴巴KSS映射字典
        #                 "b1": 5, "b2": 6, "b3": 4}  # 眉毛KSS映射字典
        # 为不同疲劳编码检测次数赋予不同权重
        # self.count_weight_map = {
        #     "e1": 1, "e2": 5, "e3": 1, "e4": 1,  # 眨眼KSS映射字典
        #     "h1": 5, "h2": 2, "h3": 1, "h4": 1,  # 头部姿态KSS映射字典
        #     "m1": 5, "m2": 1,  # 嘴巴KSS映射字典
        #     "b1": 1, "b2": 2, "b3": 1  # 眉毛KSS映射字典
        # }

        #疲劳编码先验kss值
        self.kss_map = None
        # 为不同疲劳编码检测次数赋予不同权重
        self.count_weight_map = None

        self.diagnosis_column = Diagnosis_Column(self.kss_map)   #诊断明细
        # 诊断表格
        self.diagnosis_table = pd.DataFrame({
                "date" : [],
                "e1" : [], "e2" : [], "e3" : [], #眨眼Series
                "h1" : [], "h2" : [], "h3" : [], "h4" : [],  #头部姿态Series
                "m1" : [], "m2" : [],  #嘴巴姿态Series
                "b1" : [], "b2" : [], "b3" : [],   #眉毛姿态Series
                "kss" : []
            }
        )

        parser = Fati_strategy_parser()
        parser.FPS = avg_fps
        cfg = parser.get_fatigue_strategies(filePath=filePath)

        self.SHORT_TIME_WINDOW_LENGTH = cfg["SHORT_TIME_WINDOW_LENGTH"]   #短时间窗口长度：短时间窗口用于分析后期疲劳特征
        self.LONG_TIME_WINDOW_LENGTH = cfg["LONG_TIME_WINDOW_LENGTH"]   #长时间窗口长度：长时间窗口用于分析早期疲劳特征
        self.singleton_list = cfg["singleton"]  #经过文件解析的单个疲劳检测编码，比如 [b1,b2,e2,e3,m1,h1,h2]
        self.mutual_list = cfg["mutual"]  #经过文件解析的多个疲劳检测编码组合， 比如 [h1,e2],[e3,b2]
        self.active_list = cfg["activate"]  #经过文件解析的关于多个疲劳检测编码组合的激活和抑制，比如[[[e3,b2],[b1],+],[[e3,b2],[b3],-]]

        # 根据配置文件装配先验kss表,和检测权重表
        self.kss_map = parser.kss_map
        self.count_weight_map = parser.count_weight_map
        self.diagnosis_analysis = Diagnosis_Analysis(self.kss_map, self.count_weight_map)  # 疲劳分析类

        # 附加属性
        self.perclos = 0  #
        self.kss_seq = [] # 保存每一帧计算的KSS值
        # self.fatigue2_ratio = cfg["fatigue2_ratio"]  # 早期疲劳统计次数占比
        # self.fatigue3_ratio = cfg["fatigue3_ratio"]  # 后期疲劳统计次数占比
        self.short_term_slide = []  #后期疲劳检测kss时间窗口
        self.long_term_slide = []  #早期疲劳检测kss时间窗口
        self.fatigue_KNNs = Fatigue_KNNs()  #疲劳检测KNNs

    def set_diagnosis_column(self,eye_detect = None,head_detect = None,mouth_detect = None,brow_detect = None, brow_raise_detect = None):
        '''
        修改diagnosis_column中的detect_map
        :param eye_detect:
        :param head_detect:
        :param mouth_detect:
        :param brow_detect:
        :param brow_raise_detect:
        :return:
        '''
        self.diagnosis_column.set_detect_map(eye_detect, head_detect, mouth_detect,brow_detect, brow_raise_detect)

    '''获取 两个日期的时间差（秒数）'''
    def get_date_secDiff(self,startTime,endTime):
        '''
        :param startTime: "%Y-%m-%d %H:%M:%S"格式的日期字符串
        :param endTime:  "%Y-%m-%d %H:%M:%S"格式的日期字符串
        :return: 两个日期的时间差（秒数）
        '''
        startTime1 = datetime.datetime.strptime(startTime,"%Y-%m-%d %H:%M:%S")
        endTime1 = datetime.datetime.strptime(endTime,"%Y-%m-%d %H:%M:%S")

        seconds = (endTime1 - startTime1).total_seconds()
        return seconds

    '''功过RLDD训练好的短时KNN和长时KNN进行疲劳估计'''
    def get_fatigue_state_with_RLDDKNNs(self,short_term_slide,long_term_slide,fatigue_range = [0,5,7,9]):
        '''
        :param short_term_slide: 未进行类别统计,未归一化的short_term kss_seq
        :param long_term_slide: 未进行类别统计，未归一化的long_term kss_seq
        :param fatigue_range: 疲劳划分区间
        :return:
        '''
        #短时间窗口填满之后再进行疲劳判断
        if(len(self.short_term_slide) == self.SHORT_TIME_WINDOW_LENGTH):
            short_kss_buckets = {"0": 1, "1": 0, "2": 0}
            long_kss_buckets = {"0": 1, "1": 0, "2": 0}

            #将short_term_slide转换成long_kss_buckets
            for kss in short_term_slide:
                if (kss >= fatigue_range[0] and kss < fatigue_range[1]):  # 警觉
                    short_kss_buckets["0"] += 1
                elif (kss >= fatigue_range[1] and kss < fatigue_range[2]):  # 早期疲劳
                    short_kss_buckets["1"] += 1
                else:  # 后期疲劳
                    short_kss_buckets["2"] += 1

            # 将long_term_slide转换成short_kss_buckets
            for kss in long_term_slide:
                if (kss >= fatigue_range[0] and kss < fatigue_range[1]):  # 警觉
                    long_kss_buckets["0"] += 1
                elif (kss >= fatigue_range[1] and kss < fatigue_range[2]):  # 早期疲劳
                    long_kss_buckets["1"] += 1
                else:  # 后期疲劳
                    long_kss_buckets["2"] += 1

            #归一化short_kss_buckets，long_kss_buckets
            short_term_sum = short_kss_buckets["0"] + short_kss_buckets["1"] + short_kss_buckets["2"]
            short_kss_buckets["0"] /= short_term_sum
            short_kss_buckets["1"] /= short_term_sum
            short_kss_buckets["2"] /= short_term_sum
            long_term_sum = long_kss_buckets["0"] + long_kss_buckets["1"] + long_kss_buckets["2"]
            long_kss_buckets["0"] /= long_term_sum
            long_kss_buckets["1"] /= long_term_sum
            long_kss_buckets["2"] /= long_term_sum

            fatigue_state = self.fatigue_KNNs.get_fatigue_state(list(short_kss_buckets.values()),list(long_kss_buckets.values()))
            return fatigue_state[0]
        return 0  #非疲劳状态

    '''疲劳推理'''
    def fatigue_Infer(self):

        # 写入到诊断表diagnosis_table中
        dateStr = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if (len(self.diagnosis_table) > 0):
            endTime_str = self.diagnosis_table['date'][len(self.diagnosis_table) - 1]
            # 如果当前时间 - 诊断表最晚登记时间 >= 5min，则重新创建诊断表
            if (self.get_date_secDiff(endTime_str, dateStr) >= 300):
                self.diagnosis_table = pd.DataFrame({
                    "date": [],
                    "e1": [], "e2": [], "e3": [],# 眨眼Series
                    "h1": [], "h2": [], "h3": [], "h4": [],  # 头部姿态Series
                    "m1": [], "m2": [],  # 嘴巴姿态Series
                    "b1": [], "b2": [], "b3": [],  # 眉毛姿态Series
                    "kss": []
                }
                )
        self.diagnosis_column.detect_map['date'] = dateStr
        self.diagnosis_table.loc[len(self.diagnosis_table)] = copy.deepcopy(
            self.diagnosis_column.detect_map)  # 深拷贝，因为后面会清空diagnosis_column

        # temp_df = self.diagnosis_table[self.diagnosis_table == 1].dropna(axis=1, how="all")  # 丢弃全为缺失值的那些列

        #获取时间窗口内的diagnosis_table
        kss_max = 4
        kss_short_term = 0
        kss_long_term = 0
        '''后期疲劳检测（短时间窗口）'''
        if (len(self.diagnosis_table) >= self.SHORT_TIME_WINDOW_LENGTH):  # 诊断表有SHORT_TIME_WINDOW_LENGTH帧后，才可以进行后期疲劳判断
            temp_df = self.diagnosis_table.loc[len(self.diagnosis_table) - self.SHORT_TIME_WINDOW_LENGTH:]
            #根据疲劳推理模型的配置文件 和 诊断表，利用三个算子计算kss值
            kss_short_term = self.diagnosis_analysis.get_kss_from_short_diagnosis_table(temp_df,self.singleton_list,self.active_list)
        else:
            self.diagnosis_analysis.set_count_map(self.diagnosis_table)  #diagnosis的count_map实现自增

        '''早期疲劳检测（长时间窗口）'''
        if(len(self.diagnosis_table) >= self.LONG_TIME_WINDOW_LENGTH):  # 诊断表有Long_TIME_WINDOW_LENGTH帧后，才可以进行早期疲劳判断
            temp_df = self.diagnosis_table.loc[len(self.diagnosis_table) - self.LONG_TIME_WINDOW_LENGTH:]
            kss_long_term = self.diagnosis_analysis.get_kss_from_long_diagnosis_table(temp_df, self.mutual_list, self.active_list)
        else:
            self.diagnosis_analysis.set_long_count_map(self.diagnosis_table)  # diagnosis的long_count_map实现自增

        '''使用KNN模型进行实时推理'''
        if(len(self.short_term_slide) >= self.SHORT_TIME_WINDOW_LENGTH):
            del self.short_term_slide[0]
        if(len(self.long_term_slide) >= self.LONG_TIME_WINDOW_LENGTH):
            del self.long_term_slide[0]

        if(kss_short_term != 0):
            self.short_term_slide.append(kss_short_term)
        else:
            self.short_term_slide.append(kss_max)
        if(kss_long_term != 0):
            self.long_term_slide.append(kss_long_term)
        else:
            self.long_term_slide.append(kss_max)

        fatigue_state = self.get_fatigue_state_with_RLDDKNNs(self.short_term_slide,self.long_term_slide)

        if(kss_long_term != 0 and kss_short_term != 0):
            kss_max = max(kss_short_term, kss_long_term)
        elif(kss_short_term != 0):
            kss_max = kss_short_term

        # '''根据kss_max, 给出建议'''
        # if (kss_max > 5 and kss_max <= 6):
        #     state = "early fatigue1"
        #     suggest = "起来活动活动"
        # elif (kss_max > 6 and kss_max <= 7):
        #     state = "early fatigue2"
        #     suggest = "多喝水，注意休息"
        # elif (kss_max > 7):
        #     state = "later fatigue"
        #     suggest = "请停下手头工作，注意休息"
        # else:
        #     state = "状态良好"
        #     suggest = "今天又是充满希望的一天"

        '''根据fatigue_state, 给出建议'''
        if (fatigue_state == 1):
            state = "early fatigue1"
            suggest = "起来活动活动"
        elif (fatigue_state == 2):
            state = "later fatigue"
            suggest = "请停下手头工作，注意休息"
        else:
            state = "状态良好"
            suggest = "今天又是充满希望的一天"

        self.kss_seq.append(kss_max)
        # print(f"count_map = {self.diagnosis_analysis.count_map}")
        # self.diagnosis_column.detect_map['kss'] = round(kss_max,4)
        self.diagnosis_column = Diagnosis_Column(self.kss_map)  # 清空self.diagnosis_column
        return state, suggest, kss_max,fatigue_state

    #kss曲线绘制
    def kss_plot(self,savePath):

        plt.figure(figsize=(6,4))

        #绘制KSS折线图
        x = [i for i in range(len(self.kss_seq))]
        plt.plot(x,self.kss_seq)

        plt.xlabel("frame count",fontsize=16)  #x坐标
        plt.ylabel("KSS",fontsize=16)  #y坐标
        # plt.show()
        plt.savefig(savePath)

    '''行为检测曲线绘制'''
    def behavior_plot(self,savePath):
        df = self.diagnosis_table
        behaviors_linePlot(df,savePath)

    '''保存behavior行为和kss的时间序列'''
    def behavior_seqs_save(self,kss_savePath):
        x, y_dict = df_preprocess(self.diagnosis_table)
        columns = y_dict.keys()
        with open(kss_savePath,"w") as file:
            #字段名
            for column in columns:
                file.write(f"{column},")
            file.write("kss\n")

            for index,kss in enumerate(self.kss_seq):
                line_str = ""
                #行为报表数据写入，如果该值可以被2整除，则标记为1
                for column in columns:
                    if(y_dict[column][index] % 2 == 0):
                        line_str += str(0) + ","
                    else:
                        line_str += str(1) + ","
                #写入kss值
                line_str += str(round(kss,6)) + "\n"
                file.write(line_str)
        file.close()

'''获取KSS_seq中警觉状态下的ratio'''
def get_alertRatio_from_KSSSeq(kss_seq):
    '''
    :param kss_seq: type = ndarray
    :return:
    '''
    alert_seq = [kss for kss in (kss_seq < 5) if kss == True]
    ratio = 0
    if (len(kss_seq) != 0):
        ratio = len(alert_seq) / len(kss_seq)
    return ratio

'''获取KSS_seq中欠警觉状态下的ratio'''
def get_fatigue2Ratio_from_KSSSeq(kss_seq):
    '''
    :param kss_seq: type = ndarray
    :return:
    '''
    temp_seq = (kss_seq >= 5) * (kss_seq <= 7)  #两集合取交集
    fatigue1_seq = [kss for kss in temp_seq if kss == True]
    ratio = 0
    if(len(kss_seq) != 0):
        ratio = len(fatigue1_seq) / len(kss_seq)
    return ratio

'''获取KSS_seq中疲劳状态下的ratio'''
def get_fatigue3Ratio_from_KSSSeq(kss_seq):
    '''
    :param kss_seq: type = ndarray
    :return:
    '''
    fatigue2_seq = [kss for kss in ((kss_seq > 7)) if kss == True]
    ratio = len(fatigue2_seq) / len(kss_seq)
    return ratio

'''KSS值离散化成疲劳类别'''
def KSS_2_fatigueCls(KSS):
    '''
    :param KSS: 模型输出的KSS值
    :return: 0表示警觉，1表示欠警觉，2表示嗜睡
    '''
    if KSS > 0 and KSS < 5:
        return 0
    elif KSS >= 5 and KSS <= 7:
        return 1
    else:
        return 2