package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

/**
 * 机器人说.
 * Created by lambo on 2017/7/23.
 */
public class SpeakMsg extends RobotMsg<String> {

    private String uid;

    public SpeakMsg(String content) {
        super(MsgTypeEnum.speak, content);
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getUid() {
        return uid;
    }
}
