import math
import numpy as np

class Fatigue_Operator:

    # tanh归一化
    def tanh(self, z):
        res = (1 - math.exp(-2 * z)) / (1 + math.exp(-2 * z))
        return res

    '''关于每个疲劳编码的KSS值的计算算子'''
    def singleton_operator(self, codei_count_norm, codei_KSS, alpha=1.5):
        '''
        f_1  = alpha × KSS_(code_i) × norm(count_(code_i ))
        :param codei_count_norm: 疲劳编码i在滑动时间内检测的次数(已进行归一化处理）
        :param codei_KSS: 疲劳编码i的先验KSS值(先验KSS值)
        :param beta tanh调节因子（codei_KSS_norm * codei_count_norm缩放到定义域区间上）
        :param alpha KSS值缩放因子，将KSS缩放值[1,9]区间上
        :return:
        '''
        # input = beta * (codei_KSS_norm * codei_count_norm)
        # return self.tanh(input) + (codei_KSS * codei_count_norm)
        input = alpha * codei_KSS * codei_count_norm   #原始先验KSS值 * 归一化次数
        return input

    '''多个疲劳编码共同影响的计算算子(当列表中只有一个编码时，退化成singleton_operator)'''

    def mutual_operator(self, code_KSS_norm_list, code_count_norm_list, KSS_list, beta=10, alpha=1.5):
        '''
        f_2  = tanh(β(∑_j[norm(KSS_(code_i)) × norm(count_(code_i )))] ) + alpha × Max_j (KSS_(code_j) × norm(count_(code_i )))
        :param code_KSS_norm_list: 存在共同影响的疲劳编码集合的先验KSS值(已进行归一化处理）
        :param code_count_norm_list: 存在共同影响的疲劳编码集合在滑动时间内分别检测的次数(已进行归一化处理）
        :param code_KSS_list: 存在共同影响的疲劳编码集合的先验KSS值(先验KSS值集合)
        :param beta tanh调节因子 (codei_KSS_norm * codei_count_norm缩放到定义域区间上）
        :param alpha KSS值缩放因子，将KSS缩放值[1,9]区间上
        :return:
        '''
        code_KSS_norm_list = np.array(code_KSS_norm_list)
        code_count_norm_list = np.array(code_count_norm_list)
        input = beta * np.sum(code_KSS_norm_list * code_count_norm_list)
        max_kss = alpha * max(KSS_list * code_count_norm_list)  # 该疲劳组合中最大kss值
        res = self.tanh(input) + max_kss
        return res

    '''多个疲劳编码的激活算子'''
    def activate_operator(self, code_active_KSS_norm_list, code_active_count_norm_list, beta=10, gamma=0.5):
        '''
        f_3  = f_2  + gamma × tanh(β(∑_k [(KSS_(code_k) × count_(code_k))]))， gamma \in [0,1]
        其中多个疲劳编码的组合是人为设置的，比如皱眉和慢眨眼迹象会是疲劳特征的果，又由于此时又检测到提眉，则疲劳特征会升级
        :param code_active_KSS_norm_list: 存在共同影响的疲劳编码集合的先验KSS值(已归一化)
        :param code_active_count_norm_list: 存在共同影响的疲劳编码集合在滑动时间内分别检测的次数(已归一化)
        :param beta tanh调节因子 (codei_KSS_norm * codei_count_norm缩放到定义域区间上）
        :param gamma 激活因子 gamma>0表示激活，gamma<0表示抑制
        :return: 激活的kss增量
        '''
        code_active_KSS_norm_list = np.array(code_active_KSS_norm_list)
        code_active_count_norm_list = np.array(code_active_count_norm_list)
        input = beta * (np.sum(code_active_KSS_norm_list * code_active_count_norm_list))
        return gamma * self.tanh(input)

    '''计算kss_pool中kss上4分位数（取均值太平滑了）'''
    def up_percentile_kss(self,kss_pool,percentage=75):
        kss_quarter = np.percentile(np.array(kss_pool),percentage)
        return kss_quarter

    def down_percentile_kss(self,kss_pool,percentage=25):
        kss_quarter = np.percentile(np.array(kss_pool),percentage)
        return kss_quarter

    '''计算最终的kss值(最大值）'''
    def get_final_kss(self,kss_pool):
        # return min(self.up_percentile_kss(kss_pool),9), max(self.down_percentile_kss(kss_pool),3)
        return max(min(np.max(kss_pool),9),4)  #疲劳检测输出的kss值在[4,9]之间