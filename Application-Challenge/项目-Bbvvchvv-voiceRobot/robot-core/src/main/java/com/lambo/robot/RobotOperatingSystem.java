package com.lambo.robot;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.SystemMsg;
import com.lambo.robot.model.msgs.WaitWakeUpMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 操作系统.
 * Created by lambo on 2017/7/24.
 */
public class RobotOperatingSystem implements IRobotOperatingSystem, Runnable {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final RobotSystemContext systemContext;

    public RobotOperatingSystem(RobotConfig robotConfig) {
        this.systemContext = new RobotSystemContext(robotConfig);
    }

    @Override
    public void install(IApp app) {
        systemContext.getAppManager().install(systemContext, app);
        logger.info("install app success, app = {}", app);
    }

    @Override
    public void run() {
        systemContext.addMsg(null, new SystemMsg(SystemMsgContentEnum.startUp));//通知程序我启动了。
        AtomicInteger runNum = new AtomicInteger(0);
        AtomicBoolean interrupt = new AtomicBoolean(false);
        while (true) {
            try {
                RobotMsg<?> robotMsg = systemContext.getMsgManager().poolRobotMsg(3000);
                if (null != robotMsg) {
                    logger.info("poolRobotMsg , robotMsg = {}", robotMsg);
                    runNum.incrementAndGet();
                    new Thread(() -> {
                        try {
                            Thread.currentThread().setName(robotMsg.getMsgType().name() + "-" + Thread.currentThread().getId());
                            if (robotMsg.getMsgType() == MsgTypeEnum.interrupt ||
                                    robotMsg.getMsgType() == MsgTypeEnum.listening ||
                                    (robotMsg.getMsgType() == MsgTypeEnum.system && robotMsg.getContent() == SystemMsgContentEnum.interrupt)) {
                                interrupt.set(true);
                            }
                            logger.debug("====  msgHandle start , robotMsg = {}", robotMsg);
                            systemContext.getAppManager().msgHandle(systemContext, robotMsg);
                        } catch (Exception e) {
                            logger.info("msgHandle failed , robotMsg = {}", robotMsg, e);
                        } finally {
                            logger.debug("====  msgHandle end , robotMsg = {}", robotMsg);
                            runNum.decrementAndGet();
                        }
                    }).start();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            if (interrupt.get() && runNum.get() == 1 && systemContext.isWaitWakeUp()) {
                logger.debug("add SystemMsg - interruptReset");
                systemContext.addMsg(null, new SystemMsg(SystemMsgContentEnum.interruptReset));
                interrupt.set(false);
            }
            //当前没有可用的任务.并且没有可用的唤醒.
            if (runNum.get() <= 0 && !systemContext.isWaitWakeUp() &&
                    null != systemContext.getAppManager().getAppListByMsgTypeEnum(MsgTypeEnum.waitWakeUp)) {
                logger.debug("add WaitWakeUpMsg, no run");
                systemContext.addMsg(null, new WaitWakeUpMsg());
            }
        }
    }

    @Override
    public void halt() {
        systemContext.halt();
    }
}
