import sys
import os
from pathlib import Path
curPath = os.path.abspath(os.path.dirname(__file__))

import unittest
import pandas as pd
from joblib import dump, load
from face_utils.fatigue_detector.causalModel.kss_statistic_and_classifier import normalization_byRow
import numpy as np


'''使用RLDD训练的KNNs进行疲劳状态的推理'''
class Fatigue_KNNs():
    def __init__(self):
        path = "face_utils/fatigue_detector/causalModel/knn"  #打包时用项目路径
        RLDD_short_term_buckets_path = path + "/short_term_kss_buckets.txt"
        RLDD_long_term_buckets_path = path + "/long_tem_kss_buckets.txt"
        short_term_model_path =  path + "/KNN_short.joblib"
        long_term_model_path = path + "/KNN_long.joblib"

        # RLDD_short_term_buckets_path = curPath + "/short_term_kss_buckets.txt"
        # RLDD_long_term_buckets_path = curPath + "/long_tem_kss_buckets.txt"
        # short_term_model_path = curPath + "/KNN_short.joblib"
        # long_term_model_path = curPath + "/KNN_long.joblib"

        RLDD_short_df = pd.read_csv(RLDD_short_term_buckets_path)
        RLDD_long_df = pd.read_csv(RLDD_long_term_buckets_path)
        #加载模型
        self.short_term_model = load(short_term_model_path)  # OneVsRestClassifier模型
        self.long_term_model = load(long_term_model_path)

        '''按行标准化(得到[0,1])'''
        RLDD_short_df = normalization_byRow(RLDD_short_df)
        RLDD_long_df = normalization_byRow(RLDD_long_df)

        '''使用RLDD数据集进行模型训练'''
        X_short, X_long, Y = [], [], []
        for index in RLDD_short_df.index:
            short_temp = [RLDD_short_df.loc[index]["0"], RLDD_short_df.loc[index]["1"], RLDD_short_df.loc[index]["2"]]
            long_temp = [RLDD_long_df.loc[index]["0"], RLDD_long_df.loc[index]["1"], RLDD_long_df.loc[index]["2"]]
            X_short.append(short_temp)
            X_long.append(long_temp)
            Y.append([RLDD_short_df.loc[index]["kss"]])
        X_short = np.array(X_short)
        X_long = np.array(X_long)
        Y = np.array(Y)
        X_short_train, X_long_train, y_train = X_short, X_long, Y

        # 在推理阶段也是如此，只不过预测的样本不再是X_short_train，X_long_train
        self.short_term_model.fit(X_short_train, y_train)  # 预测类别为0,1,2
        self.long_term_model.fit(X_long_train, y_train)  # 预测类别为0,1,2

    def get_fatigue_state(self,short_term_slide,long_term_slide):
        '''
        :param short_term_slide: 按类别统计并归一化的short_term kss_seq，type=list
        :param long_term_slide: 按类别统计并归一化的long_term kss_seq，type=list
        :return:
        '''
        pred = self.short_term_model.predict([short_term_slide])
        #如果检测结果为非疲劳，则继续使用long_term_model进行检测，否则输出判别结果
        if(pred == 0):
            pred = self.long_term_model.predict([long_term_slide])
        return pred

class MyTest(unittest.TestCase):
    def test_fatigue_detect_byKNNs(self):
        short_term_slide = [0.58,0.32,0.1]
        long_term_slide = [0.48,0.32,0.2]
        fatigue_KNNs = Fatigue_KNNs()
        fatigue_state = fatigue_KNNs.get_fatigue_state(short_term_slide,long_term_slide)
        print(fatigue_state)
