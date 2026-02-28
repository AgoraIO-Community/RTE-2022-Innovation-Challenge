package com.lambo.robot.manager.impl;

import com.lambo.robot.manager.IMsgManager;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

/**
 * 消息管理器.
 * Created by lambo on 2017/7/25.
 */
public class MsgManagerImpl implements IMsgManager {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    /**
     * 消息队列.
     */
    private final Map<MsgTypeEnum, List<CompletableFuture<RobotMsg<?>>>> robotMsgQueueMap;
    private final LinkedBlockingQueue<RobotMsg<?>> robotMsgQueue = new LinkedBlockingQueue<>();

    public MsgManagerImpl() {
        robotMsgQueueMap = new HashMap<>();
        for (MsgTypeEnum msgTypeEnum : MsgTypeEnum.values()) {
            robotMsgQueueMap.put(msgTypeEnum, new LinkedList<>());
        }
    }

    @Override
    public void addRobotMsg(RobotMsg<?> robotMsg) {
        synchronized (robotMsg.getMsgType()) {
            synchronized (robotMsgQueueMap) {
                if (robotMsgQueueMap.get(robotMsg.getMsgType()).size() > 0) {
                    CompletableFuture<RobotMsg<?>> robotMsgCompletableFuture = robotMsgQueueMap.get(robotMsg.getMsgType()).get(0);
                    robotMsgCompletableFuture.complete(robotMsg);
                    robotMsgQueueMap.get(robotMsg.getMsgType()).remove(robotMsgCompletableFuture);
                    return;
                }
            }
        }
        robotMsgQueue.offer(robotMsg);
    }

    @Override
    public RobotMsg<?> getRobotMsg(MsgTypeEnum msgTypeEnum, int timeOut) throws InterruptedException, TimeoutException, ExecutionException {
        CompletableFuture<RobotMsg<?>> completableFuture = new CompletableFuture<>();
        synchronized (robotMsgQueueMap) {
            robotMsgQueueMap.get(msgTypeEnum).add(completableFuture);
        }
        RobotMsg<?> robotMsg = null;
        try {
            robotMsg = completableFuture.get(timeOut, TimeUnit.MILLISECONDS);
        } finally {
            robotMsgQueueMap.get(msgTypeEnum).remove(completableFuture);
        }
        return robotMsg;
    }

    @Override
    public RobotMsg<?> poolRobotMsg(int timeOut) throws InterruptedException {
        return this.robotMsgQueue.poll(timeOut, TimeUnit.MILLISECONDS);
    }
}
