import numpy as np
'''评估疲劳推理模型的疲劳检测效果'''


'''修改RLDD视频标签为指定疲劳类别'''
def vtitle_2_cls(cls):
    if(cls == 0): return 0
    elif(cls == 5): return 1
    elif(cls == 10): return 2

class Fatigue_Validate_Table:

    def __init__(self):
        self.VA = 0   #疲劳检测准确率
        self.VRE = 0   #视频疲劳检测准确率（基于short term slide）
        self.VRE_long = 0   #视频疲劳检测准确率（基于long term slide）
        self.videoCount = 0  #视频个数

        self.total_kss_in_TW = 0  #每个视频中输出的KSS值的和
        self.timeWindow_count = 0  #每个视频中短时间窗口个数

        #用来绘制混淆矩阵
        self.confuse_Matrix = [[0,0,0],[0,0,0],[0,0,0]] #行表示real，列表示predict

    '''更新检测指标VA'''
    def update_VA(self,pred_cls,real_cls):
        '''
        :param pred_cls: 预测疲劳类别
        :param real_cls: 真实疲劳类别
        :return:
        '''
        self.videoCount += 1

        #更新混淆矩阵
        self.confuse_Matrix[int(real_cls)][int(pred_cls)] += 1

        if(pred_cls == real_cls):
            self.VA += 1

    '''根据短滑动时间窗口的个数更新检测指标VRE'''
    def update_VRE(self, pred_kss=None, pred_cls=None, real_cls=None, real_kss_range=None):
        '''
        :param pred_kss: 预测的kss值
        :param pred_cls: 预测疲劳类别
        :param real_cls: 真实疲劳类别
        :param real_kss_range: 真实KSS值范围，比如标签为0，则KSS值范围为[0,5]
        :return:
        '''
        if(pred_kss != None):
            self.timeWindow_count += 1
            self.total_kss_in_TW += pred_kss

        if(pred_cls != None and real_cls != None and real_kss_range != None):  #平均化当前视频输出的KSS值，计算真实KSS值之间的误差
            #如果疲劳类别预测不准确，则计算回归误差
            if(pred_cls != real_cls):
                low,up = real_kss_range[0],real_kss_range[1]
                mean_pred_kss = self.total_kss_in_TW / self.timeWindow_count
                real_kss = low if abs(low - mean_pred_kss) < abs(up - mean_pred_kss) else up
                dist = (mean_pred_kss - real_kss) ** 2
                self.VRE += dist

                #计算当前视频的kss时间窗口长度和时间窗口个数
                self.total_kss_in_TW = 0
                self.timeWindow_count = 0

    '''平均化检测指标VA，VRE'''
    def cal_validate_indices(self):
        self.VA = self.VA / self.videoCount
        self.VRE = self.VRE / self.videoCount
        return self.VA,self.VRE

    '''打印混淆矩阵'''
    def confuse_matrix_logger(self):
        res_str = "confuse_Matrix:\n"
        res_str += f"    0, 1, 2 \n"  # 预测类别
        for row in range(len(self.confuse_Matrix)):
            res_str += f"{row}: "
            res_str += str(self.confuse_Matrix[row]) + "\n"
        return res_str

if __name__ == '__main__':

    a = np.array([1, 2, 3, 4, 5, 6, 7])
    # print(a >= 3 and a <= 6)
    # ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()
    print(f"a >= 3 : {a >= 3}")
    print(f"a <= 6 : {a <= 6}")
    print(f"a >= 3 and a <= 6: {(a >= 3) * (a <= 6)}")
    print(f"range = {(a >= 3) * (a <= 6) * a}")