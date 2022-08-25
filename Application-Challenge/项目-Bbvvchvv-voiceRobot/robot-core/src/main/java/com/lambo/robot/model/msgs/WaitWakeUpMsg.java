package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

/**
 * 机器人听到.
 * Created by lambo on 2017/7/23.
 */
public class WaitWakeUpMsg extends RobotMsg<String> {

    public WaitWakeUpMsg() {
        super(MsgTypeEnum.waitWakeUp, null);
    }
}
