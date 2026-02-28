package com.lambo.robot.manager.impl;

import com.lambo.robot.IApp;
import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.manager.IAppManager;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.InterruptMsg;
import com.lambo.robot.model.msgs.SystemMsg;
import com.lambo.robot.model.msgs.WaitWakeUpMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 应用管理程序.
 * Created by lambo on 2017/7/25.
 */
public class AppManagerImpl implements IAppManager {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * 安装后的应用列表.
     */
    private final List<IApp> installAppList = new LinkedList<>();

    /**
     * 启动线程.
     */
    private final List<RobotAppContext> runningAppList = new LinkedList<>();

    /**
     * 消息监听注册列表.
     */
    protected final Map<MsgTypeEnum, List<IApp>> msgListenerRegMap = new HashMap<>();

    private final AtomicInteger pidIndex = new AtomicInteger(100);

    @Override
    public List<IApp> getAppListByMsgTypeEnum(MsgTypeEnum msgTypeEnum) {
        return msgListenerRegMap.get(msgTypeEnum);
    }

    @Override
    public void install(RobotSystemContext systemContext, IApp app) {
        installAppList.add(app);
        RobotAppContext appContext = new RobotAppContext(systemContext, app, pidIndex.incrementAndGet());
        app.init(appContext);
        this.runningAppList.add(appContext);
        this.runningAppList.sort((o1, o2) -> Integer.valueOf(o1.getRunningLevel()).compareTo(o2.getRunningLevel()));
    }

    /**
     * 注册事件.
     *
     * @param msgTypeArgs 消息类型列表.
     */
    @Override
    public synchronized void regListener(IApp app, MsgTypeEnum... msgTypeArgs) {
        for (MsgTypeEnum msgTypeEnum : msgTypeArgs) {
            logger.info("regListener app = {} on msgTypeArgs = {}", app, msgTypeEnum);
            List<IApp> appList = msgListenerRegMap.get(msgTypeEnum);
            if (null == appList) {
                appList = new ArrayList<>();
            }
            appList.add(app);
            msgListenerRegMap.put(msgTypeEnum, appList);
        }
    }

    /**
     * 删除注册事件.
     */
    @Override
    public synchronized void removeListener(IApp app) {
        msgListenerRegMap.entrySet().forEach(entry -> entry.getValue().remove(app));
    }

    @Override
    public boolean msgHandle(RobotSystemContext systemContext, RobotMsg<?> robotMsg) throws Exception {
        if (!robotMsg.isSuccess()) {
            logger.error("eventHandle failed, robotEvent = {}, robotAppContext = {}", robotMsg);
            return true;
        }
        logger.debug("eventHandle robotEvent = {}", robotMsg);

        if (robotMsg.getMsgType() == MsgTypeEnum.interrupt) {
            InterruptMsg interruptMsg = (InterruptMsg) robotMsg;
            SystemMsg systemMsg = new SystemMsg(SystemMsgContentEnum.interrupt);
            for (MsgTypeEnum msgTypeEnum : interruptMsg.getContent()) {
                List<IApp> appList = msgListenerRegMap.get(msgTypeEnum);
                if (null != appList) {
                    appList.forEach(app -> app.handleSystemMsg(systemContext, systemMsg));
                }
            }
            return true;
        }

        if (robotMsg.getMsgType() == MsgTypeEnum.system) {
            SystemMsg systemMsg = (SystemMsg) robotMsg;
            for (IApp iApp : installAppList) {
                iApp.handleSystemMsg(systemContext, systemMsg);
            }
            return true;
        }
        if (MsgTypeEnum.listening == robotMsg.getMsgType()) { //如果是听指令则打断所有录音.
            runningAppList.forEach(robotAppContext -> {
                try {
                    robotAppContext.getApp().handleSystemMsg(systemContext, new SystemMsg(SystemMsgContentEnum.interrupt));
                } catch (Exception e) {
                    logger.error("listening to interrupt running app failed", e);
                }
            });
        }
        List<IApp> appList = msgListenerRegMap.get(robotMsg.getMsgType());

        if (null == appList || appList.isEmpty()) {
            logger.debug("eventHandle failed, no app for this EventType. robotEvent = {}", robotMsg);
            return false;
        }

        RobotAppContext focus = systemContext.focus(robotMsg.getMsgType());
        if (null != focus && focus.getApp().handle(focus, robotMsg)) {
            return true;
        }
        for (RobotAppContext robotAppContext : runningAppList) {
            try {
                IApp app = robotAppContext.getApp();
                logger.debug("process by robotAppContext = {}", robotAppContext);
                if (appList.contains(app) && app != focus && app.handle(robotAppContext, robotMsg)) {
                    logger.debug("eventHandle success, robotEvent = {}, robotAppContext = {}", robotMsg, robotAppContext);
                    if (MsgTypeEnum.listening == robotMsg.getMsgType()) {
                        systemContext.addMsg(robotAppContext, new WaitWakeUpMsg());
                    }
                    return true;
                }
            } catch (TimeoutException e) {
                logger.debug("eventHandle failed, process time out, robotEvent = {}, robotAppContext = {}", robotMsg, robotAppContext);
            } catch (InterruptedException e) {
                logger.debug("eventHandle failed, process interrupted, robotEvent = {}, robotAppContext = {}", robotMsg, robotAppContext);
            } catch (Exception e) {
                logger.error("eventHandle failed, robotEvent = {}, robotAppContext = {}", robotMsg, robotAppContext, e);
            }
        }

        logger.debug("eventHandle failed, robotEvent = {}", robotMsg);
        return false;
    }

    @Override
    public void halt() {
        for (RobotAppContext appContext : runningAppList) {
            this.removeListener(appContext.getApp());
            appContext.getApp().exit(0);
        }
    }
}
