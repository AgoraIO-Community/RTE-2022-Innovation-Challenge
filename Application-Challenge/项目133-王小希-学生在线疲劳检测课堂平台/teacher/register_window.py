'''注册窗口'''
import leancloud

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QImage, QPixmap, QKeyEvent
from PyQt5.QtWidgets import QMessageBox
from PyQt5.QtCore import Qt

from GUI.teacher_register import Ui_Register_MainWindow
from util.yaml_load import load_yaml
from util.sha1_encode import shaEncode

class RegisterWindow(QMainWindow,Ui_Register_MainWindow):

    def __init__(self,leancloud_cfg = "config.yaml"):
        super(RegisterWindow, self).__init__()
        self.setupUi(self)
        self.init()
        cfg = load_yaml(leancloud_cfg)
        self.appId = cfg["leancloud_appId"]
        self.appKey = cfg["leancloud_appKey"]
        self.masterKey = cfg["leancloud_masterKey"]

        # 初始化leancloud
        leancloud.init(app_id=self.appId, master_key=self.masterKey)
        self.TEA_LOGIN_TABLE = cfg["leancloud_teacher"]  # 学生登录表

    def init(self):
        self.pushButton_2.clicked.connect(lambda : self.register())
        self.pushButton_3.clicked.connect(lambda : self.login_back())

    def register(self):
        ''''''
        '''连接leanCloud，注册账号'''
        teacherName = self.lineEdit.text()
        password = self.lineEdit_2.text()

        if (teacherName == ""):
            QMessageBox.warning(self, '警告', '用户名不能为空，请输入！')
            return None
        elif (password == ""):
            QMessageBox.warning(self, '警告', '密码不能为空，请输入！')
            return None

        '''##################################   用户名是否存在  ##################################'''
        query = leancloud.Query(self.TEA_LOGIN_TABLE)
        query.equal_to("name",teacherName)
        stu = None
        try:
            stu = query.first()  #判断该用户名是否存在
        except:  #该表不存在，直接放行
            pass

        if(stu != None):
            QMessageBox.critical(self,'警告', '该用户名已存在')
        else:
            Teacher = leancloud.Object.extend(self.TEA_LOGIN_TABLE)
            teacher = Teacher()
            teacher.set("name",teacherName)
            sha1_pwd = shaEncode(password)  #使用sha1对密码进行加密
            teacher.set("password",sha1_pwd)
            teacher.save()
            QMessageBox.information(self, '提示', '注册成功')

            from main_window import LoginWindow  #写在开头循环调用会出错
            loginWindow = LoginWindow()  #创建login界面对象
            loginWindow.show() #成功注册，跳转至登录页
            self.close()

    def login_back(self):
        from main_window import LoginWindow  # 写在开头循环调用会出错
        loginWindow = LoginWindow()  # 创建login界面对象
        loginWindow.show()  # 成功注册，跳转至登录页
        self.close()

