package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

/**
 * 打断消息。
 * Created by lambo on 2017/7/25.
 */
public class InterruptMsg extends RobotMsg<MsgTypeEnum[]> {

    public InterruptMsg(MsgTypeEnum... msgType) {
        super(MsgTypeEnum.interrupt, msgType);
    }
}
