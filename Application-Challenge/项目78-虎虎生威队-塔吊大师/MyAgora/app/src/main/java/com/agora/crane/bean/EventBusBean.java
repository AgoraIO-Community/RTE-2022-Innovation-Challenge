package com.agora.crane.bean;

/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction  EventBus事件实体类
 */
public class EventBusBean {

    private int type ;

    private String content;

    /**
     * 添加好友成功
     */
    public static final int TYPE_ADD_FRIEND_SUCCESS = 10;

    /**
     * 创建群聊成功
     */
    public static final int TYPE_CREATE_GROUP_SUCCESS = 11;

    /**
     * 加入群聊成功
     */
    public static final int TYPE_JOIN_GROUP_SUCCESS = 12;

    /**
     * 退出/解散群聊成功
     */
    public static final int TYPE_LEAVE_GROUP_SUCCESS = 13;

    /**
     * 操作指令
     */
    public static final int TYPE_ORDER = 14;


    /**
     * 构造方法
     * @param type  消息类型
     */
    public EventBusBean(int type){
        this.type = type;
    }

    /**
     * 获取消息类型
     * @return  消息类型
     */
    public int getType(){
        return type;
    }

    /**
     * 获取消息内容
     * @return 消息内容
     */
    public String getContent() {
        return content == null ? "" : content;
    }

    /**
     * 设置消息内容
     * @return 消息内容
     */
    public void setContent(String content) {
        this.content = content;
    }
}
