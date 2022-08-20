#include "mainwindow.h"
#include <QApplication>

using namespace agora::rtc;

Q_DECLARE_METATYPE(USER_OFFLINE_REASON_TYPE)
Q_DECLARE_METATYPE(LocalVideoStats)
Q_DECLARE_METATYPE(RemoteVideoStats)
Q_DECLARE_METATYPE(RtcStats)
Q_DECLARE_METATYPE(LastmileProbeResult)

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    qRegisterMetaType<USER_OFFLINE_REASON_TYPE>();
    qRegisterMetaType<LocalVideoStats>();
    qRegisterMetaType<RemoteVideoStats>();
    qRegisterMetaType<RtcStats>();
    qRegisterMetaType<LastmileProbeResult>();

    MainWindow w;
    w.show();
    return a.exec();
}
