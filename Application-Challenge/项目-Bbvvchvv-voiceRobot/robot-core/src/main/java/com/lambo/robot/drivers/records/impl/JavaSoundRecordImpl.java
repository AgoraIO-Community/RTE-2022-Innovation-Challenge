package com.lambo.robot.drivers.records.impl;

import com.lambo.los.kits.ThreadKit;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.RobotConfig;
import com.lambo.robot.drivers.records.IRecord;
import com.lambo.robot.kits.BeepPlayer;
import com.lambo.robot.kits.MicSemaphore;
import com.lambo.robot.kits.RMSUtil;
import com.lambo.robot.model.VoiceData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sound.sampled.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 默认录制语音.
 * Created by lambo on 2017/7/22.
 */
public class JavaSoundRecordImpl implements IRecord {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    protected final BeepPlayer beepPlayer;

    private final DataLine.Info info;
    private final RobotConfig robotConfig;
    private boolean interrupt = false;

    public JavaSoundRecordImpl(RobotConfig robotConfig) {
        this.robotConfig = robotConfig;
        this.beepPlayer = robotConfig.getBeepPlayer();
        this.info = new DataLine.Info(TargetDataLine.class, robotConfig.getRecordAudioFormat());
    }

    @Override
    public void interrupt() {
        this.interrupt = true;
    }

    @Override
    public VoiceData record(int maxRecordTime, int minVoiceTime) throws TimeoutException, InterruptedException, LineUnavailableException {
        TargetDataLine targetDataLine = null;
        //最长的结束录音时间.超过进行超时处理。.
        long maxEndTime = System.currentTimeMillis() + maxRecordTime;
        try {
            MicSemaphore.tryAcquire(5000);
        } catch (InterruptedException e) {
            throw new TimeoutException("tryAcquire mic time out");
        }
        try {
            this.interrupt = false;
            beepPlayer.beepHi();
            ThreadKit.sleep(200);
            targetDataLine = (TargetDataLine) AudioSystem.getLine(info);
            AudioFormat recordAudioFormat = robotConfig.getRecordAudioFormat();
            targetDataLine.open(recordAudioFormat);
            targetDataLine.start();
            final AtomicBoolean run = new AtomicBoolean(true);
            ByteArrayOutputStream outputFile = new ByteArrayOutputStream();
            byte[] buf = new byte[1024];
            AtomicInteger hasVoiceTimes = new AtomicInteger(0);
            int maxTimes = robotConfig.getUnSpeakTimes(recordAudioFormat.getSampleRate(), buf.length);
            int index = -1;
            double rmsVoiceEnvNoiseDouble = 0;
            double voiceNoiseFloat = robotConfig.getVoiceNoiseFloat();
            byte[][] cache = new byte[(int) (recordAudioFormat.getSampleRate() % buf.length * 0.8)][];
            int maxNoContentTimes = 8;
            while (true) {
                int i = 0;
                outputFile.reset();
                hasVoiceTimes.set(0);
                boolean hasContent = false;
                maxNoContentTimes--;
                while (run.get() && (targetDataLine.read(buf, 0, buf.length)) == buf.length) {
                    index++;
                    cache[index % cache.length] = buf.clone();
                    if (this.interrupt) {
                        throw new InterruptedException("record interrupted");
                    }
                    if (maxNoContentTimes < 0 || System.currentTimeMillis() > maxEndTime) { //超时不再录音监听.
                        throw new TimeoutException("record time out");
                    }
                    double rms = RMSUtil.calculateVolume(buf, recordAudioFormat.getSampleSizeInBits());
                    boolean hasVoice = (rms - rmsVoiceEnvNoiseDouble) > voiceNoiseFloat;
                    if (hasVoice) {
                        logger.info("has voice rmsVoiceEnvNoiseDouble = {}, curr = {}", rmsVoiceEnvNoiseDouble, rms);
                    }
                    if (hasVoice) {
                        if (!hasContent) {//第一次获取音进将前面的声音也加入.
                            try {
                                for (int j = 1; j < cache.length; j++) {
                                    if (null != cache[(index + j) % cache.length]) {
                                        outputFile.write(cache[(index + j) % cache.length]);
                                    }
                                }
                            } catch (IOException ignored) {
                            }
                        }
                        hasContent = true;
                        hasVoiceTimes.incrementAndGet();
                        i = 0;
                    } else {
                        i++;
                    }
                    if (hasContent) {
                        try {
                            outputFile.write(buf);
                        } catch (IOException ignored) {
                        }
                    }
                    if (i > maxTimes) { //15次录音未成功表示本次语音录制失败.重新开启获取.
                        break;
                    }
                }
                if (hasContent & hasVoiceTimes.get() > minVoiceTime) {
                    return new VoiceData(hasVoiceTimes.get(), outputFile.toByteArray(), recordAudioFormat);
                }
                if (hasVoiceTimes.get() > 0) {
                    logger.info("record failed, hasVoiceTimes = {}", hasVoiceTimes.get());
                }
            }
        } finally {
            IOKit.closeIo(targetDataLine);
            beepPlayer.beepLo();
            MicSemaphore.release();
        }
    }
}
