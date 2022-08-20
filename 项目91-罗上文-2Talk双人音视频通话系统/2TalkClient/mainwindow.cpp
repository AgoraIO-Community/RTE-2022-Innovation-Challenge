#include "mainwindow.h"
#include "ui_mainwindow.h"

#if _MSC_VER >= 1600
#pragma execution_character_set("utf-8")
#endif

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent) ,
      ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    login = false;
    is_calling = false;

    tcpClient = new QTcpSocket(this); //创建socket变量
    connect(tcpClient,SIGNAL(connected()),this,SLOT(onConnected()));
    connect(tcpClient,SIGNAL(disconnected()),this,SLOT(onDisconnected()));
    connect(tcpClient,SIGNAL(stateChanged(QAbstractSocket::SocketState)),this,SLOT(onSocketStateChange(QAbstractSocket::SocketState)));
    connect(tcpClient,SIGNAL(readyRead()),this,SLOT(onSocketReadyRead()));
    connectServer();

    CAgoraObject* pObject = CAgoraObject::getInstance();
    connect(pObject,SIGNAL(sender_videoStopped()),
            this,SLOT(receive_videoStopped()));
    connect(pObject,SIGNAL(sender_joinedChannelSuccess(const QString&,unsigned int ,int)),
            this,SLOT(receive_joinedChannelSuccess(const QString&,unsigned int,int)));
    connect(pObject,SIGNAL(sender_userJoined(unsigned int,int)),
            this,SLOT(receive_userJoined(unsigned int,int)));
    connect(pObject,SIGNAL(sender_userOffline(unsigned int,USER_OFFLINE_REASON_TYPE)),
            this,SLOT(receive_userOffline(unsigned int,USER_OFFLINE_REASON_TYPE)));
    connect(pObject,SIGNAL(sender_firstLocalVideoFrame(int,int,int)),
            this,SLOT(receive_firstLocalVideoFrame(int,int,int)));
    connect(pObject,SIGNAL(sender_firstRemoteVideoDecoded(unsigned int,int,int,int)),
            this,SLOT(receive_firstRemoteVideoDecoded(unsigned int,int,int,int)));
    connect(pObject,SIGNAL(sender_firstRemoteVideoFrameDrawn(unsigned int,int,int,int)),
            this,SLOT(receive_firstRemoteVideoFrameDrawn(unsigned int,int,int,int)));
    connect(pObject,SIGNAL(sender_localVideoStats(LocalVideoStats)),
            this,SLOT(receive_localVideoStats(LocalVideoStats)));
    connect(pObject,SIGNAL(sender_remoteVideoStats(RemoteVideoStats)),
            this,SLOT(receive_remoteVideoStats(RemoteVideoStats)));
    connect(pObject,SIGNAL(sender_rtcStats(RtcStats)),
            this,SLOT(receive_rtcStats(RtcStats)));

    connect(&localView,SIGNAL(quit_channel()),this,SLOT(on_quit_channel()));
    connect(&remoteView,SIGNAL(quit_channel()),this,SLOT(on_quit_channel()));

    CAgoraObject::getInstance()->SetDefaultParameters();
    CAgoraObject::getInstance()->SetCustomVideoProfile();

    QString qsEncrypSecret = "123";
    // configuration of encrypt
    EncryptionConfig config;
    // set encrypt mode
    config.encryptionMode = AES_128_XTS;
    // set encrypt key
    config.encryptionKey = qsEncrypSecret.toUtf8().data();
    // EnableEncryption of engine.
    CAgoraObject::getInstance()->EnableEncryption(true, config);
    CAgoraObject::getInstance()->SetClientRole(CLIENT_ROLE_BROADCASTER);
    CAgoraObject::getInstance()->enableVideo(true);
    CAgoraObject::getInstance()->enableAudio(true);
    CAgoraObject::getInstance()->leaveChannel();
}

void MainWindow::closeEvent(QCloseEvent*)
{
    localView.close();
    remoteView.close();
    CAgoraObject::CloseAgoraObject();
}


MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::receive_userJoined(uid_t uid, int elapsed)
{
    qDebug() << " 999 receive_userJoined " << uid;
    remoteView.bind_window(uid);
    remoteView.setGeometry(150,600,remoteView.width(),remoteView.height());
    remoteView.show();
}

void MainWindow::receive_videoStopped()
{
    qDebug() << " 999 receive_videoStopped ";
}

void MainWindow::receive_joinedChannelSuccess(const QString &qsChannel, unsigned int uid, int elapsed)
{
    qDebug() << " 999 receive_joinedChannelSuccess ";
}

void MainWindow::receive_firstLocalVideoFrame(int width, int height, int elapsed)
{
    qDebug() << " 999 receive_firstLocalVideoFrame ";
}

void MainWindow::receive_userOffline(uid_t uid, USER_OFFLINE_REASON_TYPE reason)
{
    qDebug() << " 999 receive_userOffline " << uid;
}
void MainWindow::receive_firstRemoteVideoDecoded(uid_t uid, int width, int height, int elapsed)
{
    qDebug() << " 999 receive_firstRemoteVideoDecoded ";
}

void MainWindow::receive_firstRemoteVideoFrameDrawn(uid_t uid, int width, int height, int elapsed)
{
    qDebug() << " 999 receive_firstRemoteVideoFrameDrawn ";
}

void MainWindow::receive_localVideoStats(const LocalVideoStats &stats)
{
    //qDebug() << " 999 receive_localVideoStats ";
}

void MainWindow::receive_remoteVideoStats(const RemoteVideoStats &stats)
{
    qDebug() << " 999 receive_remoteVideoStats ";
}
void MainWindow::receive_rtcStats(const RtcStats &stats)
{
    //qDebug() << " 999 receive_rtcStats ";
}

void MainWindow::on_quit_channel(){
    CAgoraObject::getInstance()->leaveChannel();
    if( !localView.isHidden() ){
        localView.hide();
    }
    if( !remoteView.isHidden() ){
        remoteView.hide();
    }
    is_calling = false;
}

void MainWindow::onConnected(){
    qDebug() << " onConnected ";
}

void MainWindow::onDisconnected(){
    qDebug() << " onDisconnected ";
    login = false;
    QMessageBox::information(this, "提示", "服务器失去链接", QMessageBox::Ok);
}

void MainWindow::onSocketStateChange(QAbstractSocket::SocketState socketState){
    qDebug() << " onSocketStateChange ";
}
void MainWindow::onSocketReadyRead(){
    uint8_t type = -1;

    QString mb;
    tcpClient->read((char *)&type,1);
    switch(type){
    case TYPE_LOGIN_REPLY:
        ReplyLogin replyLogin;
        tcpClient->read((char *)&replyLogin,TYPE_LOGIN_REPLY_SIZE);
        if( 1 == replyLogin.result ){
            login = true;
            ui->label_mobile->setText("登录手机号：" + my_mobile);
        }
        break;
    case TYPE_CALL_REPLY:
        ReplyCall replyCall;
        tcpClient->read((char *)&replyCall,TYPE_CALL_REPLY_SIZE);
        if( 1 == replyCall.result ){
            mb = QString(QLatin1String(replyCall.mobile));
            QMessageBox::information(this, "提示", "拨打的号码" + mb + "未登录", QMessageBox::Ok);
        }else if( 2 == replyCall.result ){
            CAgoraObject::getInstance()->joinChannel(NULL,call_mobile,0);
            localView.bind_window();
            localView.setGeometry(150,150,localView.width(),localView.height());
            localView.show();
            is_calling = true;
        }else if( 3 == replyCall.result ){
              QMessageBox::information(this, "提示", call_mobile + "拒绝接听您的通话，请关闭通话", QMessageBox::Ok);
        }
        break;
    case TYPE_CALL_TO:
        MsgCallTo msgCallTo;
        tcpClient->read((char *)&msgCallTo,TYPE_CALL_TO_SIZE);
        mb = QString::fromLocal8Bit(msgCallTo.mobile);
        qDebug() << "999 88 " << mb;
        QMessageBox::StandardButton result;
        result = QMessageBox::question(this, "消息提醒", mb + "正在呼叫您，是否接听？", QMessageBox::Yes|QMessageBox::No,QMessageBox::NoButton);
        if (QMessageBox::Yes == result){
            //调 声网 API 加入 channel
            CAgoraObject::getInstance()->joinChannel(NULL,my_mobile,0);
            localView.bind_window();
            localView.setGeometry(150,150,localView.width(),localView.height());
            localView.show();
        } else if(QMessageBox::No == result){
            //发送拒绝消息给服务器。
            ReplyCallFull replyCallFull;
            replyCallFull.type = TYPE_CALL_REPLY;
            replyCallFull.result = 3;

            char *c_mobile;
            QByteArray ba;
            ba = my_mobile.toLatin1();
            c_mobile = ba.data();
            strcpy(replyCallFull.mobile,msgCallTo.mobile);

            tcpClient->write((char*)&replyCallFull,sizeof(replyCallFull));
        }
        break;
    default:
        qDebug() << " default ";
    }


    qDebug() << " onSocketReadyRead ";
}

void MainWindow::connectServer()
{
    QString  addr = SERVER_IP;
    quint16  port = SERVER_PORT;
    tcpClient->connectToHost(addr,port);
}

void MainWindow::on_action_login_triggered()
{
    char *c_mobile;
    QByteArray ba;

    bool ok = false;
    my_mobile = QInputDialog::getText(this, "登录","请输入手机号", QLineEdit::Normal,"", &ok);
    if( false == ok ){
        //用户取消，没输入手机号
        return;
    }
    if( my_mobile.isEmpty() ){
          QMessageBox::information(this, "提示", "请输入手机号", QMessageBox::Ok);
          return;
    }

    if( tcpClient->state() != QAbstractSocket::ConnectedState ){
        connectServer();
        //休眠 800ms，如果还未链接上，报错。
        QThread::msleep(800);
    }
    if( tcpClient->state() != QAbstractSocket::ConnectedState ){
        QMessageBox::information(this, "提示", "服务器连接失败", QMessageBox::Ok);
        return;
    }

    MsgLogin msgLogin;
    msgLogin.type = TYPE_LOGIN;
    ba = my_mobile.toLatin1();
    c_mobile = ba.data();
    strcpy(msgLogin.mobile,c_mobile);
    tcpClient->write((char*)&msgLogin,sizeof(msgLogin));
}


void MainWindow::on_action_call_triggered()
{
    char *c_mobile;
    QByteArray ba;

    //判断登录状态，未登陆不允许拨打电话。
    if( false == login ){
         QMessageBox::information(this, "提示", "请先登录", QMessageBox::Ok);
         return;
    }

    if( is_calling ){
        QMessageBox::information(this, "提示", "正在通话中，请先关闭通话", QMessageBox::Ok);
        return;
    }

    //TODO，检测是否有一个麦克风或者摄像头。

    bool ok = false;
    call_mobile = QInputDialog::getText(this, "拨打电话","请输入对方的手机号", QLineEdit::Normal,"", &ok);
    if( false == ok ){
        //用户取消，没输入手机号
        return;
    }
    if( call_mobile.isEmpty() ){
          QMessageBox::information(this, "提示", "请输入手机号", QMessageBox::Ok);
          return;
    }

    MsgCall msgCall;
    msgCall.type = TYPE_CALL;
    ba = call_mobile.toLatin1();
    c_mobile = ba.data();
    strcpy(msgCall.mobile,c_mobile);
    tcpClient->write((char*)&msgCall,sizeof(msgCall));
}

void MainWindow::on_action_close_call_triggered()
{
    CAgoraObject::getInstance()->leaveChannel();
    if( !localView.isHidden() ){
        localView.hide();
    }
    if( !remoteView.isHidden() ){
        remoteView.hide();
    }
    is_calling = false;
}

