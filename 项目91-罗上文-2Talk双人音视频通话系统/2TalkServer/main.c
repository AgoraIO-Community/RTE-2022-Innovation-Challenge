#include "main.h"
# include <stdio.h>
# include <stdlib.h>

#define MAXLEN 1024
#define SERV_PORT 9734
#define MAX_OPEN_FD 1024

char my_maps[1000][100] = {0};

int main(int argc,char *argv[])
{
    int  listenfd,connfd,efd,ret;
    int bytes;
    char buf[MAXLEN];
    u_int8_t msg_type;
    struct sockaddr_in cliaddr,servaddr;
    socklen_t clilen = sizeof(cliaddr);
    struct epoll_event tep,ep[MAX_OPEN_FD];

    listenfd = socket(AF_INET,SOCK_STREAM,0);
    int on = 1;
    ret = setsockopt( listenfd, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on) );
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(SERV_PORT);
    ret = bind(listenfd,(struct sockaddr*)&servaddr,sizeof(servaddr));
    if( 0 != ret ){
        printf("bind fail,another process is running\n");
        return ret;
    }
    ret = listen(listenfd,20);

    // 创建一个epoll fd
    efd = epoll_create(MAX_OPEN_FD);
    tep.events = EPOLLIN;
    tep.data.fd = listenfd;
    // 把监听socket 先添加到efd中
    epoll_ctl(efd,EPOLL_CTL_ADD,listenfd,&tep);

    map_int_t m;
    map_init(&m);
    // 循环等待
    for (;;)
    {
        // 返回已就绪的epoll_event,-1表示阻塞,没有就绪的epoll_event,将一直等待
        size_t nready = epoll_wait(efd,ep,MAX_OPEN_FD,-1);
        for (int i = 0; i < nready; ++i)
        {
            // 如果是新的连接,需要把新的socket添加到efd中
            if (ep[i].data.fd == listenfd )
            {
                connfd = accept(listenfd,(struct sockaddr*)&cliaddr,&clilen);
                printf("client[%d] connect\n", connfd);
                tep.events = EPOLLIN;
                tep.data.fd = connfd;
                ret = epoll_ctl(efd,EPOLL_CTL_ADD,connfd,&tep);
            }else{
                connfd = ep[i].data.fd;
                bytes = read(connfd,&msg_type,1);
                // 客户端关闭连接
                if (bytes == 0){
                    ret =epoll_ctl(efd,EPOLL_CTL_DEL,connfd,NULL);
                    close(connfd);
                    printf("client[%d] closed\n", i);
                }else{
                    if( TYPE_LOGIN == msg_type ){
                        bytes = read(connfd,buf,TYPE_LOGIN_SIZE);
                        if( bytes != TYPE_LOGIN_SIZE ){
                            //TODO，用 GOTO 读取到足够的数据再走。不过这样会阻塞线程，会被攻击。
                            //补充：应该丢给 epoll。
                            printf("error no enough \n");
                            break;
                        }

                        //把 buf 转成结构体。
                        struct MsgLogin* msgLogin = ((struct MsgLogin* )buf);
                        printf("mobile is %s \n",msgLogin->mobile);

                        //绑定手机号 跟 fd
                        map_set(&m, msgLogin->mobile, connfd);
                        strcpy(my_maps[connfd],msgLogin->mobile);

                        ReplyLogin replyLogin;
                        replyLogin.type = TYPE_LOGIN_REPLY;
                        replyLogin.result = 1;
                        // 向客户端发送 登录 token。
                        write(connfd,&replyLogin,sizeof(replyLogin));
                    }
                    else if( TYPE_CALL == msg_type ){
                        bytes = read(connfd,buf,TYPE_CALL_SIZE);
                        if( bytes != TYPE_CALL_SIZE ){
                            printf("error no enough \n");
                            break;
                        }

                        struct MsgCall* msgCall = ((struct MsgCall* )buf);
                        printf("call mobile is %s \n",msgCall->mobile);

                        ReplyCall replyCall;
                        replyCall.type = TYPE_CALL_REPLY;

                        //找到 call mobile 对应的 fd
                        int *call_fd = map_get(&m, msgCall->mobile);
                        if (call_fd) {
                            //发送一条信息给 对面，
                            MsgCallTo msgCallTo;
                            msgCallTo.type = TYPE_CALL_TO;

                            strcpy(msgCallTo.mobile,my_maps[connfd]);
                            write(*call_fd,&msgCallTo,sizeof(msgCallTo));

                            printf("call mobile send\n");
                            replyCall.result = 2;
                            write(connfd,&replyCall,sizeof(replyCall));
                        } else {
                            //返回信息给客户端，对面未登陆。
                            printf("call mobile not login\n");
                            replyCall.result = 1;
                            strcpy(replyCall.mobile,msgCall->mobile);
                            write(connfd,&replyCall,sizeof(replyCall));
                        }
                    }
                    else if( TYPE_CALL_REPLY == msg_type ) {
                        bytes = read(connfd,buf,31);
                        if( bytes != 31 ){
                            printf("error no enough \n");
                            break;
                        }

                        struct ReplyCallSmall* replyCallSmall = ((struct ReplyCallSmall* )buf);
                        printf("reject mobile is %s \n",replyCallSmall->mobile);

                        int *send_fd = map_get(&m, replyCallSmall->mobile);

                        ReplyCall replyCall;
                        replyCall.type = TYPE_CALL_REPLY;
                        replyCall.result = 3;

                        strcpy(replyCall.mobile,replyCallSmall->mobile);
                        write(*send_fd,&replyCall,sizeof(replyCall));
                    }

                }
            }
        }
    }

    map_deinit(&m);
    return 0;
}