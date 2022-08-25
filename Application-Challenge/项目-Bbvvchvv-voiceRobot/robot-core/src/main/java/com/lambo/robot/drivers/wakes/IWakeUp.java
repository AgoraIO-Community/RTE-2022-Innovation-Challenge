package com.lambo.robot.drivers.wakes;

import com.lambo.robot.drivers.IDriver;
import com.lambo.robot.model.msgs.WakeUpMsg;

/**
 * 唤醒服务.
 * Created by lambo on 2017/7/22.
 */
public interface IWakeUp extends IDriver {

    /**
     * 一直阻塞，直接唤醒.
     */
    WakeUpMsg waitWakeUp();
}
