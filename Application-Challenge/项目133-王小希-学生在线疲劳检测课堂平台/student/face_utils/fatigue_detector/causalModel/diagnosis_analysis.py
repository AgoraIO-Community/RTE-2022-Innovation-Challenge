from face_utils.fatigue_detector.causalModel.fatigue_operator import Fatigue_Operator
import numpy as np
from copy import deepcopy

kss_cls = [["e1", "e2", "e3"],
            ["h1", "h2", "h3", "h4"],
            ["m1", "m2"],
            ["b1", "b2", "b3"]
           ]  #疲劳检测类别（按类别进行归一化）

'''根据给定的时间窗口长度，对诊断表进行分析，生成kss池，返回kss值，用于当前帧的疲劳分析'''
class Diagnosis_Analysis():

    def __init__(self,kss_map,count_weight_map):
        self.kss_map = kss_map   #kss
        self.fatigue_operator = Fatigue_Operator()  # 疲劳检测算子
        self.count_weight_map = count_weight_map  # 为不同疲劳编码检测次数赋予不同权重

        '''短时间窗口'''
        self.count_map =  {"e1": 0, "e2": 0, "e3": 0,  # 眨眼KSS映射字典
                           "h1": 0, "h2": 0, "h3": 0, "h4": 0,  # 头部姿态KSS映射字典
                           "m1": 0, "m2": 0,  # 嘴巴KSS映射字典
                           "b1": 0, "b2": 0, "b3": 0}

        self.preFrame_count_map = {"e1": 0, "e2": 0, "e3": 0,  # 眨眼KSS映射字典
                           "h1": 0, "h2": 0, "h3": 0, "h4": 0,  # 头部姿态KSS映射字典
                           "m1": 0, "m2": 0,  # 嘴巴KSS映射字典
                           "b1": 0, "b2": 0, "b3": 0}  #前一帧的各编码次数

        '''长时间窗口'''
        self.long_count_map = {"e1": 0, "e2": 0, "e3": 0,  # 眨眼KSS映射字典
                          "h1": 0, "h2": 0, "h3": 0, "h4": 0,  # 头部姿态KSS映射字典
                          "m1": 0, "m2": 0,  # 嘴巴KSS映射字典
                          "b1": 0, "b2": 0, "b3": 0}

        self.preFrame_long_count_map = {"e1": 0, "e2": 0, "e3": 0,  # 眨眼KSS映射字典
                                   "h1": 0, "h2": 0, "h3": 0, "h4": 0,  # 头部姿态KSS映射字典
                                   "m1": 0, "m2": 0,  # 嘴巴KSS映射字典
                                   "b1": 0, "b2": 0, "b3": 0}  # 前一帧的各编码次数

    '''当短时窗口<时间窗口长度时，进行累加操作'''
    def set_count_map(self,table):
        '''
        :param table: 小于时间窗口长度的诊断表格
        '''
        diagnosis_table = table  # len(诊断表)=时间窗口的长度
        '''每次只读最后一行，进行疲劳编码统计次数自增'''
        index = diagnosis_table.index[len(diagnosis_table) - 1]
        for key in self.count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.count_map[key] += 1

    '''当短时窗口<时间窗口长度时，进行累加操作'''
    def set_long_count_map(self, table):
        '''
        :param table: 小于时间窗口长度的诊断表格
        '''
        diagnosis_table = table  # len(诊断表)=时间窗口的长度
        '''每次只读最后一行，进行疲劳编码统计次数自增'''
        index = diagnosis_table.index[len(diagnosis_table) - 1]
        for key in self.long_count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.long_count_map[key] += 1

    '''根据短时间窗口进行后期疲劳检测'''
    def get_kss_from_short_diagnosis_table(self,table, singleton_list, active_list):
        '''
        :param table: 为时间窗口长度的诊断表格
        :param singleton_list: #经过文件解析的单个疲劳检测编码，比如 [b1,b2,e2,e3,m1,h1,h2]
        :param active_list: #经过文件解析的关于多个疲劳检测编码组合的激活和抑制，比如[[+,b1],[-,b3]]
        :return:
        '''
        diagnosis_table = table  # len(诊断表)=时间窗口的长度
        singleton_list = deepcopy(singleton_list)   #深拷贝singleton_list
        active_list = deepcopy(active_list)  #深拷贝active_list

        '''softmax归一化kss值(放大kss值大的概率)'''
        kss_norm_map = softmax_by_fatigueCls(kss_cls, self.kss_map)

        '''每个类别进行频数统计'''
        #加最后一行
        index = diagnosis_table.index[len(diagnosis_table) - 1]   #获取表格索引：索引值是一个int64Index对象，dataframe在生成表格时自动生成的
        for key in self.count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.count_map[key] += 1

        #减上一帧表格的首行
        for key in self.count_map.keys():
            self.count_map[key] -= self.preFrame_count_map[key]

        #将该帧表格的首行赋给preFrame_count_map
        index = diagnosis_table.index[0]
        for key in self.preFrame_count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.preFrame_count_map[key] = 1  #置1
            else:
                self.preFrame_count_map[key] = 0  #清0

        '''softmax归一化count_map'''
        # 先对count_map进行预处理（增大疲劳检测迹象的权重）
        count_temp_map = deepcopy(self.count_map)
        count_map_preprocess(count_temp_map,self.count_weight_map)
        count_norm_map = softmax_by_fatigueCls(kss_cls, count_temp_map)
        # print(count_norm_map)
        # print(count_temp_map)

        '''检测singleton_list中的编码是否为0，如果为0，则剔除'''
        for singleton in deepcopy(singleton_list):
            if(count_temp_map[singleton] == 0):  #如果要进行计算的疲劳编码的统计次数为0，则不计算kss值
                singleton_list.remove(singleton)

        '''根据疲劳检测策略和已检测的疲劳迹象，运用singleton，activate算子得到kss池'''
        #singleton算子
        singleton_kss_cal_dict = dict()
        singleton_kss_cal_dict = cal_singleton_list(self.fatigue_operator,singleton_list,singleton_kss_cal_dict,self.kss_map,kss_norm_map,count_norm_map,alpha=1.5)  #singleton算子
        #activate算子
        singleton_active_list = deepcopy(list(singleton_kss_cal_dict.values()))  # 先计算共同影响，再进行激活
        activate_kss_list = []
        for activate in deepcopy(active_list):
            operate = activate[0]
            active_code = activate[1]  #激活编码
            if (operate == '+' and count_temp_map[active_code] != 0):  # 激活singleton算子计算的KSS值（激活编码统计个数不为0）
                cal_activate_list(self.fatigue_operator, singleton_active_list, active_code, activate_kss_list, kss_norm_map, count_norm_map, gamma=1.5)

        '''kss_pool汇总'''
        kss_pool = []
        kss_pool.extend(list(singleton_kss_cal_dict.values()))
        kss_pool.extend(activate_kss_list)
        kss_max = 4
        if(len(kss_pool) > 0):
            kss_max = self.fatigue_operator.get_final_kss(kss_pool)

        return kss_max  # 通过诊断表分析，计算得到kss值
        # 获取kss池中的kss值，写入到diagnosis_table的kss字段中，用于后期kss的绘制

    '''根据长时间窗口进行长期疲劳检测'''
    def get_kss_from_long_diagnosis_table(self, table, mutual_list, active_list):
        '''
        :param table: 为时间窗口长度的诊断表格
        :param singleton_list: #经过文件解析的单个疲劳检测编码，比如 [b1,b2,e2,e3,m1,h1,h2]
        :param mutual_list: #经过文件解析的多个疲劳检测编码组合， 比如 [[h1,e2],[e3,b2]]
        :param active_list: #经过文件解析的关于多个疲劳检测编码组合的激活和抑制，比如[[[e3,b2],[b1],+],[[e3,b2],[b3],-]]
        :return:
        '''
        diagnosis_table = table  # len(诊断表)=时间窗口的长度
        mutual_list = deepcopy(mutual_list)  # 深拷贝mutual_list
        active_list = deepcopy(active_list)  # 深拷贝active_list

        '''softmax归一化kss值(放大kss值大的概率)'''
        kss_norm_map = softmax_by_fatigueCls(kss_cls, self.kss_map)

        '''每个类别进行频数统计'''
        # 加最后一行
        index = diagnosis_table.index[len(diagnosis_table) - 1]  # 获取表格索引：索引值是一个int64Index对象，dataframe在生成表格时自动生成的
        for key in self.long_count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.long_count_map[key] += 1

        # 减上一帧表格的首行
        for key in self.long_count_map.keys():
            self.long_count_map[key] -= self.preFrame_long_count_map[key]

        # 将该帧表格的首行赋给preFrame_count_map
        index = diagnosis_table.index[0]
        for key in self.preFrame_long_count_map.keys():
            if (diagnosis_table.loc[index][key] != 0):
                self.preFrame_long_count_map[key] = 1  # 置1
            else:
                self.preFrame_long_count_map[key] = 0  # 清0

        '''softmax归一化count_map'''
        # 先对count_map进行预处理（增大疲劳检测迹象的权重）
        count_temp_map = deepcopy(self.count_map)
        count_map_preprocess(count_temp_map, self.count_weight_map)
        count_norm_map = softmax_by_fatigueCls(kss_cls, count_temp_map)
        # print(count_norm_map)
        # print(count_temp_map)

        '''检测mutual_list中的编码是否为0，如果为0，则剔除'''
        for mutual in deepcopy(mutual_list):
            for singleton in mutual:  # 如果要进行计算的疲劳编码的统计次数为0，则不计算kss值
                if (count_temp_map[singleton] == 0):
                    mutual_list.remove(mutual)
                    break

        '''根据疲劳检测策略和已检测的疲劳迹象，运用mutual, inhibit算子得到kss池（需要显示表明哪个算子被激活了）'''
        #mutual算子
        mutual_kss_list = []
        mutual_kss_list = cal_mutual_list(self.fatigue_operator, mutual_list, mutual_kss_list, self.kss_map,
                                          kss_norm_map, count_norm_map, alpha=1.5)  # mutual算子
        # inhibit算子
        activate_kss_list = []
        for activate in deepcopy(active_list):
            operate = activate[0]
            inhibit_code = activate[1]  # 激活编码
            if (operate == '-' and count_temp_map[inhibit_code] != 0):  # 抑制mutual算子计算的KSS值（激活编码统计个数不为0）
                cal_activate_list(self.fatigue_operator, mutual_kss_list, inhibit_code, activate_kss_list, kss_norm_map, count_norm_map, gamma=-1.5)

        '''kss_pool汇总'''
        kss_pool = []
        kss_pool.extend(mutual_kss_list)
        kss_pool.extend(activate_kss_list)
        kss_max = 4
        if (len(kss_pool) > 0):
            kss_max = self.fatigue_operator.get_final_kss(kss_pool)

        return kss_max  # 通过诊断表分析，计算得到kss值

'''####################################################   归一化  ##################################################'''
'''在softmax归一化 count_map 之前先进行预处理'''
def count_map_preprocess(count_map,count_weight_map):
    '''
    :param count_map: 疲劳编码检测次数统计表
    :param count_weight_map: 疲劳编码检测次数权重表
    :return: count_map
    '''
    for keys in kss_cls:
        sum = 0
        for key in keys:
            sum += count_map[key]

        index = 0
        while (sum // 10 != 0):
            sum = sum // 10
            index += 1
        division = np.power(10, index + 1) if index != 0 else 10  # 先对count_map进行缩放到[0,1]区间上，避免接下来softmax放大某个无疲劳迹象的检测概率
        for key in keys:
            count_map[key] = count_map[key] / division
            count_map[key] = count_map[key] * count_weight_map[key]

    return count_map

'''softmax归一化（会放大数值大的概率）'''
def softmax(x_list):
    x_list_ndarray = np.array(x_list)  #转numpy.ndarray，方便使用np常用数学函数
    res = []
    division = np.sum(np.exp(x_list_ndarray))
    for x in x_list:
      res.append(np.exp(x) / division)
    return res

'''根据疲劳类别进行softmax归一化'''
def softmax_by_fatigueCls(kss_clss,map):
    '''
    :param kss_clss: 疲劳类别，type=list[[],[],[]]
    :param map: 要归一化的map，value为疲劳类别编码，value为值
    :return: 归一化后的map  type=dict()
    '''
    norm_map = dict()
    for cls in kss_clss:
        #获取当前疲劳类别的所有编码
        values = []
        for code in cls:
            values.append(map[code])
        norm_values = softmax(values)
        for index,code in enumerate(cls):
            norm_map[code] = norm_values[index]
    return norm_map

'''######################################################### 利用3种算子求解kss值: singleton,mutual,activate/inhibit   ##############################################################'''
'''根据singleton算子计算多个疲劳编码的kss值'''
def cal_singleton_list(fatigue_operator,singleton_list,singleton_kss_cal_dict,kss_map,kss_norm_map,count_norm_map,alpha):
    '''
    :param fatigue_operator 疲劳算子类
    :param singleton_list: 疲劳编码集合 type=list
    :param singleton_kss_cal_dict: 要保存的疲劳编码对应的kss值 key为疲劳编码，value为kss值,type=dict
    :param kss_map  每个疲劳编码对应的kss值
    :param kss_norm_map  每个类别的疲劳编码进行softmax归一化后的kss值
    :param count_norm_map  每个类别的疲劳编码进行softmax归一化后的检测次数
    :return: dict()
    '''
    # print("using singleton operator...")
    '''对每个疲劳编码的KSS值进行计算'''
    for singleton in singleton_list:
        kss_prior = kss_map[singleton]
        count_norm = count_norm_map[singleton]
        kss = fatigue_operator.singleton_operator(count_norm, kss_prior, alpha=alpha)
        singleton_kss_cal_dict[singleton] = kss
    # print(f"singleton_kss_cal_dict = {singleton_kss_cal_dict}")
    return singleton_kss_cal_dict

'''根据mutal算子计算多个疲劳编码组合下的kss值'''
def cal_mutual_list(fatigue_operator,mutual_list,mutual_kss_list,kss_map,kss_norm_map,count_norm_map,alpha):
    '''
    :param fatigue_operator 疲劳算子类
    :param mutual_list: 疲劳编码组合列表 type=list
    :param mutual_kss_list: 用于保存每个疲劳编码组合计算的kss值 type=list
    :param kss_map  每个疲劳编码对应的kss值
    :param kss_norm_map  每个类别的疲劳编码进行softmax归一化后的kss值
    :param count_norm_map  每个类别的疲劳编码进行softmax归一化后的检测次数
    :return:
    '''
    # print("using mutual operator...")
    '''对每个疲劳编码的KSS值进行计算'''
    for mutual in mutual_list:  # 每个疲劳编码组合
        code_KSS_norm_list = []
        code_count_norm_list = []
        KSS_prior_list = []
        for singleton in mutual:
            KSS_prior_list.append(kss_map[singleton])
            code_KSS_norm_list.append(kss_norm_map[singleton])
            code_count_norm_list.append(count_norm_map[singleton])

        kss = fatigue_operator.mutual_operator(code_KSS_norm_list, code_count_norm_list, KSS_prior_list, alpha=alpha)
        mutual_kss_list.append(kss)
    # print(f"mutual_kss_list = {mutual_kss_list}")
    return mutual_kss_list

'''activate算子激活或抑制疲劳编码组合'''
def cal_activate_list(fatigue_operator, base_list, activate_el, activate_kss_list, kss_norm_map, count_norm_map, gamma=0.5):

    '''
    :param fatigue_operator 疲劳算子类
    :param base_list: 如果是activate算子，则base_list表示疲劳编码组合列表（mutual_list）计算的KSS值，如果是inhibit算子，则base_list表示后期疲劳编码（singleton_list） type=list
    :param activate_el: 激活/抑制编码
    :param activate_kss_list: 用于保存每个疲劳编码组合在经过激活计算后得到的kss值 type=list
    :param kss_norm_map  每个类别的疲劳编码进行softmax归一化后的kss值
    :param count_norm_map  每个类别的疲劳编码进行softmax归一化后的检测次数
    :return:
    '''
    # print("using activate operator...")

    '''对每个疲劳编码的KSS值进行计算'''
    for kss in base_list:  # 待激活/抑制的KSS值
        # 为activate_operator算子封装参数
        code_KSS_norm_list = []
        code_count_norm_list = []
        code_KSS_norm_list.append(kss_norm_map[activate_el])
        code_count_norm_list.append(count_norm_map[activate_el])

        # 激活kss值
        kss += fatigue_operator.activate_operator(code_KSS_norm_list, code_count_norm_list, beta=10, gamma=gamma)
        activate_kss_list.append(kss)

    # print(f"activate_kss_list: {activate_kss_list}")  # [9.54963521185864, 6.04612749420625]
    return activate_kss_list

