#include "localview.h"
#include "ui_localview.h"
#include "agoraobject.h"

void LocalView::closeEvent(QCloseEvent*)
{
    //用信号通知 main 窗口来退出通道。
    emit quit_channel();
}

LocalView::LocalView(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::LocalView)
{
    ui->setupUi(this);
}

void LocalView::bind_window()
{
    QWidget* pWidget = ui->widget_local;
    CAgoraObject::getInstance()->LocalVideoPreview((HWND)(pWidget->winId()),TRUE,RENDER_MODE_FIT);
}

LocalView::~LocalView()
{
    delete ui;
}
