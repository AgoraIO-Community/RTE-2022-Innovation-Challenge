package com.lambo.robot.apps;

import com.lambo.robot.IApp;
import com.lambo.robot.IInterruptListener;
import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.SystemMsg;

/**
 * 消息类型的基础应用.
 * Created by lambo on 2017/7/25.
 */
public abstract class MsgTypeBaseApp implements IApp, IInterruptListener {
    protected final MsgTypeEnum[] msgTypeEnums;

    public MsgTypeBaseApp(MsgTypeEnum... msgTypeEnums) {
        this.msgTypeEnums = msgTypeEnums;
    }

    @Override
    public void exit(int exitCode) {
    }

    @Override
    public void init(RobotAppContext appContext) {
        appContext.regListener(msgTypeEnums);
    }


    @Override
    public void handleSystemMsg(RobotSystemContext systemContext, SystemMsg msg) {
        if (msg.getContent() == SystemMsgContentEnum.interrupt) {
            interrupt();
        }
    }

    @Override
    public void interrupt() {

    }
}
