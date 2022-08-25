package com.lambo.robot;

import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.msgs.SystemMsg;

/**
 * 应用程序.
 * Created by lambo on 2017/7/24.
 */
public interface IApp {

    /**
     * 退出程序.
     *
     * @param exitCode 退出.
     */
    default void exit(int exitCode) {
    }

    /**
     * 应用程序进行一次初始化操作.
     *
     * @param appContext 当前app的上下文.
     */
    void init(RobotAppContext appContext);

    /**
     * 消息处理器.
     *
     * @param appContext 当前应用上下文..
     * @param msg        消息.
     */
    boolean handle(RobotAppContext appContext, RobotMsg<?> msg) throws Exception;

    /**
     * 消息处理器.
     *
     * @param systemContext 当前应用上下文..
     * @param msg           消息.
     */
    default void handleSystemMsg(RobotSystemContext systemContext, SystemMsg msg) {
    }
}
