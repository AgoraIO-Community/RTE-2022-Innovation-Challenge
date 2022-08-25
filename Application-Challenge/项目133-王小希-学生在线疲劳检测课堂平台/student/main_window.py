'''MainWindow'''
import leancloud
import sys

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QImage, QPixmap, QKeyEvent
from PyQt5.QtWidgets import QMessageBox,QInputDialog
from PyQt5.QtCore import Qt
QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling)

from GUI.student_login import Ui_Login_MainWindow
from display_window import DisplayWindow
from register_window import RegisterWindow
from util.yaml_load import load_yaml
from util.sha1_encode import sha1_equal
from util.get_agora_token import AgoraUtil

'''登录窗口'''
class LoginWindow(QtWidgets.QMainWindow, Ui_Login_MainWindow):

    def __init__(self, leancloud_cfg = "config.yaml"):
        '''
        :param leancloud_cfg: leancloud服务器配置文件路径
        '''
        super(LoginWindow, self).__init__()
        self.setupUi(self)   #创建窗体对象
        self.init()   #槽函数和按钮绑定
        cfg = load_yaml(leancloud_cfg)
        self.cfg = cfg
        self.appId = cfg["leancloud_appId"]
        self.appKey = cfg["leancloud_appKey"]
        self.masterKey = cfg["leancloud_masterKey"]

        #初始化leancloud
        leancloud.init(app_id = self.appId, master_key= self.masterKey)
        self.STU_LOGIN_TABLE = cfg["leancloud_student"]   #学生登录表
        self.TEA_LOGIN_TABLE = cfg["leancloud_teacher"]       #学生表
        self.CHAT_TABLE = cfg["leancloud_chatroom"]       #房间表

        # 获取agora基本信息，可以用于生成token与agora SD-RTN进行连接
        self.agoraUtil = AgoraUtil(cfg)
        self.chatroom_objId = 0   #用于更新CHAT_TABLE中指定chatroom的members状态（add和remove）
        self.student = None   #保存当前用户对象

    def init(self):
        # Button.click 报错：argument 1 has unexpected type 'NoneType' 参考 https://www.shuzhiduo.com/A/pRdBYpyP5n/
        self.pushButton.clicked.connect(lambda : self.login_clicked())   #为登录按钮绑定login_clicked 自定义槽函数
        self.pushButton_2.clicked.connect(lambda : self.register_redirect())    #为注册按钮绑定register_redirect 自定义槽函数

    '''加入到房间中'''
    def join_channel(self,chatroom_objId):

        self.chatroom_objId = chatroom_objId

        #为每个新加入的用户分配uid
        query = leancloud.Query(self.CHAT_TABLE)  # 根据 CHAT_TABLE 获取指定房间的members属性
        query.equal_to("objectId",chatroom_objId)   #根据id查询chatroom
        query.select('members','name')  #只获取members属性值
        chatroom = query.first()
        chatroom_name = chatroom.get("name")
        members = chatroom.get("members")
        if (len(members) == 0):
            userAccount = 1
        else:
            userAccount = int(max(members)) + 1  # 获取最大uid + 1
        userAccount = str(userAccount)

        #获取agora token
        token, appId = self.agoraUtil.getAgoraToken(chatroom_name, userAccount)
        print(f"student: token = {token}, uid = {userAccount}")

        # 将当前userAccount追加到指定chatroom的members数组中
        Chatroom = leancloud.Object.extend(self.CHAT_TABLE)
        chatroom = Chatroom.create_without_data(chatroom_objId)
        chatroom.add("members", userAccount)   #新成员加入房间
        chatroom.add("stream_low", userAccount)   #将学生的uid作为low_high发流端
        chatroom.increment("dual_status", 1)  # 更新标志位
        chatroom.save()

        #保存用户的uid属性
        self.student.set("chatroom_id",self.chatroom_objId)
        self.student.set("uid",userAccount)
        self.student.save()

        displayWindow = DisplayWindow(chatroom_objId,self.student, cfg = self.cfg)  # 构建自测页面对象
        displayWindow.joinChannel(appId = appId, token=token, chatroom_name=chatroom_name, uid=userAccount)   # 通过token等信息加入房间
        displayWindow.show()  # 跳转至自测页面
        self.close()

    '''点击登录按钮'''
    def login_clicked(self):

        stuName = self.lineEdit.text()
        password = self.lineEdit_2.text()
        chatroom_name = self.lineEdit_3.text()

        if(stuName == ""):
            QMessageBox.warning(self, '警告', '用户名不能为空，请输入！')
            return None
        elif (password == ""):
            QMessageBox.warning(self, '警告', '密码不能为空，请输入！')
            return None
        elif (chatroom_name == ""):
            QMessageBox.warning(self, '警告', '房间号不能为空，请输入！')
            return None

        '''######################################  用户信息查询与验证  ##########################################'''
        '''##################################### 用户名是否存在 #####################################'''
        query = leancloud.Query(self.STU_LOGIN_TABLE)
        query.equal_to("name", stuName)
        stu1 = None
        try:
            stu1 = query.first()  #判断该用户名是否存在
        except:  #该表不存在,直接放行
            pass
        if (stu1 == None):
            QMessageBox.critical(self, '错误', '用户名不存在！')
            self.lineEdit.clear()
            self.lineEdit_2.clear()
            self.lineEdit_3.clear()
            return None

        '''#####################################  用户名密码是否正确  #####################################'''
        base_pwd = stu1.get("password")  #获取加密的密码
        pwd_flag = sha1_equal(base_pwd,password)
        if (pwd_flag == False):
            QMessageBox.critical(self, '错误', '密码错误！')
            self.lineEdit_2.clear()
            self.lineEdit_3.clear()
            return None

        self.student = stu1   #保存登录的学生对象
        '''#####################################  房间号信息查询与验证  #####################################'''
        query = leancloud.Query(self.CHAT_TABLE)
        query.equal_to("name",chatroom_name)
        exist_chatrooms = []
        exist_chatrooms_id = []
        try:
            temp = query.find()  #判断该房间号是否存在
            for chatroom in temp:
                teacher_id = chatroom.get("teacher").id
                t_query = leancloud.Query(self.TEA_LOGIN_TABLE)
                t_query.equal_to("objectId",teacher_id)
                teacher_name = None
                try:
                    teacher = t_query.first()
                    teacher_name = teacher.get("name")
                except:  #避免老师信息删除，但房间号绑定的信息没删除
                    pass
                exist_chatrooms.append(chatroom.get("name") + "-" + teacher_name)
                exist_chatrooms_id.append(chatroom.get("objectId"))
        except:  #该表不存在，直接放行
            pass

        if (len(exist_chatrooms) == 0):
            QMessageBox.critical(self, '错误', '房间号不存在！')
            self.lineEdit_3.clear()
            return None
        else:
            #如果该房间号有多个，说明有多个任课老师创建了这房间，这时需要学生选择任课老师
            if (len(exist_chatrooms) > 1):
                selected_chatroom, ok = QInputDialog.getItem(self, "该房间名存在多个", "请选择你的任课老师:", exist_chatrooms, 1, True)
                if(ok == True):
                    selected_index = [index for index,name in exist_chatrooms if selected_chatroom == name][0]   #获取选择的索引
                    chatroom_id = exist_chatrooms_id[selected_index]

                    QMessageBox.information(self, '提示', f'正在进入{selected_chatroom}房间...')
                    self.join_channel(chatroom_id)
            else:
                QMessageBox.information(self, '提示', f'正在进入{exist_chatrooms[0]}房间...')
                self.join_channel(exist_chatrooms_id[0])  #该房间号只有一个

    '''注册按钮跳转'''
    def register_redirect(self):
        registerWindow = RegisterWindow()
        registerWindow.show()
        self.close()   #关掉当前页面

if __name__ == '__main__':
    from PyQt5 import QtCore
    QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling)#自适应分辨率

    app = QtWidgets.QApplication(sys.argv)
    window = LoginWindow()
    window.show()

    sys.exit(app.exec_())