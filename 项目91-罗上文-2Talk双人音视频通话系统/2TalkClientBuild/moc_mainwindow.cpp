/****************************************************************************
** Meta object code from reading C++ file 'mainwindow.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.15.2)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include <memory>
#include "../../2Talk/mainwindow.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'mainwindow.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.15.2. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_MainWindow_t {
    QByteArrayData data[33];
    char stringdata0[582];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_MainWindow_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_MainWindow_t qt_meta_stringdata_MainWindow = {
    {
QT_MOC_LITERAL(0, 0, 10), // "MainWindow"
QT_MOC_LITERAL(1, 11, 25), // "on_action_login_triggered"
QT_MOC_LITERAL(2, 37, 0), // ""
QT_MOC_LITERAL(3, 38, 11), // "onConnected"
QT_MOC_LITERAL(4, 50, 14), // "onDisconnected"
QT_MOC_LITERAL(5, 65, 19), // "onSocketStateChange"
QT_MOC_LITERAL(6, 85, 28), // "QAbstractSocket::SocketState"
QT_MOC_LITERAL(7, 114, 11), // "socketState"
QT_MOC_LITERAL(8, 126, 17), // "onSocketReadyRead"
QT_MOC_LITERAL(9, 144, 24), // "on_action_call_triggered"
QT_MOC_LITERAL(10, 169, 20), // "receive_videoStopped"
QT_MOC_LITERAL(11, 190, 28), // "receive_joinedChannelSuccess"
QT_MOC_LITERAL(12, 219, 9), // "qsChannel"
QT_MOC_LITERAL(13, 229, 3), // "uid"
QT_MOC_LITERAL(14, 233, 7), // "elapsed"
QT_MOC_LITERAL(15, 241, 18), // "receive_userJoined"
QT_MOC_LITERAL(16, 260, 19), // "receive_userOffline"
QT_MOC_LITERAL(17, 280, 24), // "USER_OFFLINE_REASON_TYPE"
QT_MOC_LITERAL(18, 305, 6), // "reason"
QT_MOC_LITERAL(19, 312, 28), // "receive_firstLocalVideoFrame"
QT_MOC_LITERAL(20, 341, 5), // "width"
QT_MOC_LITERAL(21, 347, 6), // "height"
QT_MOC_LITERAL(22, 354, 31), // "receive_firstRemoteVideoDecoded"
QT_MOC_LITERAL(23, 386, 34), // "receive_firstRemoteVideoFrame..."
QT_MOC_LITERAL(24, 421, 23), // "receive_localVideoStats"
QT_MOC_LITERAL(25, 445, 15), // "LocalVideoStats"
QT_MOC_LITERAL(26, 461, 5), // "stats"
QT_MOC_LITERAL(27, 467, 24), // "receive_remoteVideoStats"
QT_MOC_LITERAL(28, 492, 16), // "RemoteVideoStats"
QT_MOC_LITERAL(29, 509, 16), // "receive_rtcStats"
QT_MOC_LITERAL(30, 526, 8), // "RtcStats"
QT_MOC_LITERAL(31, 535, 15), // "on_quit_channel"
QT_MOC_LITERAL(32, 551, 30) // "on_action_close_call_triggered"

    },
    "MainWindow\0on_action_login_triggered\0"
    "\0onConnected\0onDisconnected\0"
    "onSocketStateChange\0QAbstractSocket::SocketState\0"
    "socketState\0onSocketReadyRead\0"
    "on_action_call_triggered\0receive_videoStopped\0"
    "receive_joinedChannelSuccess\0qsChannel\0"
    "uid\0elapsed\0receive_userJoined\0"
    "receive_userOffline\0USER_OFFLINE_REASON_TYPE\0"
    "reason\0receive_firstLocalVideoFrame\0"
    "width\0height\0receive_firstRemoteVideoDecoded\0"
    "receive_firstRemoteVideoFrameDrawn\0"
    "receive_localVideoStats\0LocalVideoStats\0"
    "stats\0receive_remoteVideoStats\0"
    "RemoteVideoStats\0receive_rtcStats\0"
    "RtcStats\0on_quit_channel\0"
    "on_action_close_call_triggered"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_MainWindow[] = {

 // content:
       8,       // revision
       0,       // classname
       0,    0, // classinfo
      18,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
       0,       // signalCount

 // slots: name, argc, parameters, tag, flags
       1,    0,  104,    2, 0x08 /* Private */,
       3,    0,  105,    2, 0x08 /* Private */,
       4,    0,  106,    2, 0x08 /* Private */,
       5,    1,  107,    2, 0x08 /* Private */,
       8,    0,  110,    2, 0x08 /* Private */,
       9,    0,  111,    2, 0x08 /* Private */,
      10,    0,  112,    2, 0x08 /* Private */,
      11,    3,  113,    2, 0x08 /* Private */,
      15,    2,  120,    2, 0x08 /* Private */,
      16,    2,  125,    2, 0x08 /* Private */,
      19,    3,  130,    2, 0x08 /* Private */,
      22,    4,  137,    2, 0x08 /* Private */,
      23,    4,  146,    2, 0x08 /* Private */,
      24,    1,  155,    2, 0x08 /* Private */,
      27,    1,  158,    2, 0x08 /* Private */,
      29,    1,  161,    2, 0x08 /* Private */,
      31,    0,  164,    2, 0x08 /* Private */,
      32,    0,  165,    2, 0x08 /* Private */,

 // slots: parameters
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void, 0x80000000 | 6,    7,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void,
    QMetaType::Void, QMetaType::QString, QMetaType::UInt, QMetaType::Int,   12,   13,   14,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int,   13,   14,
    QMetaType::Void, QMetaType::UInt, 0x80000000 | 17,   13,   18,
    QMetaType::Void, QMetaType::Int, QMetaType::Int, QMetaType::Int,   20,   21,   14,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int, QMetaType::Int, QMetaType::Int,   13,   20,   21,   14,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int, QMetaType::Int, QMetaType::Int,   13,   20,   21,   14,
    QMetaType::Void, 0x80000000 | 25,   26,
    QMetaType::Void, 0x80000000 | 28,   26,
    QMetaType::Void, 0x80000000 | 30,   26,
    QMetaType::Void,
    QMetaType::Void,

       0        // eod
};

void MainWindow::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        auto *_t = static_cast<MainWindow *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->on_action_login_triggered(); break;
        case 1: _t->onConnected(); break;
        case 2: _t->onDisconnected(); break;
        case 3: _t->onSocketStateChange((*reinterpret_cast< QAbstractSocket::SocketState(*)>(_a[1]))); break;
        case 4: _t->onSocketReadyRead(); break;
        case 5: _t->on_action_call_triggered(); break;
        case 6: _t->receive_videoStopped(); break;
        case 7: _t->receive_joinedChannelSuccess((*reinterpret_cast< const QString(*)>(_a[1])),(*reinterpret_cast< uint(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
        case 8: _t->receive_userJoined((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2]))); break;
        case 9: _t->receive_userOffline((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< USER_OFFLINE_REASON_TYPE(*)>(_a[2]))); break;
        case 10: _t->receive_firstLocalVideoFrame((*reinterpret_cast< int(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
        case 11: _t->receive_firstRemoteVideoDecoded((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3])),(*reinterpret_cast< int(*)>(_a[4]))); break;
        case 12: _t->receive_firstRemoteVideoFrameDrawn((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3])),(*reinterpret_cast< int(*)>(_a[4]))); break;
        case 13: _t->receive_localVideoStats((*reinterpret_cast< const LocalVideoStats(*)>(_a[1]))); break;
        case 14: _t->receive_remoteVideoStats((*reinterpret_cast< const RemoteVideoStats(*)>(_a[1]))); break;
        case 15: _t->receive_rtcStats((*reinterpret_cast< const RtcStats(*)>(_a[1]))); break;
        case 16: _t->on_quit_channel(); break;
        case 17: _t->on_action_close_call_triggered(); break;
        default: ;
        }
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        switch (_id) {
        default: *reinterpret_cast<int*>(_a[0]) = -1; break;
        case 3:
            switch (*reinterpret_cast<int*>(_a[1])) {
            default: *reinterpret_cast<int*>(_a[0]) = -1; break;
            case 0:
                *reinterpret_cast<int*>(_a[0]) = qRegisterMetaType< QAbstractSocket::SocketState >(); break;
            }
            break;
        }
    }
}

QT_INIT_METAOBJECT const QMetaObject MainWindow::staticMetaObject = { {
    QMetaObject::SuperData::link<QMainWindow::staticMetaObject>(),
    qt_meta_stringdata_MainWindow.data,
    qt_meta_data_MainWindow,
    qt_static_metacall,
    nullptr,
    nullptr
} };


const QMetaObject *MainWindow::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *MainWindow::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_meta_stringdata_MainWindow.stringdata0))
        return static_cast<void*>(this);
    return QMainWindow::qt_metacast(_clname);
}

int MainWindow::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QMainWindow::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 18)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 18;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 18)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 18;
    }
    return _id;
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
