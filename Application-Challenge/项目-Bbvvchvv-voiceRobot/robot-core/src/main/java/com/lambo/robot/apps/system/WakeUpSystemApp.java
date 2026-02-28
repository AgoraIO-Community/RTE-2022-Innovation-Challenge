package com.lambo.robot.apps.system;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.drivers.wakes.IWakeUp;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.ListeningMsg;
import com.lambo.robot.model.msgs.SystemMsg;
import com.lambo.robot.model.msgs.WaitWakeUpMsg;
import com.lambo.robot.model.msgs.WakeUpMsg;

/**
 * 系统唤醒应用.
 * Created by lambo on 2017/7/24.
 */
public class WakeUpSystemApp extends BaseDriverApp {
    private final IWakeUp wakeUp;

    public WakeUpSystemApp(IWakeUp wakeUp) {
        super(MsgTypeEnum.waitWakeUp, MsgTypeEnum.wakeUp);
        this.wakeUp = wakeUp;
    }

    @Override
    public void init(RobotAppContext appContext) {
        super.init(appContext);
    }

    @Override
    public void handleSystemMsg(RobotSystemContext systemContext, SystemMsg msg) {
        if (msg.getContent() == SystemMsgContentEnum.startUp) {
            systemContext.addMsg(null, new WaitWakeUpMsg());
        }
        if (msg.getContent() == SystemMsgContentEnum.interrupt) {
            wakeUp.interrupt();
        }
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        if (MsgTypeEnum.waitWakeUp == robotMsg.getMsgType()) {
            if (!appContext.getSystemContext().isWaitWakeUp()) {
                try {
                    appContext.getSystemContext().getWaitWakeUpState().incrementAndGet();
                    appContext.addMsg(wakeUp.waitWakeUp());
                } finally {
                    appContext.getSystemContext().getWaitWakeUpState().decrementAndGet();
                }
            }
            return true;
        }
        if (MsgTypeEnum.wakeUp == robotMsg.getMsgType()) {
            WakeUpMsg wakeUpMsg = (WakeUpMsg) robotMsg;
            appContext.getSystemContext().setWakeUpUid(wakeUpMsg.getUid());
            appContext.addMsg(new ListeningMsg());
            return true;
        }
        return false;
    }
}
