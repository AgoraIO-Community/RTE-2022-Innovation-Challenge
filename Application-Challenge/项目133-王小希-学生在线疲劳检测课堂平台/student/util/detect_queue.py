'''人脸检测队列，疲劳检测队列：主要缓冲检测结果，减少云端数据的更新'''
import leancloud
from collections import Counter

'''人脸检测队列，负责更新学生人脸状态数据'''
class FaceState_Queue():

    def __init__(self,size = 20,front_ratio = 0.6):
        '''
        :param size: 队列大小
        :param front_ratio: 队列中占比为多少，才可以将其归为正脸
        '''
        self.face_list = []
        self.size = size
        self.front_ratio = front_ratio

    def insert(self, el, leanCloud_obj):
        '''
        :param el: 人脸状态   0：未检测到人脸；1：人脸非正脸；2：人脸为正脸
        :param leanCloud_obj: leancloud对象，用于保存数据
        :return:
        '''
        if(len(self.face_list) == self.size):  #保存数据，清空队列，等待下一次的状态更新
            # first_el = self.face_list[0]

            counter = Counter(self.face_list)
            number = counter.most_common()
            print(f"face state numbers: = {number}")
            first_el,count = number[0][0], number[0][1]  #获取频数最大的数，以及统计个数

            print(f"first_el = {first_el}")
            cal = count / self.size
            if(cal > self.front_ratio):  #如果队列中值都相等，则更新该值，否则更新为1
                leanCloud_obj.set("face_state",first_el)
                leanCloud_obj.save()
                # print(f"face_state update successfully, face_state = {first_el}")
            else:
                leanCloud_obj.set("face_state", 1)
                leanCloud_obj.save()
                # print(f"face_state update successfully, face_state = 1")
            self.face_list = []

        self.face_list.append(el)


'''疲劳检测队列，负责更新学生疲劳状态数据'''
class FatigueState_Queue():

    def __init__(self, size = 30, fatigue_ratio = 0.6):
        '''
        :param size: 队列大小
        :param fatigue_ratio: 队列中占比为多少，才可以将其归为疲劳
        '''
        self.fatigue_list = []
        self.size = size
        self.fatigue_ratio = fatigue_ratio

    def insert(self, el, leanCloud_obj):
        '''
        :param el: 疲劳状态   0：警觉；1：早期疲劳；2：后期疲劳
        :param leanCloud_obj: leancloud对象，用于保存数据
        :return:
        '''
        if (len(self.fatigue_list) == self.size):  # 保存数据，清空队列，等待下一次的状态更新

            counter = Counter(self.fatigue_list)
            number = counter.most_common()
            first_el, count = number[0][0], number[0][1]  # 获取频数最大的数，以及统计个数

            print(f"first_el = {first_el}")
            # cal = (len(temp_list) / self.size)
            cal = count / self.size
            if (cal > self.fatigue_ratio):  # 如果队列中值都相等，则更新该值，否则更新为1
                leanCloud_obj.set("fatigue_state", first_el)
                if(first_el != 0): #检测到疲劳
                    leanCloud_obj.increment("fatigue_count", 1)
                leanCloud_obj.save()
                print("fatigue_state update successfully")
            else:
                leanCloud_obj.set("fatigue_state", 0)
                leanCloud_obj.save()
                print("fatigue_state update successfully")
            self.fatigue_list = []

        self.fatigue_list.append(el)