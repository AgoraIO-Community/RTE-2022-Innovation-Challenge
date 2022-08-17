import re

class Fati_strategy_parser:

    def __init__(self):
        self.SHORT_TIME_WINDOW_LENGTH = 0  #短滑动时间窗口大小
        self.LONG_TIME_WINDOW_LENGTH = 0  #长滑动时间窗口大小
        self.kss_map = dict()  #每个疲劳编码设置的kss值
        self.count_weight_map = dict()   #每个疲劳编码的重要性权重
        self.singleton = []   #该集合使用singleton算子计算kss值, 比如 [b1,b2,e2,e3,m1,h1,h2]
        self.mutual = []   #该集合使用mutual算子计算kss值, 比如 [h1,e2],[e3,b2]
        self.activate = []   ##该集合使用activate算子计算kss值, 比如[b1,+],[b3,-]]
        self.FPS = 8   #每秒处理帧数

    '''通过文件路径获取运算集合'''
    def get_fatigue_strategies(self,filePath):
        '''
        :param filePath: 文件路径
        :return:
        '''
        filePath = "face_utils/" + filePath
        file = open(filePath, "r")
        fatigue_strategy_str = ""
        line = file.read()
        fatigue_strategy_str += line.replace("\n", "").replace(" ", "")  # 去除空格和换行符
        print(fatigue_strategy_str)

        st_index = fatigue_strategy_str.index("#short_timeWindowLength")  #"#short_timeWindowLength"起始位置
        lt_index = fatigue_strategy_str.index("#long_timeWindowLength")  #"#long_timeWindowLength"起始位置
        k_index = fatigue_strategy_str.index("#kss_map")  #"#kss_map"起始位置
        w_index = fatigue_strategy_str.index("#count_weight_map")  # "#count_weight_map"起始位置
        s_index = fatigue_strategy_str.index("#singleton")  # "#singleton"起始位置
        m_index = fatigue_strategy_str.index("#mutual")  # "#mutual"起始位置
        a_index = fatigue_strategy_str.index("#activate")  # "#activate"起始位置
        ft2_index = fatigue_strategy_str.index("#fatigue2_ratio")  # "#fatigue2_ratio"起始位置
        ft3_index = fatigue_strategy_str.index("#fatigue3_ratio")  # "#fatigue3_ratio"起始位置
        # print(s_index, m_index, a_index)

        '''解析self.SHORT_TIME_WINDOW_LENGTH 滑动时间窗口长度'''
        tw_str = fatigue_strategy_str[st_index:lt_index]
        tw_str = tw_str.replace("#short_timeWindowLength","")
        self.SHORT_TIME_WINDOW_LENGTH = int(tw_str[0:-1]) * self.FPS

        '''解析self.LONG_TIME_WINDOW_LENGTH 滑动时间窗口长度'''
        tw_str = fatigue_strategy_str[lt_index:k_index]
        tw_str = tw_str.replace("#long_timeWindowLength", "")
        self.LONG_TIME_WINDOW_LENGTH = int(tw_str[0:-1]) * self.FPS

        '''解析kss_map'''
        kss_str = fatigue_strategy_str[k_index:w_index]
        kss_str = kss_str.replace("#kss_map", "")[1:-1]  #去除掉字符串中的’{‘，’}‘
        kss_tokens = kss_str.replace('\"',"").split(",")
        for token in kss_tokens:
            temp = token.split(":")
            key,value = temp[0], int(temp[1])
            self.kss_map[key] = value

        '''解析count_weight_map'''
        count_str = fatigue_strategy_str[w_index:s_index]
        count_str = count_str.replace("#count_weight_map", "")[1:-1]  #去除掉字符串中的’{‘，’}‘
        weight_tokens = count_str.replace('\"',"").split(",")
        for token in weight_tokens:
            temp = token.split(":")
            key, value = temp[0], int(temp[1])
            self.count_weight_map[key] = value

        '''解析self.singleton'''
        singleton_str = fatigue_strategy_str[s_index:m_index]
        singleton_str = singleton_str.replace("#singleton","")[1:-1]  #去除掉字符串中的’[‘，’]‘
        singleton_tokens = singleton_str.split(",")
        self.singleton = singleton_tokens

        '''填充self.mutual'''
        mutual_str = fatigue_strategy_str[m_index:a_index]
        mutual_str = mutual_str.replace("#mutual", "")
        try:  #如果未找到"["或"]"索引时，会报错
            p1 = mutual_str.index("[")  #获取第一个’[‘和’]‘的位置，接着截断得到后面的子串，再继续遍历
            p2 = mutual_str.index("]")
            leftStr = None
            while(p2 < len(mutual_str)):
                leftStr = mutual_str[p2 + 2 : len(mutual_str)]  # 剩余的子串
                subStr = mutual_str[p1 + 1 : p2]
                mutual_tokens = subStr.split(",")
                self.mutual.append(mutual_tokens)
                p1 = p2 + 2 + leftStr.index("[")  # 获取第一个’[‘和’]‘的位置，接着截断得到后面的子串，再继续遍历
                p2 = p2 + 2 + leftStr.index("]")
        except:
            pass  #异常不处理

        '''填充self.activate'''
        activate_str = fatigue_strategy_str[a_index:ft2_index]
        activate_str = activate_str.replace("#activate", "")
        activate_tokens = activate_str.split(",")
        for token in activate_tokens:
            operator = token[0]
            code = token[2:-1]
            temp = [operator,code]
            self.activate.append(temp)
        # print(self.singleton)
        # print(self.mutual)
        # print(self.activate)

        '''填充fatigue2_ratio'''
        fatigue2_str = fatigue_strategy_str[ft2_index:ft3_index]
        fatigue2_str = fatigue2_str.replace("#fatigue2_ratio", "")
        fatigue2_ratio = float(fatigue2_str)

        '''填充fatigue3_ratio'''
        fatigue3_str = fatigue_strategy_str[ft3_index:]
        fatigue3_str = fatigue3_str.replace("#fatigue3_ratio", "")
        fatigue3_ratio = float(fatigue3_str)

        '''填充kss_fatigue_cls'''
        # kss_fatigue_str = fatigue_strategy_str[kss_fatigue_index:]
        # kss_fatigue_str = kss_fatigue_str.replace("#kss_fatigue_cls", "")
        # kss_fatigue_tokens = kss_fatigue_str.split("and")
        # kss_fatigue_Dict = dict()  #key为fatigue类别，value为kss列表,元素为str
        # for kss_fatigue_token in kss_fatigue_tokens:
        #     token = kss_fatigue_token.split(":")
        #     key = token[0]
        #     value = token[1][1:-1].split(",")
        #     kss_fatigue_Dict[key] = value

        cfg = dict()   #配置文件集合
        cfg["SHORT_TIME_WINDOW_LENGTH"] = self.SHORT_TIME_WINDOW_LENGTH
        cfg["LONG_TIME_WINDOW_LENGTH"] = self.LONG_TIME_WINDOW_LENGTH
        cfg["singleton"] = self.singleton
        cfg["mutual"] = self.mutual
        cfg["activate"] = self.activate
        cfg["fatigue2_ratio"] = fatigue2_ratio
        cfg["fatigue3_ratio"] = fatigue3_ratio
        return cfg

if __name__ == '__main__':
    filePath = "fatigue_strategies.txt"
    parser = Fati_strategy_parser()
    parser.get_fatigue_strategies(filePath)
    print(parser.kss_map)
    print(parser.count_weight_map)

