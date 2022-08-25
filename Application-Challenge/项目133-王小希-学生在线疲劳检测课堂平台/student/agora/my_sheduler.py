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

    def __init__(self,chatroom_objId, userAccount, cfg, scrollAreaWidgetContents, verticalLayoutWidget, verticalLayout, rtc):
        '''
        :param chatroom_objId: 房间id
        :param userAccount: 登录用户的uid
        :param cfg: leanCloud配置文件
        :param scrollAreaWidgetContents: Display界面中scrollArea容器下的控件，用于动态封装QLabel
        :param rtc: agoraRTC访问agoraSDK的对象
        :param verticalLayoutWidget,verticalLayout : 调整QLabel布局
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
        self.scheduler = BackgroundScheduler()

        #设置QLabel的宽高
        # self.QLabel_width = 301
        # self.QLabel_height = 164

    #先预留person_count个画布
    def init_personCanvas(self):
        for index in range(self.person_count):
            if(index not in self.index_drawLabel_dict):
                label = QtWidgets.QLabel(self.scrollAreaWidgetContents)
                label.setGeometry(QtCore.QRect(0, 164 * index, 271, 150))
                label.setMinimumSize(271,150)  #设置label固定大小
                label.setMaximumSize(271,150)  #设置label固定大小
                label.setObjectName("label_" + str(index))
                self.verticalLayout.addWidget(label)  #对label进行垂直布局
                self.index_drawLabel_dict[index] = label
        self.verticalLayoutWidget.setGeometry(QtCore.QRect(0, 0, 271, 154 * self.person_count))

    def generate_dynamic_QLabel(self,stream_high, stream_low, uid_drawLabel_dict):
        '''
        :param stream_high: 大流的用户uid  type=str
        :param stream_low: 小流的用户uids type=List[str]
        :param uid_drawLabel_dict: 用户uid和QLabel进行绑定 type=dict
        :return:
        '''
        # self.logger.info("generate_dynamic_QLabel....")
        '''#################################  Step1、根据stream_low, 创建QLabel对象, 封装在 index_drawLabel_dict 中   ##########################################'''
        self.scrollAreaWidgetContents.setGeometry(QtCore.QRect(0, 0, 271, 154 * len(stream_low)))

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

        print(f"scrollAreaWidgetContents height = {154 * len(stream_low)}")
        return uid_drawLabel_dict

    def job(self):
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
            self.repr()
            uid_drawLabel_dict = self.generate_dynamic_QLabel(stream_high,stream_low,uid_drawLabel_dict)
            #更新完uid_drawLabel_dict，再修改agora.my_videoFrameObserver全局变量
            agora.my_videoFrameObserver.stream_high = stream_high
            agora.my_videoFrameObserver.stream_low = stream_low
            agora.my_videoFrameObserver.uid_drawLabel_dict = uid_drawLabel_dict

    #开启双流模式监听器
    def DUAL_STREAM_MODE_Listener(self):
        print("开启双流模式监听任务")
        self.scheduler.add_job(self.job, 'interval', seconds=2)
        self.scheduler.start()

    def repr(self):
        print(f'chatroom_objId = {self.chatroom.get("objectId")}, '
              f'chatroom.stream_low = {self.chatroom.get("stream_low")}, '
              f'chatroom.stream_high = {self.chatroom.get("stream_high")}, '
              f'chatroom.status = {self.chatroom.get("dual_status")}')

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