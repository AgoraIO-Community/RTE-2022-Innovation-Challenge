package com.lambo.robot.manager;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * 消息管理器.
 * Created by lambo on 2017/7/25.
 */
public interface IMsgManager {
    void addRobotMsg(RobotMsg<?> robotMsg);

    RobotMsg<?> getRobotMsg(MsgTypeEnum msgTypeEnum, int timeOut) throws InterruptedException, TimeoutException, ExecutionException;

    RobotMsg<?> poolRobotMsg(int timeOut) throws InterruptedException;
}
