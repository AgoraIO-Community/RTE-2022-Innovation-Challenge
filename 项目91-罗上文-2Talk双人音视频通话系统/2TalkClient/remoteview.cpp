#include "remoteview.h"
#include "ui_remoteview.h"
#include "agoraobject.h"

void RemoteView::closeEvent(QCloseEvent*)
{
  emit quit_channel();
}

RemoteView::RemoteView(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::RemoteView)
{
    ui->setupUi(this);
}

void RemoteView::bind_window(int uid)
{
    QWidget* pWidget = ui->widget_r;
    CAgoraObject::getInstance()
            ->RemoteVideoRender(uid,(HWND)(pWidget->winId()), RENDER_MODE_FIT);
}

RemoteView::~RemoteView()
{
    delete ui;
}
