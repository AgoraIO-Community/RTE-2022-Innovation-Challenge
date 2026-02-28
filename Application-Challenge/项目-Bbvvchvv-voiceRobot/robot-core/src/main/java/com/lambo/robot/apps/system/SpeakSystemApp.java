package com.lambo.robot.apps.system;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.drivers.speaks.ISpeak;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.SpeakMsg;

/**
 * 讲述内容的系统应用.
 * Created by lambo on 2017/7/25.
 */
public class SpeakSystemApp extends BaseDriverApp {

    private final ISpeak speak;

    public SpeakSystemApp(ISpeak speak) {
        super(MsgTypeEnum.speak);
        this.speak = speak;
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        SpeakMsg speakMsg = (SpeakMsg) robotMsg;
        speakMsg.setUid(appContext.getSystemContext().getWakeUpUid());
        speak.say(speakMsg);
        return true;
    }

    @Override
    public void interrupt() {
        speak.interrupt();
    }
}
