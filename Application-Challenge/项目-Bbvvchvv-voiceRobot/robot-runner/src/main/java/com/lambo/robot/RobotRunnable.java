package com.lambo.robot;

import com.lambo.los.kits.RunnableMainRunner;
import com.lambo.robot.apps.system.RecordSystemApp;
import com.lambo.robot.apps.system.SpeakSystemApp;
import com.lambo.robot.apps.system.VoiceDataBaiDuSystemApp;
import com.lambo.robot.apps.system.WakeUpSystemApp;
import com.lambo.robot.apps.user.MusicNetPlayApp;
import com.lambo.robot.apps.user.TuLingRobotApp;
import com.lambo.robot.apps.user.VolumeApp;
import com.lambo.robot.apps.user.WebServerApp;
import com.lambo.robot.drivers.records.impl.JavaSoundRecordImpl;
import com.lambo.robot.drivers.speaks.ISpeak;
import com.lambo.robot.drivers.speaks.impl.BaiDuVoiceSpeakImpl;
import com.lambo.robot.drivers.wakes.IWakeUp;
import com.lambo.robot.drivers.wakes.impl.SnowBoyWakeUpImpl;
import com.lambo.robot.drivers.wakes.impl.SystemReadWakeUpImpl;
import com.lambo.robot.model.msgs.SpeakMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * test.
 * Created by Administrator on 2017/7/20.
 */
public class RobotRunnable implements Runnable {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @RunnableMainRunner.Value
    private String test;

    @RunnableMainRunner.Value
    private String noRecord;

    @RunnableMainRunner.Value
    private String noWakeUp;

    @Override
    public void run() {
        try {
            String configPath = "profile.yml";
            if (!new File(configPath).exists()) {
                configPath = "classpath:/" + configPath;
            }
            RobotConfig robotConfig = RobotConfig.getRobotConfig(configPath);

            IWakeUp wakeUp = null;
            if(!"true".equals(noWakeUp)) {
                if ("true".equalsIgnoreCase(test)) {
                    wakeUp = new SystemReadWakeUpImpl();
                } else {
                    wakeUp = new SnowBoyWakeUpImpl(robotConfig);
                }
            }

            ISpeak speak = new BaiDuVoiceSpeakImpl(robotConfig.getVoiceApi());

            IRobotOperatingSystem system = new RobotOperatingSystem(robotConfig);
            //使用系统输入作为唤醒的应用.

            if(!"true".equals(noWakeUp)) {
                system.install(new WakeUpSystemApp(wakeUp));
            }
            system.install(new SpeakSystemApp(speak));
            system.install(new VolumeApp());
//            system.install(new SpeakSystemOutApp());
            system.install(new VoiceDataBaiDuSystemApp(robotConfig.getVoiceApi()));
            system.install(new WebServerApp(robotConfig.webPort));
            if (!"true".equals(noRecord)) {
                system.install(new RecordSystemApp(new JavaSoundRecordImpl(robotConfig)));
            }
            system.install(new MusicNetPlayApp(robotConfig.getMusicNetApi()));
            system.install(new TuLingRobotApp());

            speak.say(new SpeakMsg(robotConfig.getWelcomeMsg()));
            system.run();
        } catch (Exception e) {
            logger.error("robot start failed", e);
        }
    }
}
