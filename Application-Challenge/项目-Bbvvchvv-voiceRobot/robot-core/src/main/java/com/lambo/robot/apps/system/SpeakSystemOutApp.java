package com.lambo.robot.apps.system;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.SpeakMsg;

/**
 * 讲述内容的系统应用.
 * Created by lambo on 2017/7/25.
 */
public class SpeakSystemOutApp extends BaseDriverApp {

    public SpeakSystemOutApp() {
        super(MsgTypeEnum.speak);
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        SpeakMsg speakMsg = (SpeakMsg) robotMsg;
        System.out.println(speakMsg.getContent());
        return true;
    }

    @Override
    public void interrupt() {
    }
}
