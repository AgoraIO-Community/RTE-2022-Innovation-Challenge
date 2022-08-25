package com.lambo.robot.drivers.speaks;

import com.lambo.robot.drivers.IDriver;
import com.lambo.robot.model.msgs.SpeakMsg;

/**
 * 机器人嘴巴.
 * Created by lambo on 2017/7/23.
 */
public interface ISpeak extends IDriver {

    /**
     * 讲述一件事情.
     *
     * @param speakContent
     */
    void say(SpeakMsg speakContent) throws Exception;
}
