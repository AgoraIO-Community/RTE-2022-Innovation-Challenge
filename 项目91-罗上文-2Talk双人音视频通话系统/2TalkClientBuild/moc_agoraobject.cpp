/****************************************************************************
** Meta object code from reading C++ file 'agoraobject.h'
**
** Created by: The Qt Meta Object Compiler version 67 (Qt 5.15.2)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include <memory>
#include "../../2Talk/agoraobject.h"
#include <QtCore/qbytearray.h>
#include <QtCore/qmetatype.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'agoraobject.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 67
#error "This file was generated using the moc from 5.15.2. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

QT_BEGIN_MOC_NAMESPACE
QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
struct qt_meta_stringdata_CAgoraObject_t {
    QByteArrayData data[28];
    char stringdata0[455];
};
#define QT_MOC_LITERAL(idx, ofs, len) \
    Q_STATIC_BYTE_ARRAY_DATA_HEADER_INITIALIZER_WITH_OFFSET(len, \
    qptrdiff(offsetof(qt_meta_stringdata_CAgoraObject_t, stringdata0) + ofs \
        - idx * sizeof(QByteArrayData)) \
    )
static const qt_meta_stringdata_CAgoraObject_t qt_meta_stringdata_CAgoraObject = {
    {
QT_MOC_LITERAL(0, 0, 12), // "CAgoraObject"
QT_MOC_LITERAL(1, 13, 19), // "sender_videoStopped"
QT_MOC_LITERAL(2, 33, 0), // ""
QT_MOC_LITERAL(3, 34, 27), // "sender_joinedChannelSuccess"
QT_MOC_LITERAL(4, 62, 9), // "qsChannel"
QT_MOC_LITERAL(5, 72, 3), // "uid"
QT_MOC_LITERAL(6, 76, 7), // "elapsed"
QT_MOC_LITERAL(7, 84, 17), // "sender_userJoined"
QT_MOC_LITERAL(8, 102, 18), // "sender_userOffline"
QT_MOC_LITERAL(9, 121, 24), // "USER_OFFLINE_REASON_TYPE"
QT_MOC_LITERAL(10, 146, 6), // "reason"
QT_MOC_LITERAL(11, 153, 27), // "sender_firstLocalVideoFrame"
QT_MOC_LITERAL(12, 181, 5), // "width"
QT_MOC_LITERAL(13, 187, 6), // "height"
QT_MOC_LITERAL(14, 194, 30), // "sender_firstRemoteVideoDecoded"
QT_MOC_LITERAL(15, 225, 33), // "sender_firstRemoteVideoFrameD..."
QT_MOC_LITERAL(16, 259, 22), // "sender_localVideoStats"
QT_MOC_LITERAL(17, 282, 15), // "LocalVideoStats"
QT_MOC_LITERAL(18, 298, 5), // "stats"
QT_MOC_LITERAL(19, 304, 23), // "sender_remoteVideoStats"
QT_MOC_LITERAL(20, 328, 16), // "RemoteVideoStats"
QT_MOC_LITERAL(21, 345, 15), // "sender_rtcStats"
QT_MOC_LITERAL(22, 361, 8), // "RtcStats"
QT_MOC_LITERAL(23, 370, 22), // "sender_lastmileQuality"
QT_MOC_LITERAL(24, 393, 7), // "quality"
QT_MOC_LITERAL(25, 401, 26), // "sender_lastmileProbeResult"
QT_MOC_LITERAL(26, 428, 19), // "LastmileProbeResult"
QT_MOC_LITERAL(27, 448, 6) // "result"

    },
    "CAgoraObject\0sender_videoStopped\0\0"
    "sender_joinedChannelSuccess\0qsChannel\0"
    "uid\0elapsed\0sender_userJoined\0"
    "sender_userOffline\0USER_OFFLINE_REASON_TYPE\0"
    "reason\0sender_firstLocalVideoFrame\0"
    "width\0height\0sender_firstRemoteVideoDecoded\0"
    "sender_firstRemoteVideoFrameDrawn\0"
    "sender_localVideoStats\0LocalVideoStats\0"
    "stats\0sender_remoteVideoStats\0"
    "RemoteVideoStats\0sender_rtcStats\0"
    "RtcStats\0sender_lastmileQuality\0quality\0"
    "sender_lastmileProbeResult\0"
    "LastmileProbeResult\0result"
};
#undef QT_MOC_LITERAL

static const uint qt_meta_data_CAgoraObject[] = {

 // content:
       8,       // revision
       0,       // classname
       0,    0, // classinfo
      12,   14, // methods
       0,    0, // properties
       0,    0, // enums/sets
       0,    0, // constructors
       0,       // flags
      12,       // signalCount

 // signals: name, argc, parameters, tag, flags
       1,    0,   74,    2, 0x06 /* Public */,
       3,    3,   75,    2, 0x06 /* Public */,
       7,    2,   82,    2, 0x06 /* Public */,
       8,    2,   87,    2, 0x06 /* Public */,
      11,    3,   92,    2, 0x06 /* Public */,
      14,    4,   99,    2, 0x06 /* Public */,
      15,    4,  108,    2, 0x06 /* Public */,
      16,    1,  117,    2, 0x06 /* Public */,
      19,    1,  120,    2, 0x06 /* Public */,
      21,    1,  123,    2, 0x06 /* Public */,
      23,    1,  126,    2, 0x06 /* Public */,
      25,    1,  129,    2, 0x06 /* Public */,

 // signals: parameters
    QMetaType::Void,
    QMetaType::Void, QMetaType::QString, QMetaType::UInt, QMetaType::Int,    4,    5,    6,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int,    5,    6,
    QMetaType::Void, QMetaType::UInt, 0x80000000 | 9,    5,   10,
    QMetaType::Void, QMetaType::Int, QMetaType::Int, QMetaType::Int,   12,   13,    6,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int, QMetaType::Int, QMetaType::Int,    5,   12,   13,    6,
    QMetaType::Void, QMetaType::UInt, QMetaType::Int, QMetaType::Int, QMetaType::Int,    5,   12,   13,    6,
    QMetaType::Void, 0x80000000 | 17,   18,
    QMetaType::Void, 0x80000000 | 20,   18,
    QMetaType::Void, 0x80000000 | 22,   18,
    QMetaType::Void, QMetaType::Int,   24,
    QMetaType::Void, 0x80000000 | 26,   27,

       0        // eod
};

void CAgoraObject::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    if (_c == QMetaObject::InvokeMetaMethod) {
        auto *_t = static_cast<CAgoraObject *>(_o);
        Q_UNUSED(_t)
        switch (_id) {
        case 0: _t->sender_videoStopped(); break;
        case 1: _t->sender_joinedChannelSuccess((*reinterpret_cast< const QString(*)>(_a[1])),(*reinterpret_cast< uint(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
        case 2: _t->sender_userJoined((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2]))); break;
        case 3: _t->sender_userOffline((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< USER_OFFLINE_REASON_TYPE(*)>(_a[2]))); break;
        case 4: _t->sender_firstLocalVideoFrame((*reinterpret_cast< int(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3]))); break;
        case 5: _t->sender_firstRemoteVideoDecoded((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3])),(*reinterpret_cast< int(*)>(_a[4]))); break;
        case 6: _t->sender_firstRemoteVideoFrameDrawn((*reinterpret_cast< uint(*)>(_a[1])),(*reinterpret_cast< int(*)>(_a[2])),(*reinterpret_cast< int(*)>(_a[3])),(*reinterpret_cast< int(*)>(_a[4]))); break;
        case 7: _t->sender_localVideoStats((*reinterpret_cast< const LocalVideoStats(*)>(_a[1]))); break;
        case 8: _t->sender_remoteVideoStats((*reinterpret_cast< const RemoteVideoStats(*)>(_a[1]))); break;
        case 9: _t->sender_rtcStats((*reinterpret_cast< const RtcStats(*)>(_a[1]))); break;
        case 10: _t->sender_lastmileQuality((*reinterpret_cast< int(*)>(_a[1]))); break;
        case 11: _t->sender_lastmileProbeResult((*reinterpret_cast< const LastmileProbeResult(*)>(_a[1]))); break;
        default: ;
        }
    } else if (_c == QMetaObject::IndexOfMethod) {
        int *result = reinterpret_cast<int *>(_a[0]);
        {
            using _t = void (CAgoraObject::*)();
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_videoStopped)) {
                *result = 0;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(const QString & , unsigned int , int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_joinedChannelSuccess)) {
                *result = 1;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(unsigned int , int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_userJoined)) {
                *result = 2;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(unsigned int , USER_OFFLINE_REASON_TYPE );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_userOffline)) {
                *result = 3;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(int , int , int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_firstLocalVideoFrame)) {
                *result = 4;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(unsigned int , int , int , int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_firstRemoteVideoDecoded)) {
                *result = 5;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(unsigned int , int , int , int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_firstRemoteVideoFrameDrawn)) {
                *result = 6;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(const LocalVideoStats & );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_localVideoStats)) {
                *result = 7;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(const RemoteVideoStats & );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_remoteVideoStats)) {
                *result = 8;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(const RtcStats & );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_rtcStats)) {
                *result = 9;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(int );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_lastmileQuality)) {
                *result = 10;
                return;
            }
        }
        {
            using _t = void (CAgoraObject::*)(const LastmileProbeResult & );
            if (*reinterpret_cast<_t *>(_a[1]) == static_cast<_t>(&CAgoraObject::sender_lastmileProbeResult)) {
                *result = 11;
                return;
            }
        }
    }
}

QT_INIT_METAOBJECT const QMetaObject CAgoraObject::staticMetaObject = { {
    QMetaObject::SuperData::link<QObject::staticMetaObject>(),
    qt_meta_stringdata_CAgoraObject.data,
    qt_meta_data_CAgoraObject,
    qt_static_metacall,
    nullptr,
    nullptr
} };


const QMetaObject *CAgoraObject::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *CAgoraObject::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_meta_stringdata_CAgoraObject.stringdata0))
        return static_cast<void*>(this);
    return QObject::qt_metacast(_clname);
}

int CAgoraObject::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QObject::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 12)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 12;
    } else if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 12)
            *reinterpret_cast<int*>(_a[0]) = -1;
        _id -= 12;
    }
    return _id;
}

// SIGNAL 0
void CAgoraObject::sender_videoStopped()
{
    QMetaObject::activate(this, &staticMetaObject, 0, nullptr);
}

// SIGNAL 1
void CAgoraObject::sender_joinedChannelSuccess(const QString & _t1, unsigned int _t2, int _t3)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t3))) };
    QMetaObject::activate(this, &staticMetaObject, 1, _a);
}

// SIGNAL 2
void CAgoraObject::sender_userJoined(unsigned int _t1, int _t2)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))) };
    QMetaObject::activate(this, &staticMetaObject, 2, _a);
}

// SIGNAL 3
void CAgoraObject::sender_userOffline(unsigned int _t1, USER_OFFLINE_REASON_TYPE _t2)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))) };
    QMetaObject::activate(this, &staticMetaObject, 3, _a);
}

// SIGNAL 4
void CAgoraObject::sender_firstLocalVideoFrame(int _t1, int _t2, int _t3)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t3))) };
    QMetaObject::activate(this, &staticMetaObject, 4, _a);
}

// SIGNAL 5
void CAgoraObject::sender_firstRemoteVideoDecoded(unsigned int _t1, int _t2, int _t3, int _t4)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t3))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t4))) };
    QMetaObject::activate(this, &staticMetaObject, 5, _a);
}

// SIGNAL 6
void CAgoraObject::sender_firstRemoteVideoFrameDrawn(unsigned int _t1, int _t2, int _t3, int _t4)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t2))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t3))), const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t4))) };
    QMetaObject::activate(this, &staticMetaObject, 6, _a);
}

// SIGNAL 7
void CAgoraObject::sender_localVideoStats(const LocalVideoStats & _t1)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))) };
    QMetaObject::activate(this, &staticMetaObject, 7, _a);
}

// SIGNAL 8
void CAgoraObject::sender_remoteVideoStats(const RemoteVideoStats & _t1)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))) };
    QMetaObject::activate(this, &staticMetaObject, 8, _a);
}

// SIGNAL 9
void CAgoraObject::sender_rtcStats(const RtcStats & _t1)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))) };
    QMetaObject::activate(this, &staticMetaObject, 9, _a);
}

// SIGNAL 10
void CAgoraObject::sender_lastmileQuality(int _t1)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))) };
    QMetaObject::activate(this, &staticMetaObject, 10, _a);
}

// SIGNAL 11
void CAgoraObject::sender_lastmileProbeResult(const LastmileProbeResult & _t1)
{
    void *_a[] = { nullptr, const_cast<void*>(reinterpret_cast<const void*>(std::addressof(_t1))) };
    QMetaObject::activate(this, &staticMetaObject, 11, _a);
}
QT_WARNING_POP
QT_END_MOC_NAMESPACE
