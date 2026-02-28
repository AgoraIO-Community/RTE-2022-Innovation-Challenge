package com.lambo.robot.model;

import com.lambo.robot.model.enums.MsgStateEnum;
import com.lambo.robot.model.enums.MsgTypeEnum;

import java.io.Serializable;
import java.util.UUID;

/**
 * 机器获取的内容.
 * Created by lambo on 2017/7/23.
 */
public class RobotMsg<T extends Serializable> {

    /**
     * 消息id.
     */
    private final String msgId;
    /**
     * 目标应用的运行id.
     */
    protected int targetPid = 0;

    /**
     * 消息类型.
     */
    protected final MsgTypeEnum msgType;

    /**
     * 消息状态代码.-1.未定义.
     */
    private MsgStateEnum msgState;

    /**
     * 内容.
     */
    private final T content;

    public RobotMsg(MsgTypeEnum msgType) {
        this(msgType, MsgStateEnum.success, null);
    }

    public RobotMsg(MsgTypeEnum msgType, T content) {
        this(msgType, MsgStateEnum.success, content);
    }

    public RobotMsg(MsgTypeEnum msgType, MsgStateEnum msgState, T content) {
        this.msgId = UUID.randomUUID().toString();
        this.msgType = msgType;
        this.msgState = msgState;
        this.content = content;
    }

    public void setTargetPid(int targetPid) {
        this.targetPid = targetPid;
    }

    public int getTargetPid() {
        return targetPid;
    }

    public MsgTypeEnum getMsgType() {
        return msgType;
    }

    public MsgStateEnum getMsgState() {
        return msgState;
    }

    public void setMsgState(MsgStateEnum msgState) {
        this.msgState = msgState;
    }

    public T getContent() {
        return content;
    }

    public String getMsgId() {
        return msgId;
    }

    public boolean isSuccess() {
        return MsgStateEnum.success == msgState;
    }

    public <B extends RobotMsg<T>> B success() {
        this.msgState = MsgStateEnum.success;
        return returnThis();
    }

    private <B extends RobotMsg<T>> B returnThis() {
        return (B) this;
    }

    public <B extends RobotMsg<T>> B failed() {
        this.msgState = MsgStateEnum.failed;
        return returnThis();
    }

    public <B extends RobotMsg<T>> B interrupt() {
        this.msgState = MsgStateEnum.interrupt;
        return returnThis();
    }

    public <B extends RobotMsg<T>> B timeOut() {
        this.msgState = MsgStateEnum.timeOut;
        return returnThis();
    }

    public <B extends RobotMsg<T>> B exception() {
        this.msgState = MsgStateEnum.exception;
        return returnThis();
    }

    public <B extends RobotMsg<T>> B noContent() {
        this.msgState = MsgStateEnum.noContent;
        return returnThis();
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "msgId='" + msgId + '\'' +
                ", targetPid=" + targetPid +
                ", msgType=" + msgType +
                ", msgState=" + msgState +
                ", content=" + content +
                '}';
    }
}
