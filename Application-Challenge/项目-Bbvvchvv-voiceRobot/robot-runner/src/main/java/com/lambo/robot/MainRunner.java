package com.lambo.robot;

import com.lambo.los.kits.RunnableMainRunner;

/**
 * main.
 * Created by lambo on 2017/7/21.
 */
public class MainRunner {
    public static void main(String[] args) {
        String type = args.length > 0 ? args[0] : "robot";
        if ("snowBoy".equalsIgnoreCase(type)) {
            RunnableMainRunner.start(SnowBoyRunnable.class, args);
            return;
        }
        if ("test".equalsIgnoreCase(type)) {
            RunnableMainRunner.start(TestRunnable.class, args);
            return;
        }
        RunnableMainRunner.start(RobotRunnable.class, args);
    }
}
