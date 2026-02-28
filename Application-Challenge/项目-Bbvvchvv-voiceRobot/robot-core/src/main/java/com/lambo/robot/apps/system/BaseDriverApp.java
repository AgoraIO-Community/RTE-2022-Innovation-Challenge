package com.lambo.robot.apps.system;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.apps.MsgTypeBaseApp;
import com.lambo.robot.model.enums.MsgTypeEnum;

/**
 * 系统应用.
 * Created by lambo on 2017/7/25.
 */
public abstract class BaseDriverApp extends MsgTypeBaseApp {

    public BaseDriverApp(MsgTypeEnum... msgTypeEnums) {
        super(msgTypeEnums);
    }

    @Override
    public void init(RobotAppContext appContext) {
        super.init(appContext);
        appContext.setRunningLevel(-1);
    }

}
