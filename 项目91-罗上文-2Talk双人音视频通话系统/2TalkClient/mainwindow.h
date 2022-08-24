#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QThread>
#include <QMessageBox>
#include <QInputDialog>
#include "msg.h"
#include "agoraobject.h"
#include "localview.h"
#include "remoteview.h"

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
    bool login;
    bool is_calling;
    QString my_mobile;

private slots:
    void on_action_login_triggered();
    void onConnected();
    void onDisconnected();
    void onSocketStateChange(QAbstractSocket::SocketState socketState);
    void onSocketReadyRead();//读取socket传入的数据

    void on_action_call_triggered();

    void receive_videoStopped();
    void receive_joinedChannelSuccess(const QString &qsChannel, unsigned int uid, int elapsed);
    void receive_userJoined(unsigned int uid, int elapsed);
    void receive_userOffline(unsigned int uid, USER_OFFLINE_REASON_TYPE reason);
    void receive_firstLocalVideoFrame(int width, int height, int elapsed);
    void receive_firstRemoteVideoDecoded(unsigned int uid, int width, int height, int elapsed);
    void receive_firstRemoteVideoFrameDrawn(unsigned int uid, int width, int height, int elapsed);
    void receive_localVideoStats(const LocalVideoStats &stats);
    void receive_remoteVideoStats(const RemoteVideoStats &stats);
    void receive_rtcStats(const RtcStats &stats);

    void on_quit_channel();

    void on_action_close_call_triggered();
protected:
    void closeEvent(QCloseEvent *event);
private:
    Ui::MainWindow *ui;
    void connectServer();
    QTcpSocket  *tcpClient;  //socket
    LocalView localView;
    RemoteView remoteView;
    QString call_mobile;

};
#endif // MAINWINDOW_H
