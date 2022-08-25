package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.VoiceData;
import com.lambo.robot.model.enums.MsgTypeEnum;

/**
 * 录音消息.
 * Created by lambo on 2017/7/25.
 */
public class VoiceDataMsg extends RobotMsg<VoiceData> {
    private String uid;

    public VoiceDataMsg(VoiceData voiceData) {
        super(MsgTypeEnum.voiceData, voiceData);
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }
}
