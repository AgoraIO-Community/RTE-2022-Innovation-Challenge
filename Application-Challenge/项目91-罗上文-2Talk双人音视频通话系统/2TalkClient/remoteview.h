#ifndef REMOTEVIEW_H
#define REMOTEVIEW_H
#include <QMainWindow>

QT_BEGIN_NAMESPACE
namespace Ui { class RemoteView; }
QT_END_NAMESPACE


class RemoteView : public QMainWindow
{
    Q_OBJECT

public:
    RemoteView(QWidget *parent = nullptr);
    ~RemoteView();
    void bind_window(int uid);

protected:
    void closeEvent(QCloseEvent *event);
private slots:

signals:
    void quit_channel();

private:
    Ui::RemoteView *ui;

};

#endif // REMOTEVIEW_H

