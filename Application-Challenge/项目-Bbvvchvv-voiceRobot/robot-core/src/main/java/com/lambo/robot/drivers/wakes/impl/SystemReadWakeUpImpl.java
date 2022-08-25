package com.lambo.robot.drivers.wakes.impl;

import com.lambo.robot.drivers.wakes.IWakeUp;
import com.lambo.robot.model.msgs.WakeUpMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 录音设备.
 * Created by lambo on 2017/7/22.
 */
public class SystemReadWakeUpImpl implements IWakeUp {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private boolean interrupt = false;
    private final AtomicBoolean wakeUpState = new AtomicBoolean();

    public SystemReadWakeUpImpl() {
        new Thread(() -> {
            while (true) {
                try {
                    System.in.read();
                    wakeUpState.set(true);
                    synchronized (wakeUpState) {
                        wakeUpState.notifyAll();
                    }
                } catch (IOException ignored) {
                }
            }
        }).start();
    }

    @Override
    public WakeUpMsg waitWakeUp() {
        interrupt = false;
        wakeUpState.set(false);
        while (true) {
            synchronized (wakeUpState) {
                try {
                    wakeUpState.wait(30000);
                } catch (InterruptedException ignored) {
                }
            }
            if (interrupt) {
                return new WakeUpMsg().interrupt();
            }
            if (wakeUpState.get()) {
                return new WakeUpMsg("system.in").success();
            }
        }
    }

    @Override
    public void interrupt() {
        interrupt = true;
        synchronized (wakeUpState) {
            wakeUpState.notifyAll();
        }
    }
}
