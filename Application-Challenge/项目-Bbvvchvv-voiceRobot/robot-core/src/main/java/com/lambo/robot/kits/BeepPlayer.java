package com.lambo.robot.kits;

import com.lambo.los.kits.io.IOKit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;

/**
 * 播放器.
 * Created by lambo on 2017/7/23.
 */
public class BeepPlayer extends AudioPlayer {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private byte[] beep_hi;

    public void beepHi() {
        if (null == beep_hi) {
            try {
                InputStream inputStream = IOKit.getInputStream("classpath:/beep_hi.wav");
                beep_hi = IOKit.readToByteBuffer(inputStream);
                IOKit.closeIo(inputStream);
            } catch (IOException e) {
                logger.error("load beep_hi failed", e);
            }
        }
        try {
            playWAV(beep_hi);
        } catch (Exception e) {
            logger.error("beepHi failed", e);
        }
    }

    private byte[] beep_lo;

    public void beepLo() {
        if (null == beep_lo) {
            try {
                InputStream inputStream = IOKit.getInputStream("classpath:/beep_lo.wav");
                beep_lo = IOKit.readToByteBuffer(inputStream);
                IOKit.closeIo(inputStream);
            } catch (IOException e) {
                logger.error("load beep_lo failed", e);
            }
        }
        try {
            playWAV(beep_lo);
        } catch (Exception e) {
            logger.error("beepHi failed", e);
        }
    }
}
