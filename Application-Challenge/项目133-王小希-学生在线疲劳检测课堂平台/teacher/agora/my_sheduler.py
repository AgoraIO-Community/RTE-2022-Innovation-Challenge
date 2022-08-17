'''定时任务，用于监听leancloud云端chatroom.stream_high，stream_low状态的更新，并修改DUAL_STREAM_MODE_UPDATED值'''

from PyQt5 import QtCore, QtGui, QtWidgets
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import leancloud
# from copy import deepcopy
import agora
import agorartc
from util.logger import _get_logger

class MyScheduler():

    def __init__(self,chatroom_objId, userAccount, cfg, scrollAreaWidgetContents, verticalLayoutWidget, verticalLayout, textBrowser, rtc):
        '''
        :param chatroom_objId: 房间id
        :param userAccount: 登录用户的uid
        :param cfg: leanCloud配置文件
        :param scrollAreaWidgetContents: Display界面中scrollArea容器下的控件，用于动态封装QLabel
        :param rtc: agoraRTC访问agoraSDK的对象
        :param verticalLayoutWidget,verticalLayout : 调整QLabel布局
        :param textBrowser 文本显示控件，用于人脸检测结果的显示
        '''
        self.cfg = cfg
        self.chatroom_objId = chatroom_objId  # 当前的房间id
        self.userAccount = userAccount  #当前用户uid
        self.scrollAreaWidgetContents = scrollAreaWidgetContents  # Display界面中scrollArea容器下的控件,用于动态封装QLabel
        self.verticalLayoutWidget = verticalLayoutWidget  # 垂直布局控件
        self.verticalLayout = verticalLayout

        self.rtc = rtc  #agoraRTC访问agoraSDK的对象（用来设置uid视频流对应的streamType）
        self.logger = _get_logger("streamType_changed.log")   #日志文件对象
        self.CHAT_TABLE = cfg["leancloud_chatroom"]  # 房间表

        # appId = "Kllqq69T39mWeIal2XBwKXPF-9Nh9j0Va"
        # masterKey = "WQv6PpmfgNYiDVczr5shUvIc"
        # leancloud.init(appId=appId,master_key=masterKey)
        Chatroom = leancloud.Object.extend(self.CHAT_TABLE)
        self.chatroom = Chatroom.create_without_data(self.chatroom_objId)
        self.chatroom.fetch()  #同步对象

        self.pre_stage = self.chatroom.get("dual_status")   #双流模式更新标志位
        # 更新VideoFrameObserver的全局双流状态
        stream_high = self.chatroom.get("stream_high")
        stream_low = self.chatroom.get("stream_low")
        stream_low = list(set(stream_low))
        agora.my_videoFrameObserver.stream_high = stream_high
        agora.my_videoFrameObserver.stream_low = stream_low
        uid_drawLabel_dict = agora.my_videoFrameObserver.uid_drawLabel_dict   # key:uid, value: 小流 QLabel 对象

        self.index_drawLabel_dict = dict()   #建立索引和QLabel对象的关系  key:index,value: 小流 QLabel 对象
        # 房间最多容纳100人
        self.person_count = 100
        self.init_personCanvas()
        self.generate_dynamic_QLabel(stream_high,stream_low,uid_drawLabel_dict)   #根据stream_low，动态生成QLabel对象
        self.scheduler = BackgroundScheduler()  #双流模式监听器
        self.scheduler1 = BackgroundScheduler()  #学生状态监听器

        #设置QLabel的宽高
        # self.QLabel_width = 301
        # self.QLabel_height = 164

        #人脸检测结果查询
        self.studentState_query = leancloud.Query("Face_detection")
        self.textBrowser = textBrowser

    #先预留person_count个画布
    def init_personCanvas(self):
        for index in range(self.person_count):
            if(index not in self.index_drawLabel_dict):
                label = QtWidgets.QLabel(self.scrollAreaWidgetContents)
                label.setGeometry(QtCore.QRect(0, 146 * index, 261, 142))
                label.setMinimumSize(261,142)  #设置label固定大小
                label.setMaximumSize(261,142)  #设置label固定大小
                label.setObjectName("label_" + str(index))
                self.verticalLayout.addWidget(label)  #对label进行垂直布局
                self.index_drawLabel_dict[index] = label
        self.verticalLayoutWidget.setGeometry(QtCore.QRect(0, 0, 261, 146 * self.person_count))

    '''动态分配QLabel'''
    def generate_dynamic_QLabel(self,stream_high, stream_low, uid_drawLabel_dict):
        '''
        :param stream_high: 大流的用户uid  type=str
        :param stream_low: 小流的用户uids type=List[str]
        :param uid_drawLabel_dict: 用户uid和QLabel进行绑定 type=dict
        :return:
        '''
        # self.logger.info("generate_dynamic_QLabel....")
        '''#################################  Step1、根据stream_low, 创建QLabel对象, 封装在 index_drawLabel_dict 中   ##########################################'''
        self.scrollAreaWidgetContents.setGeometry(QtCore.QRect(0, 0, 261, 146 * len(stream_low)))

        '''#################################  Step2、根据stream_low,stream_high, 分配QLabel对象，分配给uid_drawLabel_dict  ##########################################'''
        index = 0  # 用于标记QLabel的索引
        # 如果大流窗口为空，则清空大流窗口界面
        if (stream_high == None):
            agora.my_videoFrameObserver.draw_label.clear()
        # 如果大流窗口非本地用户uid，则分配第一个小流窗口给本地用户
        if (stream_high != self.userAccount):
            uid_drawLabel_dict[self.userAccount] = self.index_drawLabel_dict[index]
            index += 1
        else:  #如果是，则清空第一个小流窗口
            self.index_drawLabel_dict[0].clear()

        # 为remote用户分配QLabel
        for uid in stream_low:
            if (uid != self.userAccount):  # remote用户的uid
                uid_drawLabel_dict[uid] = self.index_drawLabel_dict[index]
                index += 1
        print(f"stream_low.size = {len(stream_low)}")
        print(f"index = {index}")
        #清空掉多余的QLabel（直接删除，不是clear）
        size = len(self.index_drawLabel_dict)
        print(f"index_drawLabel_dict.size = {size}")
        while index < size:
            self.index_drawLabel_dict[index].clear()   #先清除qlabel绑定的图片
            # del self.index_drawLabel_dict[index]
            index += 1

        print(f"scrollAreaWidgetContents height = {146 * len(stream_low)}")
        return uid_drawLabel_dict

    '''监听双流模式状态是否更新'''
    def dual_stream_job(self):
        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        '''监听dual_status状态是否发生改变'''
        self.chatroom.fetch()  #同步对象
        cur_stage = self.chatroom.get("dual_status")  # 双流模式更新标志位
        if(cur_stage != self.pre_stage):
            print("DUAL_STREAM_MODE changed")
            self.pre_stage = cur_stage
            #更新VideoFrameObserver的全局双流状态
            stream_high = self.chatroom.get("stream_high")
            stream_low = self.chatroom.get("stream_low")
            stream_low = list(set(stream_low))
            uid_drawLabel_dict = agora.my_videoFrameObserver.uid_drawLabel_dict
            self.chatroom_repr()
            uid_drawLabel_dict = self.generate_dynamic_QLabel(stream_high,stream_low,uid_drawLabel_dict)
            #更新完uid_drawLabel_dict，再修改agora.my_videoFrameObserver全局变量
            agora.my_videoFrameObserver.stream_high = stream_high
            agora.my_videoFrameObserver.stream_low = stream_low
            agora.my_videoFrameObserver.uid_drawLabel_dict = uid_drawLabel_dict

    '''定时获取学生的状态'''
    def students_state_job(self,MODE):
        '''
        :param MODE: MODE=0,进行人脸状态检测，MODE=1,进行疲劳状态检测
        :return:
        '''
        self.studentState_query.equal_to("chatroom_id", self.chatroom_objId)
        students_face_state = None
        try:
            students_face_state = self.studentState_query.find()
        except:
            pass

        if (students_face_state != None):
            for student_faceState in students_face_state:
                text = self.get_studentState_withOption(student_faceState,MODE)
                if(text != None):
                    text = text.encode("gbk").decode("gbk")  #用gbk编码成字节，再用gbk编码成字符
                    self.textBrowser.append(text)
                    self.textBrowser.moveCursor(self.textBrowser.textCursor().End)  # 文本框显示到底部

    #开启双流模式监听器
    def DUAL_STREAM_MODE_Listener(self):
        print("开启双流模式监听任务")
        self.scheduler.add_job(self.dual_stream_job, 'interval', seconds=2)
        self.scheduler.start()

    # 开启学生状态监听器
    def STUDENTS_STATE_Listener(self,MODE):
        print("开启学生人脸状态监听任务")
        try:
            # self.scheduler1.shutdown(wait=False)  #终止调度器中的任务存储器以及执行器
            self.scheduler1.remove_job(job_id="students_state_job")  #终止调度器中的任务存储器以及执行器
        except:
            pass  #调度器并没有运行，此时shutdown会报错：apscheduler.schedulers.SchedulerNotRunningError: Scheduler is not running
        self.scheduler1.add_job(self.students_state_job, 'interval', seconds=3,args=[MODE], id="students_state_job")

        try:
            self.scheduler1.start()   #scheduler1只有关闭之后. 才能再次启动
        except:
            pass

    def chatroom_repr(self):
        print(f'chatroom_objId = {self.chatroom.get("objectId")}, '
              f'chatroom.stream_low = {self.chatroom.get("stream_low")}, '
              f'chatroom.stream_high = {self.chatroom.get("stream_high")}, '
              f'chatroom.status = {self.chatroom.get("dual_status")}')

    def get_studentState_withOption(self, faceState, MODE):
        '''
        :param faceState:
        :param MODE:  MODE=0,进行人脸状态检测，MODE=1,进行疲劳状态检测
        :return:
        '''
        print(f'chatroom_id = {faceState.get("chatroom_id")}, '
              f'username = {faceState.get("username")}, '
              f'face_state = {faceState.get("face_state")}, '
              f'fatigue_state = {faceState.get("fatigue_state")}, '
              f'EAR_estimate = {faceState.get("EAR_estimate")}, '
              f'BAR_estimate = {faceState.get("BAR_estimate")}')

        date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        abnormal_flag = False  #当人脸不在屏幕上，没在看屏幕等异常行为时，才会输出报表
        text = ""
        if(MODE == 0):
            face_str = "不在场"
            abnormal_flag = True
            face_state = faceState.get("face_state")
            if (face_state == 1):
                face_str = "没有看屏幕"
                abnormal_flag = True
            elif(face_state == 2):
                face_str = "正在看屏幕"
                abnormal_flag = False
            text = date_str + " : " + faceState.get("username") + face_str + "\n"
        else:
            fatigue_str = "清醒"
            fatigue_state = faceState.get("fatigue_state")
            if (fatigue_state == 1):
                fatigue_str = "有点疲劳"
                abnormal_flag = True
            elif (fatigue_state == 2):
                fatigue_str = "犯困了"
                abnormal_flag = True
            text = date_str + " : " + faceState.get("username") + "此时" + fatigue_str + "\n"

        if(abnormal_flag):  #绘制异常结果
            return text
        return None


if __name__ == '__main__':
    cfg = {
        "leancloud_chatroom" : "Chatroom",
    }
    chatroom_objId = "628ced73033caa54ba649f11"
    my_scheduler = MyScheduler(chatroom_objId,1,cfg, QtWidgets.QWidget(),None)
    my_scheduler.DUAL_STREAM_MODE_Listener()

    #主进程不断
    while(True):
        pass