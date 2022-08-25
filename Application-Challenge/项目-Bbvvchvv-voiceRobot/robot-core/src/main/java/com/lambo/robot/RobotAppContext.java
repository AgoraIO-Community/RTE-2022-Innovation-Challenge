package com.lambo.robot;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.InterruptMsg;
import com.lambo.robot.model.msgs.ListeningMsg;
import com.lambo.robot.model.msgs.SpeakMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * 当前应用的上下文.
 * Created by lambo on 2017/7/24.
 */
public class RobotAppContext {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * 进行id.
     */
    private final int pid;

    /**
     * 当前环境所属app.
     */
    private final IApp app;

    /**
     * 查询任务运行的级别.越小越早被调用.
     */
    private int runningLevel = 300;

    /**
     * 系统上下文.
     */
    private final RobotSystemContext systemContext;

    public RobotAppContext(RobotSystemContext systemContext, IApp app, int pid) {
        this.systemContext = systemContext;
        this.app = app;
        this.pid = pid;
    }

    public RobotSystemContext getSystemContext() {
        return systemContext;
    }

    /**
     * 添加系统消息.
     *
     * @param robotMsg 应用消息.
     */
    public void addMsg(RobotMsg<?> robotMsg) {
        systemContext.addMsg(this, robotMsg);
    }

    public RobotConfig getRobotConfig() {
        return systemContext.getRobotConfig();
    }

    public IApp getApp() {
        return app;
    }

    public int getPid() {
        return pid;
    }

    public void regListener(MsgTypeEnum[] msgTypeEnums) {
        systemContext.getAppManager().regListener(app, msgTypeEnums);
    }

    public int getRunningLevel() {
        return runningLevel;
    }

    public void setRunningLevel(int runningLevel) {
        this.runningLevel = runningLevel;
    }

    @Override
    public String toString() {
        return "RobotAppContext{" +
                "pid=" + pid +
                ", app=" + app +
                ", systemContext=" + systemContext +
                '}';
    }

    public boolean say(SpeakMsg speakMsg) throws Exception {
        return systemContext.getAppManager().msgHandle(systemContext, speakMsg);
    }

    public HearMsg listening() throws InterruptedException, ExecutionException, TimeoutException {
        addMsg(new ListeningMsg());
        try {
            return (HearMsg) systemContext.getMsgManager().getRobotMsg(MsgTypeEnum.hear, 60000);
        } finally {
            addMsg(new InterruptMsg(MsgTypeEnum.listening));
        }
    }
}
