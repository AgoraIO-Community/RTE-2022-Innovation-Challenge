package com.lambo.robot.manager;

import com.lambo.robot.IApp;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;

import java.util.List;

/**
 * 应用管理器.
 * Created by lambo on 2017/7/25.
 */
public interface IAppManager {

    /**
     * 获取应用列表。
     * @param msgTypeEnum
     * @return
     */
    List<IApp> getAppListByMsgTypeEnum(MsgTypeEnum msgTypeEnum);

    /**
     * 安装应用.
     *
     * @param app
     */
    void install(RobotSystemContext systemContext, IApp app);

    /**
     * 注册消息监听.
     *
     * @param app
     * @param msgTypeArgs
     */
    void regListener(IApp app, MsgTypeEnum... msgTypeArgs);

    /**
     * 移除监听.
     *
     * @param app
     */
    void removeListener(IApp app);

    /**
     * 消息处理器.
     *
     * @param systemContext
     * @param robotMsg
     * @return
     * @throws Exception
     */
    boolean msgHandle(RobotSystemContext systemContext, RobotMsg<?> robotMsg) throws Exception;

    /**
     * 关闭.
     */
    void halt();
}
