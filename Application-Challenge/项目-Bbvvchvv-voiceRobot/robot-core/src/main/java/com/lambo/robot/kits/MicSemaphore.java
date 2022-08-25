package com.lambo.robot.kits;

import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * 麦克风信号量，只允许一个程序访问麦克风.
 * Created by lambo on 2017/7/27.
 */
public class MicSemaphore {
    private static final Semaphore mic = new Semaphore(1);

    public static void release() {
        mic.release();
    }

    public static void tryAcquire(long timeout) throws InterruptedException {
        mic.tryAcquire(timeout, TimeUnit.MILLISECONDS);
    }
}
