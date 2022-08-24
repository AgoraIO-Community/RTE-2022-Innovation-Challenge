#ifndef MSG_H
#define MSG_H

#include  <QTcpSocket>
#define SERVER_IP "192.168.0.106"
#define SERVER_PORT 9734

#define TYPE_LOGIN 1
#define TYPE_LOGIN_SIZE 30
#define TYPE_LOGIN_REPLY 2
#define TYPE_LOGIN_REPLY_SIZE 1
#define TYPE_CALL 3
#define TYPE_CALL_SIZE 30
#define TYPE_CALL_REPLY 4
#define TYPE_CALL_REPLY_SIZE 31
#define TYPE_CALL_TO 5
#define TYPE_CALL_TO_SIZE 30

#pragma pack(1)
typedef struct MsgLogin
{
    uint8_t type; //消息类型
    char mobile[30];
} MsgLogin;

typedef struct ReplyLogin
{
    uint8_t result;
} ReplyLogin;

typedef struct MsgCall
{
    uint8_t type;
    char mobile[30];
} MsgCall;

typedef struct MsgCallTo
{
    char mobile[30];
} MsgCallTo;

typedef struct ReplyCall
{
    /*
     * result 编号
     * 1 拨打的号码未登陆
     * 2 拨号信息已发送到对面，可以调 声网的 API
     * 3 对面拒绝接听
     * 4 对面接听
     * */
    uint8_t result;
    char mobile[30];
} ReplyCall;

typedef struct ReplyCallFull
{
    uint8_t type;
    uint8_t result;
    char mobile[30];
} ReplyCallFull;

#pragma pack()

#endif // MSG_H
