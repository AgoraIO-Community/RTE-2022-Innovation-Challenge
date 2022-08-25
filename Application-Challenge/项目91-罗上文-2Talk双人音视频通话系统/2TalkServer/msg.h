//
// Created by loken on 22-8-14.
//
#ifndef INC_2TALKSERVER_MSG_H
#define INC_2TALKSERVER_MSG_H

#define TYPE_LOGIN 1
#define TYPE_LOGIN_SIZE 30
#define TYPE_LOGIN_REPLY 2
#define TYPE_LOGIN_REPLY_SIZE 1
#define TYPE_CALL 3
#define TYPE_CALL_SIZE 30
#define TYPE_CALL_REPLY 4
#define TYPE_CALL_REPLY_SIZE 30
#define TYPE_CALL_TO 5
#define TYPE_CALL_TO_SIZE 30

#pragma pack(1)
typedef struct MsgLogin
{
    char mobile[30];
} MsgLogin;

typedef struct ReplyLogin
{
    uint8_t type;
    uint8_t result;
} ReplyLogin;

typedef struct MsgCall
{
    char mobile[30];
} MsgCall;

typedef struct MsgCallTo
{
    uint8_t type;
    char mobile[30];
} MsgCallTo;

typedef struct ReplyCall
{
    uint8_t type;
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

typedef struct ReplyCallSmall
{
    uint8_t result;
    char mobile[30];
} ReplyCallSmall;

#pragma pack()

#endif //INC_2TALKSERVER_MSG_H
