package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

import java.io.Serializable;

/**
 * 唤醒.消息 .
 * Created by Administrator on 2017/7/23.
 */
public class WakeUpMsg extends RobotMsg<Serializable> {
    public final String uid;

    public WakeUpMsg() {
        this(null);
    }

    public WakeUpMsg(String uid) {
        super(MsgTypeEnum.wakeUp);
        this.uid = uid;
    }

    public String getUid() {
        return uid;
    }
}
