package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;

/**
 * 系统消息 .
 * Created by Administrator on 2017/7/23.
 */
public class SystemMsg extends RobotMsg<SystemMsgContentEnum> {

    public SystemMsg(SystemMsgContentEnum content) {
        super(MsgTypeEnum.system, content);
    }
}
