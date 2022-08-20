#ifndef LOCALVIEW_H
#define LOCALVIEW_H
#include <QMainWindow>

QT_BEGIN_NAMESPACE
namespace Ui { class LocalView; }
QT_END_NAMESPACE


class LocalView : public QMainWindow
{
    Q_OBJECT

public:
    LocalView(QWidget *parent = nullptr);
    ~LocalView();
    void bind_window();
protected:
    void closeEvent(QCloseEvent *event);
private slots:

signals:
    void quit_channel();

private:
    Ui::LocalView *ui;


};

#endif // LOCALVIEW_H

