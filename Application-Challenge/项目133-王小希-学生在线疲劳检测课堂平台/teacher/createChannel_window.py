import sys
import leancloud
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QImage, QPixmap, QKeyEvent
from PyQt5.QtWidgets import QMessageBox,QInputDialog
from PyQt5.QtCore import Qt

from GUI.teacher_createChannel import Ui_Channel_MainWindow
from util.yaml_load import load_yaml
from util.get_agora_token import AgoraUtil

class ChannelWindow(QtWidgets.QMainWindow, Ui_Channel_MainWindow):

    def __init__(self, teacher, leancloud_cfg="config.yaml"):
        '''
        :param teacher: 教师对象 type=leanCloud.Object，与房间名绑定
        :param leancloud_cfg: leancloud服务器配置文件路径
        '''
        super(ChannelWindow, self).__init__()
        self.setupUi(self)  # 创建窗体对象
        self.init()  #绑定事件
        self.teacher = teacher

        self.cfg = load_yaml(leancloud_cfg)
        self.appId = self.cfg["leancloud_appId"]
        self.appKey = self.cfg["leancloud_appKey"]
        self.masterKey = self.cfg["leancloud_masterKey"]

        # 初始化leancloud
        leancloud.init(app_id=self.appId, master_key=self.masterKey)
        self.CHAT_TABLE = self.cfg["leancloud_chatroom"]  # 房间表

        self.agoraUtil = AgoraUtil(self.cfg) #获取Agora的token信息类

    def init(self):
        self.pushButton.clicked.connect(lambda : self.create_channel())

    #正在创建房间
    def create_chatroom(self,chatroom_name):
        '''
        :param chatroom_name:
        :return: chatroom_id
        '''
        Chatroom = leancloud.Object.extend(self.CHAT_TABLE)
        chatroom = Chatroom()
        chatroom.set('name', chatroom_name)
        chatroom.set("teacher", self.teacher)  #将整个teacher对象传给chatroom的teacher属性中
        chatroom.set("members", [])  #初始化members属性
        chatroom.set("stream_low", [])  # 初始化stream_low属性
        chatroom.set("dual_status", 0)  # 初始化dual_status属性
        chatroom.save()
        QMessageBox.information(self, '提示', '房间创建成功')

        chatroom_id = chatroom.id
        #返回chatroom_id
        # query = leancloud.Query(self.CHAT_TABLE)
        # query.equal_to('name',chatroom_name)
        # query.equal_to('teacher',self.teacher)
        # chatroom_id = query.first().get("objectId")
        return chatroom_id

    #进入房间
    def join_channel(self,chatroom_objId):

        # 为每个新加入的用户分配uid
        query = leancloud.Query(self.CHAT_TABLE)  # 根据 CHAT_TABLE 获取指定房间的members属性
        query.equal_to("objectId", chatroom_objId)  # 根据id查询chatroom
        query.select('members', 'name')  # 只获取members属性值
        chatroom = query.first()
        chatroom_name = chatroom.get("name")
        members = chatroom.get("members")
        if(len(members) == 0):
            userAccount = 1
        else:
            userAccount = int(max(members)) + 1   #获取最大uid + 1
        userAccount = str(userAccount)

        #获取 关于agora_id, agora_certificate,uid, chatname等拼接成的token
        token,appId = self.agoraUtil.getAgoraToken(chatroom_name, userAccount)
        print(f"teacher: token = {token}, uid = {userAccount}")
        # 将当前userAccount追加到指定chatroom的members数组中
        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("objectId",chatroom_objId)
        chatroom = query.first()
        old_stream_high = chatroom.get("stream_high")
        chatroom.add("members", userAccount)  #新成员加入房间
        if(old_stream_high != None):
            #先判断该大流是否在members中，如果在则将其添加到stream_low中
            if(old_stream_high in members):
                chatroom.add("stream_low", old_stream_high)  #先将占用大流窗口的uid追加到stream_low尾部
        chatroom.set("stream_high", userAccount)  #老师进入房间，强制将老师的uid作为stream_high发流端
        chatroom.increment("dual_status", 1)   #更新标志位
        chatroom.save()

        from display_window import DisplayWindow  # 写在开头循环调用会出错
        displayWindow = DisplayWindow(chatroom_objId, userAccount, cfg = self.cfg)  # 创建login界面对象
        displayWindow.joinChannel(appId=appId, token=token, chatroom_name=chatroom_name,uid=userAccount)  # 通过token等信息加入房间
        displayWindow.show()  # 成功注册，跳转至登录页
        self.close()

    def create_channel(self):
        ''''''
        chatroom_name = self.lineEdit.text()
        '''###################################   Step1: 检验房间号是否存在  #####################################'''
        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("name",chatroom_name)
        base_chat = []
        try:
            base_chat = query.find()  #获得该房间名的所有chatroom对象
        except:  #CHAT_TABLE 表不存在，直接pass
            pass
        if(len(base_chat) != 0):
            base_chat = base_chat[0]
            ''' Step1.1、已存在的房间不是该老师创建, 提示房间名已存在'''
            if(base_chat.get("teacher").id != self.teacher.id):
                QMessageBox.warning(self, '警告', '该房间名已存在！')
                return None
            else:
                ''' Step1.2、已存在的房间是该老师创建, 提示是否进入该房间'''
                #创建Question消息框
                choice = QMessageBox.question(self, "提示", "你已创建过该房间，是否进入", QMessageBox.Yes | QMessageBox.No )
                if choice == QMessageBox.Yes:
                    print("Yes")
                    chatroom_objId = base_chat.get("objectId")
                    self.join_channel(chatroom_objId)
                else:
                    print("No")

        else:
            '''Step1.3、该房间不存在，但该老师已经创建过其他房间, 提示是否进入之前房间'''
            query = leancloud.Query(self.CHAT_TABLE)
            query.equal_to("teacher", self.teacher)   #关系查询
            exist_chatrooms = []
            exist_chatrooms_ids = []
            try:
                temp = query.find()
                for chatroom in temp:
                    exist_chatrooms.append(chatroom.get("name"))
                    exist_chatrooms_ids.append(chatroom.get("objectId"))
            except:  #CHAT_TABLE 表不存在，直接pass
                pass
            if(len(exist_chatrooms) != 0):
                '''Step1.4、下拉弹出框提示选择其他房间'''
                selected_chatroom, ok = QInputDialog.getItem(self, "之前已创建过房间", "是否选择如下这些房间，如果不选则为你创建新的房间:", exist_chatrooms, 1, True)

                if(ok == True):
                    selected_index = [index for index,chatroom in enumerate(exist_chatrooms) if chatroom == selected_chatroom][0]
                    selected_id = exist_chatrooms_ids[selected_index]
                    self.join_channel(selected_id)  #进入选中的房间
                    return None

            chatroom_id = self.create_chatroom(chatroom_name)  #创建房间
            self.join_channel(chatroom_id)  #进入房间

        return None
