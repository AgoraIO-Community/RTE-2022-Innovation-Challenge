'''MainWindow'''
import leancloud
import sys

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QImage, QPixmap, QKeyEvent
from PyQt5.QtWidgets import QMessageBox
from PyQt5.QtCore import Qt

from GUI.teacher_login import Ui_Login_MainWindow
from createChannel_window import ChannelWindow
from register_window import RegisterWindow
from util.yaml_load import load_yaml
from util.sha1_encode import sha1_equal

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
        self.appId = cfg["leancloud_appId"]
        self.appKey = cfg["leancloud_appKey"]
        self.masterKey = cfg["leancloud_masterKey"]

        #初始化leancloud
        leancloud.init(app_id = self.appId, master_key= self.masterKey)
        self.TEA_LOGIN_TABLE = cfg["leancloud_teacher"]   #老师登录表

    def init(self):
        # Button.click 报错：argument 1 has unexpected type 'NoneType' 参考 https://www.shuzhiduo.com/A/pRdBYpyP5n/
        self.pushButton.clicked.connect(lambda : self.login_clicked())   #为登录按钮绑定login_clicked 自定义槽函数
        self.pushButton_2.clicked.connect(lambda : self.register_redirect())    #为注册按钮绑定register_redirect 自定义槽函数

    '''点击登录按钮'''
    def login_clicked(self):

        teacherName = self.lineEdit.text()
        password = self.lineEdit_2.text()

        if(teacherName == ""):
            QMessageBox.warning(self, '警告', '用户名不能为空，请输入！')
            return None
        elif (password == ""):
            QMessageBox.warning(self, '警告', '密码不能为空，请输入！')
            return None

        '''######################################  用户信息查询与验证  ##########################################'''
        '''##################################### 用户名是否存在 #####################################'''
        query = leancloud.Query(self.TEA_LOGIN_TABLE)
        query.equal_to("name", teacherName)
        teacher = None
        try:
            teacher = query.first()  #判断该用户名是否存在
        except:  #该表不存在,直接放行
            pass
        if (teacher == None):
            QMessageBox.critical(self, '错误', '用户名不存在！')
            self.lineEdit.clear()
            self.lineEdit_2.clear()
            return None

        '''#####################################  用户名密码是否正确  #####################################'''
        base_pwd = teacher.get("password")  #获取加密的密码
        pwd_flag = sha1_equal(base_pwd,password)
        if (pwd_flag == False):
            QMessageBox.critical(self, '错误', '密码错误！')
            self.lineEdit_2.clear()
            return None

        channelWindow = ChannelWindow(teacher=teacher)  # 创建房间页面
        channelWindow.show()  #跳转至房间创建页面
        self.close()

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