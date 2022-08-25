package com.lambo.robot.drivers.hears;

import com.lambo.robot.drivers.IDriver;
import com.lambo.robot.model.msgs.HearMsg;

/**
 * 机器人听觉.
 * Created by Administrator on 2017/7/22.
 */
public interface IHear extends IDriver {

    /**
     * 听.
     *
     * @return 听到的内容.
     */
    HearMsg listening();
}
