package com.lambo.robot.model.msgs;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

import java.io.Serializable;

/**
 * 听.
 * Created by lambo on 2017/7/25.
 */
public class ListeningMsg extends RobotMsg<Serializable> {

    public ListeningMsg() {
        super(MsgTypeEnum.listening);
    }
}
