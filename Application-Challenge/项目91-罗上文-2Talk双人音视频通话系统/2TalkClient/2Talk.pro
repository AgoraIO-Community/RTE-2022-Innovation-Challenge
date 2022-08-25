QT       += core gui network
greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++17
RC_ICONS = AppIcon.ico

SDKPATHNAME=libs
SDKLIBPATHNAME=x86
SDKDLLPATHNAME=x86

!contains(QMAKE_TARGET.arch, x86_64) {
  SDKLIBPATHNAME=x86
  SDKDLLPATHNAME=x86
} else {
  SDKLIBPATHNAME=x86_64
  SDKDLLPATHNAME=x86_64
}

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    main.cpp \
    mainwindow.cpp \
    agoraconfig.cpp \
    agoraobject.cpp \
    agoraqtjson.cpp \
    localview.cpp \
    remoteview.cpp

HEADERS += \
    mainwindow.h \
    msg.h \
    agoraconfig.h \
    agoraobject.h \
    agoraqtjson.h \
    localview.h \
    remoteview.h

FORMS += \
    mainwindow.ui \
    localview.ui \
    remoteview.ui

RESOURCES += \
    2talk.qrc

DISTFILES += \
    uiresource/OVC-win-more users.jpg \
    uiresource/icon-back hover.png \
    uiresource/icon-camera hover.png \
    uiresource/icon-camera off.png \
    uiresource/icon-close hover.png \
    uiresource/icon-hang up hover.png \
    uiresource/icon-hang up.png \
    uiresource/icon-micorophone hover.png \
    uiresource/icon-micorophone off.png \
    uiresource/icon-setting hover.png

AGORASDKPATH = $$PWD/$${SDKPATHNAME}
AGORASDKDLLPATH = .\\$${SDKPATHNAME}\\$${SDKDLLPATHNAME}

win32: {
    INCLUDEPATH += $${AGORASDKPATH}/include
    LIBS += -L$${AGORASDKPATH}/$${SDKLIBPATHNAME} -lagora_rtc_sdk
    LIBS += User32.LIB

    CONFIG(debug, debug|release) {
      QMAKE_POST_LINK +=  copy $${AGORASDKDLLPATH}\*.dll .\Debug
    } else {
      QMAKE_POST_LINK +=  copy $${AGORASDKDLLPATH}\*.dll .\Release
      QMAKE_POST_LINK += && windeployqt Release\OpenVideoCall.exe
    }

}

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target
