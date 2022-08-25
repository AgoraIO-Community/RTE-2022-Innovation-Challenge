package com.lambo.robot;

import com.lambo.robot.drivers.wakes.IWakeUp;
import com.lambo.robot.drivers.wakes.impl.SnowBoyWakeUpImpl;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * 热歌.
 * Created by lambo on 2017/7/21.
 */
public class SnowBoyRunnable implements Runnable {

    @Override
    public void run() {
        try {
            String configPath = "profile.yml";
            if (!new File(configPath).exists()) {
                configPath = "classpath:/" + configPath;
            }
            RobotConfig robotConfig = RobotConfig.getRobotConfig(configPath);
            IWakeUp wakeUp = new SnowBoyWakeUpImpl(robotConfig);
            while (true) {
                System.out.println(wakeUp.waitWakeUp());
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }
}
