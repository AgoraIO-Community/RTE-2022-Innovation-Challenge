package com.lambo.robot.apps.user;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.apis.impl.TuLingRobotApi;
import com.lambo.robot.apps.MsgTypeBaseApp;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.SpeakMsg;

/**
 * 图灵机器人.
 * Created by lambo on 2017/7/25.
 */
public class TuLingRobotApp extends MsgTypeBaseApp {
    private TuLingRobotApi tuLingRobotApi;
    private boolean interrupt = false;

    public TuLingRobotApp() {
        super(MsgTypeEnum.hear);
    }

    @Override
    public void init(RobotAppContext appContext) {
        tuLingRobotApi = appContext.getRobotConfig().getTuLingRobotApi();
        super.init(appContext);
        appContext.setRunningLevel(Integer.MAX_VALUE);
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        HearMsg hearMsg = (HearMsg) robotMsg;
        interrupt = false;
        if (null == tuLingRobotApi) {
            appContext.addMsg(new SpeakMsg("您还没有配置图灵机器人."));
            return true;
        }
        String ask = tuLingRobotApi.ask(appContext.getSystemContext().getWakeUpUid(), hearMsg.getContent());
        if (!interrupt) {
            if (null == ask) {
                appContext.addMsg(new SpeakMsg("图灵机器人访问失败."));
                return false;
            }
            appContext.addMsg(new SpeakMsg(ask));
        }
        return true;
    }

    @Override
    public void interrupt() {
        interrupt = true;
    }
}
