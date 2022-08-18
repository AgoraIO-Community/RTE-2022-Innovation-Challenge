import unittest
import os
import glob
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.multiclass import OneVsRestClassifier
from util.logger import _get_logger
from sklearn.neighbors import KNeighborsClassifier
from joblib import dump, load
from face_utils.fatigue_detector.causalModel.utils.fatigue_validate_table import Fatigue_Validate_Table
from pathlib import Path
from sklearn.model_selection import KFold
import sklearn.utils._typedefs
import sklearn.neighbors._partition_nodes


'''kss统计与疲劳分类'''
logger = None
fatigue_vtable = Fatigue_Validate_Table()

'''对RLDD数据集警觉、早期疲劳、后期疲劳的KSS值进行区间的频数统计（分桶）'''
def RLDD_kss_buckets(kss_dirs,fatigue_cls,fatigue_range = [0,5,7,9], buckets_filePath = "buckets.txt"):
    '''
    :param kss_dirs: kss文件存放的路径  type=str
    :param fatigue_cls: 疲劳类别，用于获取指定疲劳类别的文件  type=list(int)
    :param fatigue_range: 疲劳KSS值的范围  type=list(int)
    :param buckets_filePath: 文件存放路径
    :return: 打印日志，并生成buckets.csv，可用于模型分类
    '''
    with open(buckets_filePath, "w+", encoding="utf-8") as f:
        f.write("0,1,2,kss\n")  #属性名
        #遍历所有疲劳类别
        for cls in fatigue_cls:
            totalPaths = glob.glob(os.path.join(kss_dirs,"*_" + str(cls) + ".csv"))

            for path in totalPaths:
                kss_buckets = {"0" : 1, "1" : 0, "2" : 0}

                #单独处理每一个文件
                kss_values = None
                df = pd.read_csv(path)
                if("kss" in df.columns.values):
                    kss_values = df["kss"].values.tolist()
                elif("KSS" in df.columns.values):
                    kss_values = df["KSS"].values.tolist()
                for kss in kss_values:
                    if(kss >= fatigue_range[0] and kss < fatigue_range[1]):  #警觉
                        kss_buckets["0"] += 1
                    elif(kss >= fatigue_range[1] and kss < fatigue_range[2]):  #早期疲劳
                        kss_buckets["1"] += 1
                    else:   #后期疲劳
                        kss_buckets["2"] += 1

                temp = str(kss_buckets["0"]) + "," + str(kss_buckets["1"]) + "," + str(kss_buckets["2"]) + "," + str(cls)
                f.write(temp + "\n")
                res = path.split("\\")[-1].split(".")[0] + " : " + str(kss_buckets)
                if(logger != None):
                    logger.info(res)
            if (logger != None):
                logger.info("\n")

'''对Drozy数据集警觉、早期疲劳、后期疲劳的KSS值进行区间的频数统计（分桶）'''
def Drozy_kss_buckets(kss_dirs,fatigue_cls_dict,fatigue_range = [0,5,7,9], buckets_filePath = "buckets.txt",logger=None):
    '''
    :param kss_dirs: kss_seqs文件夹的位置
    :param fatigue_cls_dict: Drozy视频的疲劳类别
    :param fatigue_range: 疲劳划分区间
    :param buckets_filePath:
    :return:
    '''
    with open(buckets_filePath, "w+", encoding="utf-8") as f:
        f.write("0,1,2,kss\n")  #属性名

        #遍历所有疲劳类别,统计个数
        totalPaths = glob.glob(os.path.join(kss_dirs, "*.csv"))
        for path in totalPaths:

            key = Path(path).name.split("_")[-1].split(".")[0]
            kss_label = fatigue_cls_dict[key]  #该视频的疲劳kss值
            if kss_label <= 5: cls = 0  #警觉
            elif kss_label > 5: cls = 1  #疲劳

            kss_buckets = {"0" : 1, "1" : 0, "2" : 0}

            #单独处理每一个文件
            kss_values = None
            df = pd.read_csv(path)
            if("kss" in df.columns.values):
                kss_values = df["kss"].values.tolist()
            elif("KSS" in df.columns.values):
                kss_values = df["KSS"].values.tolist()

            for kss in kss_values:
                if(kss >= fatigue_range[0] and kss < fatigue_range[1]):  #警觉
                    kss_buckets["0"] += 1
                elif(kss >= fatigue_range[1] and kss < fatigue_range[2]):  #早期疲劳
                    kss_buckets["1"] += 1
                else:   #后期疲劳
                    kss_buckets["2"] += 1

            temp = str(kss_buckets["0"]) + "," + str(kss_buckets["1"]) + "," + str(kss_buckets["2"]) + "," + str(cls)  #cls为疲劳类别（两分类））
            f.write(temp + "\n")
            res = path.split("\\")[-1].split(".")[0] + " : " + str(kss_buckets)
            if(logger != None):
                logger.info(res)

        if (logger != None):
            logger.info("\n")


def normalization_byRow(df):

    '''
    按行标准化，每列共同除以行和
    :param df:
    :return:
    '''
    res_df = pd.DataFrame({
        "0" : [],
        "1" : [],
        "2" : [],
        "kss" : []
    })
    for index in df.index:
        frameCount = df.loc[index]["0"] + df.loc[index]["1"] + df.loc[index]["2"]
        n1 = df.loc[index]["0"] / frameCount
        n2 = df.loc[index]["1"] / frameCount
        n3 = df.loc[index]["2"] / frameCount
        res_df.loc[index] = [n1,n2,n3,df.loc[index]["kss"]]

    return res_df

'''一阶段分类器：利用警觉、早期疲劳、后期疲劳的KSS值区间频数统计，使用SVM、KNN模型对其进行分类（36个数据，无需交叉验证，过拟合也无所谓）'''
def fatigue_classifier(buckets_path, MODEL="SVM"):

    '''
    :param buckets_path: 疲劳分组统计表格
    :param model: 分类模型 choices=['SVM'，'KNN'，'DTR']
    :return:
    '''

    df = pd.read_csv(buckets_path)

    '''按行标准化(得到[0,1])'''
    res_df = normalization_byRow(df)

    X,Y = [],[]
    for index in res_df.index:
        temp = [df.loc[index]["0"],df.loc[index]["1"],df.loc[index]["2"]]
        X.append(temp)
        Y.append([df.loc[index]["kss"]])
    X = np.array(X)
    Y = np.array(Y)
    X_train,y_train = X,Y

    # X_train, X_test, y_train, y_test = train_test_split(X,Y, test_size=.1, random_state=0)
    classifier = None
    if(MODEL == 'KNN'):
        classifier = OneVsRestClassifier(KNeighborsClassifier(n_neighbors=5, metric='minkowski', p=2))
    else:
        raise Exception("model choices = ['SVM']")
    classifier.fit(X_train, y_train)

    # y_score = classifier.predict_proba(X_train)
    # # print("y_score = ", y_score)
    # y_pred = np.argmax(y_score,axis=1)
    y_pred = classifier.predict(X_train)
    y_real = y_train
    acc = 0
    for i in range(len(y_real)):
        print(f"pred={y_pred[i]}, real = {y_real[i]}")
        if(y_pred[i] == y_real[i]):
            acc += 1
        # if(y_real[i] == 0 and y_pred[i] == 0):
        #     acc += 1
        # elif(y_real[i] != 0 and y_pred[i] != 0):
        #     acc += 1
    print(f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}")

    #保存模型
    if("long" in buckets_path):
        modelSave = MODEL +"_long.joblib"
    else:
        modelSave = MODEL + "_short.joblib"
    dump(classifier, modelSave)

'''两阶段分类器（RLDD）: 5折交叉验证'''
def two_stage_fatigue_classifier_forRLDD(short_term_buckets_path, long_term_buckets_path, short_term_model_path, long_term_model_path, MODEL = "KNN",logger=None):

    '''
    :param short_term_buckets_path: short term疲劳分组统计表格文件路径
    :param long_term_buckets_path: long term疲劳分组统计表格文件路径
    :param short_term_model_path: short term疲劳检测模型
    :param long_term_model_path: long term疲劳检测模型
    :return: 返回混淆矩阵
    '''

    short_df = pd.read_csv(short_term_buckets_path)
    long_df = pd.read_csv(long_term_buckets_path)
    short_term_model = load(short_term_model_path)   #OneVsRestClassifier模型
    long_term_model = load(long_term_model_path)

    '''按行标准化(得到[0,1])'''
    res_short_df = normalization_byRow(short_df)
    res_long_df = normalization_byRow(long_df)

    # short_term和long_term时刻对齐(本来就已经对齐了)
    X_short, X_long, Y = [], [], []
    for index in res_short_df.index:
        short_temp = [res_short_df.loc[index]["0"], res_short_df.loc[index]["1"], res_short_df.loc[index]["2"]]
        long_temp = [res_long_df.loc[index]["0"], res_long_df.loc[index]["1"], res_long_df.loc[index]["2"]]
        X_short.append(short_temp)
        X_long.append(long_temp)
        Y.append([res_short_df.loc[index]["kss"]])
    X_short = np.array(X_short)
    X_long = np.array(X_long)
    Y = np.array(Y)

    X_short_train, X_long_train, y_train = X_short, X_long, Y  #训练数据集

    #模型训练
    '''通过已知样本加载KNN模型，这里使用X_short_train，X_long_train分别加载short_term_model，long_term_model'''
    if(MODEL == 'KNN'):
        #在推理阶段也是如此，只不过预测的样本不再是X_short_train，X_long_train
        short_term_model.fit(X_short_train, y_train)
        long_term_model.fit(X_long_train, y_train)

    #模型测试
    '''先使用short_term kss_seq推理模型对short_term kss_seq进行检测'''
    y_pred = short_term_model.predict(X_short_train)
    y_real = y_train
    acc = 0
    for i in range(len(y_real)):
        print(f"pred={y_pred[i]}, real = {y_real[i]}")

        if (y_pred[i] == y_real[i]):
            acc += 1
            fatigue_vtable.update_VA(pred_cls=y_pred[i],real_cls=y_real[i])   #更新混淆矩阵
            continue

        '''如果实际为1,2，而预测结果为0，则使用long_term model对long_term kss_seq进行预测'''
        if(y_real[i] != 0 and y_pred[i] == 0):
            y_temp_pred = long_term_model.predict([X_long_train[i]])
            if (y_temp_pred == y_real[i]):
                acc += 1
                fatigue_vtable.update_VA(pred_cls=y_temp_pred, real_cls=y_real[i])  #更新混淆矩阵
        else:
            fatigue_vtable.update_VA(pred_cls=y_pred[i], real_cls=y_real[i])  # 更新混淆矩阵

    # print(f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}")
    res = f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}"
    print(res)
    if(logger != None):
        logger.info(res)
        logger.info(str(fatigue_vtable.confuse_Matrix))

    # return fatigue_vtable.confuse_Matrix
    print(fatigue_vtable.confuse_Matrix)

'''两阶段分类器（RLDD）: 5折交叉验证'''
def two_stage_fatigue_classifier_forRLDD_withKFold(short_term_buckets_path, long_term_buckets_path, short_term_model_path, long_term_model_path, MODEL = "KNN",logger=None):

    '''
    :param short_term_buckets_path: short term疲劳分组统计表格文件路径
    :param long_term_buckets_path: long term疲劳分组统计表格文件路径
    :param short_term_model_path: short term疲劳检测模型
    :param long_term_model_path: long term疲劳检测模型
    :return: 返回混淆矩阵
    '''

    short_df = pd.read_csv(short_term_buckets_path)
    long_df = pd.read_csv(long_term_buckets_path)
    short_term_model = load(short_term_model_path)   #OneVsRestClassifier模型
    long_term_model = load(long_term_model_path)

    '''按行标准化(得到[0,1])'''
    res_short_df = normalization_byRow(short_df)
    res_long_df = normalization_byRow(long_df)

    # short_term和long_term时刻对齐(本来就已经对齐了)
    X_short, X_long, Y = [], [], []
    for index in res_short_df.index:
        short_temp = [res_short_df.loc[index]["0"], res_short_df.loc[index]["1"], res_short_df.loc[index]["2"]]
        long_temp = [res_long_df.loc[index]["0"], res_long_df.loc[index]["1"], res_long_df.loc[index]["2"]]
        X_short.append(short_temp)
        X_long.append(long_temp)
        Y.append([res_short_df.loc[index]["kss"]])
    X_short = np.array(X_short)
    X_long = np.array(X_long)
    Y = np.array(Y)

    # K折交叉验证
    acc_mean = 0
    n_splits = 5
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=0)  # 10折
    index = 0
    for train_index, test_index in kf.split(X_short):  # 将数据划分为k折

        if(logger != None):
            index += 1
            logger.info("KFold " + str(index) + ":")

        X_short_train, X_long_train, y_train = X_short[train_index], X_long[train_index], Y[train_index]   #训练数据集
        X_short_test, X_long_test, y_test = X_short[test_index], X_long[test_index], Y[test_index]   #测试数据集

        #模型训练
        '''通过已知样本加载KNN模型，这里使用X_short_train，X_long_train分别加载short_term_model，long_term_model'''
        if(MODEL == 'KNN'):
            #在推理阶段也是如此，只不过预测的样本不再是X_short_train，X_long_train
            short_term_model.fit(X_short_train, y_train)
            long_term_model.fit(X_long_train, y_train)

        #模型测试
        '''先使用short_term kss_seq推理模型对short_term kss_seq进行检测'''
        y_pred = short_term_model.predict(X_short_test)
        y_real = y_test
        acc = 0
        for i in range(len(y_real)):
            print(f"pred={y_pred[i]}, real = {y_real[i]}")

            if (y_pred[i] == y_real[i]):
                acc += 1
                fatigue_vtable.update_VA(pred_cls=y_pred[i],real_cls=y_real[i])   #更新混淆矩阵
                continue

            '''如果实际为1,2，而预测结果为0，则使用long_term model对long_term kss_seq进行预测'''
            if(y_real[i] != 0 and y_pred[i] == 0):
                y_temp_pred = long_term_model.predict([X_long_train[i]])
                if (y_temp_pred == y_real[i]):
                    acc += 1
                    fatigue_vtable.update_VA(pred_cls=y_temp_pred, real_cls=y_real[i])  #更新混淆矩阵
            else:
                fatigue_vtable.update_VA(pred_cls=y_pred[i], real_cls=y_real[i])  # 更新混淆矩阵

        # print(f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}")
        acc_mean += acc / len(y_real)
        res = f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}"
        print(res)
        if(logger != None):
            logger.info(res)
            logger.info(str(fatigue_vtable.confuse_Matrix))

    if (logger != None):
        logger.info(f"mean_acc = {acc_mean / n_splits}")
    # return fatigue_vtable.confuse_Matrix

'''两阶段分类器(Drozy)'''
def two_stage_fatigue_classifier_forDrozy(short_term_buckets_path, long_term_buckets_path, short_term_model_path, long_term_model_path, MODEL = "KNN",logger=None):

    '''
    :param short_term_buckets_path: short term疲劳分组统计表格文件路径
    :param long_term_buckets_path: long term疲劳分组统计表格文件路径
    :param short_term_model_path: short term疲劳检测模型
    :param long_term_model_path: long term疲劳检测模型
    :return: 返回混淆矩阵
    '''

    short_df = pd.read_csv(short_term_buckets_path)
    long_df = pd.read_csv(long_term_buckets_path)
    short_term_model = load(short_term_model_path)   #OneVsRestClassifier模型
    long_term_model = load(long_term_model_path)

    '''按行标准化(得到[0,1])'''
    res_short_df = normalization_byRow(short_df)
    res_long_df = normalization_byRow(long_df)

    # short_term和long_term时刻对齐(本来就已经对齐了)
    X_short, X_long, Y = [], [], []
    for index in res_short_df.index:
        short_temp = [res_short_df.loc[index]["0"], res_short_df.loc[index]["1"], res_short_df.loc[index]["2"]]
        long_temp = [res_long_df.loc[index]["0"], res_long_df.loc[index]["1"], res_long_df.loc[index]["2"]]
        X_short.append(short_temp)
        X_long.append(long_temp)
        Y.append([res_short_df.loc[index]["kss"]])
    X_short = np.array(X_short)
    X_long = np.array(X_long)
    Y = np.array(Y)
    X_short_train, X_long_train, y_train = X_short, X_long, Y

    '''通过已知样本加载KNN模型，这里使用X_short_train，X_long_train分别加载short_term_model，long_term_model'''
    if(MODEL == 'KNN'):
        #在推理阶段也是如此，只不过预测的样本不再是X_short_train，X_long_train
        short_term_model.fit(X_short_train, y_train)
        long_term_model.fit(X_long_train, y_train)

    '''先使用short_term kss_seq推理模型对short_term kss_seq进行检测'''
    y_pred = short_term_model.predict(X_short_train)
    y_real = y_train
    acc = 0
    confusionMatrix = [[0,0],[0,0]]  #行为real，列为pred
    for i in range(len(y_real)):
        print(f"pred={y_pred[i]}, real = {y_real[i]}")

        if (y_pred[i] == y_real[i]):
            acc += 1
            confusionMatrix[int(y_real[i][0])][int(y_pred[i])] += 1
            continue

        if(y_pred[i] == 0 and y_real[i] == 1):
            '''如果实际1，而预测结果为0，则使用long_term model对long_term kss_seq进行预测'''
            y_temp_pred = long_term_model.predict([X_long_train[i]])
            if (y_temp_pred == 1):
                acc += 1
            confusionMatrix[1][int(y_temp_pred)] += 1
        else:
            confusionMatrix[int(y_real[i][0])][int(y_pred[i])] += 1

    # print(f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}")
    res = f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}"
    print(res)
    if(logger != None):
        logger.info(res)
        logger.info(str(confusionMatrix))

    return confusionMatrix

'''使用RLDD模型验证Drozy数据集，两阶段分类器'''
def two_stage_fatigue_classifier_forDrozy_withRLDD_model(RLDD_short_term_buckets_path, RLDD_long_term_buckets_path, Drozy_short_term_buckets_path, Drozy_long_term_buckets_path, short_term_model_path, long_term_model_path, MODEL = "KNN",logger=None):

    '''
    :param RLDD_short_term_buckets_path: RLDD数据集的kss统计数据（short term）
    :param RLDD_long_term_buckets_path: RLDD数据集的kss统计数据（long term）
    :param Drozy_short_term_buckets_path: Drozy数据集的kss统计数据（short term）
    :param Drozy_long_term_buckets_path: Drozy数据集的kss统计数据（long term）
    :param long_term_model_path: long term疲劳检测模型
    :return: 返回混淆矩阵
    '''
    RLDD_short_df = pd.read_csv(RLDD_short_term_buckets_path)
    RLDD_long_df = pd.read_csv(RLDD_long_term_buckets_path)
    Drozy_short_df = pd.read_csv(Drozy_short_term_buckets_path)
    Drozy_long_df = pd.read_csv(Drozy_long_term_buckets_path)
    short_term_model = load(short_term_model_path)   #OneVsRestClassifier模型
    long_term_model = load(long_term_model_path)

    '''按行标准化(得到[0,1])'''
    RLDD_short_df = normalization_byRow(RLDD_short_df)
    RLDD_long_df = normalization_byRow(RLDD_long_df)
    Drozy_short_df = normalization_byRow(Drozy_short_df)
    Drozy_long_df = normalization_byRow(Drozy_long_df)

    # short_term和long_term时刻对齐(本来就已经对齐了)
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

    '''使用Drozy数据集进行模型的验证'''
    X_short_test, X_long_test, Y_test = [], [], []
    for index in Drozy_short_df.index:
        short_temp = [Drozy_short_df.loc[index]["0"], Drozy_short_df.loc[index]["1"], Drozy_short_df.loc[index]["2"]]
        long_temp = [Drozy_long_df.loc[index]["0"], Drozy_long_df.loc[index]["1"], Drozy_long_df.loc[index]["2"]]
        X_short_test.append(short_temp)
        X_long_test.append(long_temp)
        Y_test.append([Drozy_short_df.loc[index]["kss"]])
    X_short_test = np.array(X_short_test)
    X_long_test = np.array(X_long_test)
    Y_test = np.array(Y_test)

    '''通过已知样本加载KNN模型，这里使用X_short_train，X_long_train分别加载short_term_model，long_term_model'''
    if(MODEL == 'KNN'):
        #在推理阶段也是如此，只不过预测的样本不再是X_short_train，X_long_train
        short_term_model.fit(X_short_train, y_train)   #预测类别为0,1,2
        long_term_model.fit(X_long_train, y_train)  #预测类别为0,1,2

    '''先使用short_term kss_seq推理模型对short_term kss_seq进行检测'''
    y_pred = short_term_model.predict(X_short_test)
    y_real = Y_test
    acc = 0
    confusionMatrix = [[0,0],[0,0]]  #行为real，列为pred
    for i in range(len(y_real)):
        pred_res = 0
        if(y_pred[i] != 0):
            y_pred[i] = 1
            pred_res = 1

        if (y_pred[i] == y_real[i]):
            acc += 1
            confusionMatrix[int(y_real[i][0])][int(y_pred[i])] += 1
            print(f"pred={pred_res}, real = {y_real[i]}")
            continue

        if(y_pred[i] == 0 and y_real[i] == 1):  #检测到警觉，而实际上是疲劳，则使用long_term model对long_term kss_seq进行预测
            y_temp_pred = long_term_model.predict([X_long_test[i]])
            if (y_temp_pred != 0):  #检测到1,2，都代表疲劳
                y_temp_pred = 1
                pred_res = y_temp_pred
                acc += 1
            confusionMatrix[1][int(y_temp_pred)] += 1
        else:
            if (y_pred[i] != 0):  #检测到1,2，都代表疲劳
                y_pred[i] = 1
                pred_res = 1
            confusionMatrix[int(y_real[i][0])][int(y_pred[i])] += 1

        print(f"pred={pred_res}, real = {y_real[i]}")

    # print(f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}")
    res = f"accuracy = {acc} / {len(y_real)} = {acc / len(y_real)}"
    print(res)
    if(logger != None):
        logger.info(res)
        logger.info(str(confusionMatrix))

    return confusionMatrix

'''为每个消融实验生成short term/long term的疲劳类别分组统计样本,默认写入路径为short_term/logs,long_term/logs,文件名为文件夹名+.log'''
def kss_bucket_for_ablation(ablation_dir):
    '''
    文件夹目录结构：
        fsv_activate_b1
        fsv_activate_b2
        ...
    :return:
    '''
    for dir in Path(ablation_dir).iterdir():

        if(".csv" in str(dir)):
            continue

        fatigue_cls = [0, 1, 2]
        fileName = Path(dir).name
        filepath = str(dir.parent) + "/logs/" + fileName + "_kss_buckets.txt"
        RLDD_kss_buckets(dir, fatigue_cls, buckets_filePath=filepath)

class MyTest(unittest.TestCase):

    '''生成short term/long term的疲劳类别分组统计样本'''
    def test_kss_buckets(self):
        global logger
        # kss_dirs = "../behavior_seqs/"
        # logger = _get_logger("kss_buckets.log")
        # fatigue_cls = [0, 1, 2]
        # RLDD_kss_buckets(kss_dirs, fatigue_cls)

        # kss_dirs = "./new_kss_seqs/short_term/"
        kss_dirs = "./new_kss_seqs/long_term/"
        logger = _get_logger(kss_dirs + "/logs/kss_buckets.log")
        fatigue_cls = [0, 1, 2]
        filepath = kss_dirs + "/logs/kss_buckets.txt"
        RLDD_kss_buckets(kss_dirs, fatigue_cls,buckets_filePath=filepath)

    def test_svm_classifier(self):
        # buckets_filePath = "buckets.txt"
        # fatigue_classifier(buckets_filePath, MODEL='SVM')

        kss_dirs = "./new_kss_seqs/short_term/"
        buckets_filePath = kss_dirs + "/logs/kss_buckets.txt"
        fatigue_classifier(buckets_filePath,MODEL='SVM')

        # kss_dirs = "./new_kss_seqs/long_term/"
        # buckets_filePath = kss_dirs + "/logs/kss_buckets.txt"
        # fatigue_classifier(buckets_filePath, MODEL='SVM')

    def test_knn(self):
        # buckets_filePath = "buckets.txt"
        # svm_classifier(buckets_filePath, MODEL='KNN')

        kss_dirs = "./new_kss_seqs/short_term/"
        buckets_filePath = kss_dirs + "/logs/kss_buckets.txt"
        fatigue_classifier(buckets_filePath, MODEL='KNN')

        # kss_dirs = "./new_kss_seqs/long_term/"
        # buckets_filePath = kss_dirs + "/logs/kss_buckets.txt"
        # fatigue_classifier(buckets_filePath, MODEL='KNN')

    def test_dtr(self):
        buckets_filePath = "buckets.txt"
        fatigue_classifier(buckets_filePath, MODEL='DTR')

        # kss_dirs = "./new_kss_seqs/long_term/"
        # buckets_filePath = kss_dirs + "/logs/kss_buckets.txt"
        # fatigue_classifier(buckets_filePath, MODEL='DTR')

    '''RLDD: 单独跑RLDD数据集, 两阶段KNN检测'''
    def test_two_stage_fatigue_classifier_withKNN(self):
        logger = None
        short_term_buckets_path = "./new_kss_seqs/short_term/logs/kss_buckets.txt"
        long_term_buckets_path = "./new_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        two_stage_fatigue_classifier_forRLDD(short_term_buckets_path, long_term_buckets_path, short_term_model_path, long_term_model_path,logger=logger)

    '''RLDD: K折交叉验证, 两阶段KNN检测'''
    def test_two_stage_fatigue_classifier_KFold_withKNN(self):
        logger = _get_logger("two_stage_KNN.log")
        short_term_buckets_path = "./new_kss_seqs/short_term/logs/kss_buckets.txt"
        long_term_buckets_path = "./new_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        two_stage_fatigue_classifier_forRLDD_withKFold(short_term_buckets_path, long_term_buckets_path, short_term_model_path,
                                             long_term_model_path, logger=logger)

    '''RLDD: 两阶段SVM检测'''
    def test_two_stage_fatigue_classifier_withSVM(self):
        short_term_buckets_path = "./new_kss_seqs/short_term/logs/kss_buckets.txt"
        long_term_buckets_path = "./new_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        confuseMatrix = two_stage_fatigue_classifier_forRLDD(short_term_buckets_path, long_term_buckets_path, short_term_model_path, long_term_model_path)
        print(confuseMatrix)

    '''消融实验: 按每个消融实验生成short term/long term的疲劳类别分组统计样本'''
    def test_kss_bucket_for_ablation(self):
        short_ablation_dir = "./new_kss_seqs/short_term/"
        long_ablation_dir = "./new_kss_seqs/long_term/"
        kss_bucket_for_ablation(short_ablation_dir)
        kss_bucket_for_ablation(long_ablation_dir)

    '''消融实验：为每消融实验使用两阶段的KNN进行分类'''
    def test_two_stage_fatigue_classifier_withKNN_forAblation(self):

        short_buckets_dir = "./new_kss_seqs/short_term/logs/"  #消融实验中buckets文件的文件夹位置
        long_buckets_dir = "./new_kss_seqs/short_term/logs/"  #消融实验中buckets文件的文件夹位置
        totalPaths = glob.glob(os.path.join(short_buckets_dir,"*.txt"))

        logger = _get_logger("ablation.log")
        for path in totalPaths:
            logger.info(Path(path).name)
            short_term_buckets_path = path
            fileName = Path(path).name
            long_term_buckets_path = long_buckets_dir + fileName
            short_term_model_path = "KNN_short.joblib"
            long_term_model_path = "KNN_long.joblib"
            two_stage_fatigue_classifier_forRLDD(short_term_buckets_path, long_term_buckets_path, short_term_model_path,
                                         long_term_model_path,logger=logger)
            logger.info("\n")

    '''Drozy: 单独跑Drozy数据集，验证Drozy数据集的疲劳检测准确度（2分类）'''
    def test_Drozy_acc(self):
        ''''''
        '''1、将Drozy行为检测数据转化成short_term kss和long_term kss'''
        # behaviorSeq_dir = "../Drozy/test/"
        # cfg_filePath = "../../config/fatigue_strategies_validate.txt"
        # save_Dir = "./Drozy_kss_seqs/"
        # generate_kss_from_behaviorSeqs(behaviorSeq_dir, cfg_filePath, save_Dir)

        '''2、将short_term kss 和 long_term kss转化成将short_term buckets和long_term buckets'''
        #获取Drozy视频标签，并包装成dict
        drozy_label_path = "../Drozy/Drozy_label.txt"
        df = pd.read_csv(drozy_label_path)
        fatigue_cls_dict = dict()
        for index in df.index:
            key = df.loc[index]['filename']
            value = df.loc[index]['kss']
            fatigue_cls_dict[key] = value

        #short_term
        kss_dirs = "./Drozy_kss_seqs/short_term/"
        logger = _get_logger(kss_dirs + "/logs/kss_buckets.log")
        filepath = kss_dirs + "/logs/kss_buckets.txt"
        Drozy_kss_buckets(kss_dirs, fatigue_cls_dict, buckets_filePath=filepath,logger=logger)
        #long term
        kss_dirs = "./Drozy_kss_seqs/long_term/"
        logger = _get_logger(kss_dirs + "/logs/kss_buckets.log")
        filepath = kss_dirs + "/logs/kss_buckets.txt"
        Drozy_kss_buckets(kss_dirs, fatigue_cls_dict, buckets_filePath=filepath,logger=logger)

        '''3、对Drozy的short_term buckets.txt，long_term buckets.txt使用KNN模型进行级联分类'''
        short_term_buckets_path = "./Drozy_kss_seqs/short_term/logs/kss_buckets.txt"
        long_term_buckets_path = "./Drozy_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        confusionMatrix = two_stage_fatigue_classifier_forDrozy(short_term_buckets_path, long_term_buckets_path, short_term_model_path,
                                     long_term_model_path)
        print(confusionMatrix)

    '''Drozy: 使用RLDD训练好的KNN对Drozy bucket数据进行测试'''
    def test_Drozy_withRLDD_model(self):

        RLDD_short_term_buckets_path = "./new_kss_seqs/short_term/logs/kss_buckets.txt"
        RLDD_long_term_buckets_path = "./new_kss_seqs/long_term/logs/kss_buckets.txt"
        Drozy_short_term_buckets_path = "./Drozy_kss_seqs/short_term/logs/kss_buckets.txt"
        Drozy_long_term_buckets_path = "./Drozy_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        confusionMatrix = two_stage_fatigue_classifier_forDrozy_withRLDD_model(RLDD_short_term_buckets_path, RLDD_long_term_buckets_path,
                                                                               Drozy_short_term_buckets_path, Drozy_long_term_buckets_path,
                                                                                short_term_model_path,long_term_model_path)
        print(confusionMatrix)

    '''MINEDD: 使用RLDD模型验证MINEDD数据集'''
    def test_MINEDD_acc(self):
        '''1、将Drozy行为检测数据转化成short_term kss和long_term kss'''
        # behaviorSeq_dir = "../MINE_DD/behavior_seqs/"
        # cfg_filePath = "../../config/fatigue_strategies_validate.txt"
        # save_Dir = "./MINE_DD_kss_seqs/"
        # generate_kss_from_behaviorSeqs(behaviorSeq_dir, cfg_filePath, save_Dir)

        '''2、将short_term kss 和 long_term kss转化成将short_term buckets和long_term buckets'''
        # 获取Drozy视频标签，并包装成dict
        drozy_label_path = "../MINE_DD/MINE_DD_label.txt"
        df = pd.read_csv(drozy_label_path)
        fatigue_cls_dict = dict()
        for index in df.index:
            key = df.loc[index]['filename'].split("_")[-1].split(".")[0]
            value = df.loc[index]['kss']
            fatigue_cls_dict[key] = value

        # short_term
        kss_dirs = "./MINE_DD_kss_seqs/short_term/"
        logger = _get_logger(kss_dirs + "/logs/kss_buckets.log")
        filepath = kss_dirs + "/logs/kss_buckets.txt"
        Drozy_kss_buckets(kss_dirs, fatigue_cls_dict, buckets_filePath=filepath, logger=logger)
        # long term
        kss_dirs = "./MINE_DD_kss_seqs/long_term/"
        logger = _get_logger(kss_dirs + "/logs/kss_buckets.log")
        filepath = kss_dirs + "/logs/kss_buckets.txt"
        Drozy_kss_buckets(kss_dirs, fatigue_cls_dict, buckets_filePath=filepath, logger=logger)

        '''3、使用RLDD训练好的长短时KNN对MINE_DD数据进行测试'''
        RLDD_short_term_buckets_path = "./new_kss_seqs/short_term/logs/kss_buckets.txt"
        RLDD_long_term_buckets_path = "./new_kss_seqs/long_term/logs/kss_buckets.txt"
        Drozy_short_term_buckets_path = "./MINE_DD_kss_seqs/short_term/logs/kss_buckets.txt"
        Drozy_long_term_buckets_path = "./MINE_DD_kss_seqs/long_term/logs/kss_buckets.txt"
        short_term_model_path = "KNN_short.joblib"
        long_term_model_path = "KNN_long.joblib"
        confusionMatrix = two_stage_fatigue_classifier_forDrozy_withRLDD_model(RLDD_short_term_buckets_path,
                                                                               RLDD_long_term_buckets_path,
                                                                               Drozy_short_term_buckets_path,
                                                                               Drozy_long_term_buckets_path,
                                                                               short_term_model_path,
                                                                               long_term_model_path)
        print(confusionMatrix)