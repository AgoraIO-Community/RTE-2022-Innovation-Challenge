package com.lambo.robot.drivers.wakes.impl;

import ai.kitt.snowboy.SnowboyDetect;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.RobotConfig;
import com.lambo.robot.drivers.wakes.IWakeUp;
import com.lambo.robot.kits.MicSemaphore;
import com.lambo.robot.model.msgs.WakeUpMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.TargetDataLine;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.HashMap;
import java.util.Map;

/**
 * 录音设备.
 * Created by lambo on 2017/7/22.
 */
public class SnowBoyWakeUpImpl implements IWakeUp {
    private static final Logger logger = LoggerFactory.getLogger(SnowBoyWakeUpImpl.class);
    private final Map<SnowboyDetect, RobotConfig.SnowBoyUser> snowBoyDetectMap = new HashMap<>();
    // 唤醒需要使用16000进行录音.识别效果会更好一些.
    private final AudioFormat format = new AudioFormat(16000, 16, 1, true, false);
    private final DataLine.Info targetInfo = new DataLine.Info(TargetDataLine.class, format);
    private static String snowBoyCommonRes;

    static {
        if (System.getProperty("os.name").equalsIgnoreCase("linux")) {
            String libExtension = (System.getProperty("os.name").toLowerCase().contains("win")) ? ".dll" : ".so";
            String nativeFilePath = copy2NativeDir("classpath:/snowBoy/libsnowboy-detect-java" + libExtension);
            System.load(nativeFilePath);
            snowBoyCommonRes = copy2NativeDir("classpath:/snowBoy/common.res");
        }
    }

    //是否运行.
    private boolean interrupt = false;

    public SnowBoyWakeUpImpl(RobotConfig robotConfig) {
        for (RobotConfig.SnowBoyUser snowBoyUser : robotConfig.snowBoyUsers) {
            SnowboyDetect detector = new SnowboyDetect(snowBoyCommonRes, snowBoyUser.voiceModel);
            detector.SetSensitivity(snowBoyUser.sensitivity + "");
            detector.SetAudioGain(1);
            snowBoyDetectMap.put(detector, snowBoyUser);
        }
    }

    boolean running = false;

    @Override
    public synchronized WakeUpMsg waitWakeUp() {
        interrupt = false;
        TargetDataLine targetDataLine = null;
        if (running) {
            logger.warn("waitWakeUp failed, wakeUp is running.");
            return new WakeUpMsg().noContent();
        }
        try {
            MicSemaphore.tryAcquire(5000);
        } catch (InterruptedException e) {
            return new WakeUpMsg().timeOut();
        }
        try {
            running = true;
            targetDataLine = (TargetDataLine) AudioSystem.getLine(targetInfo);
            targetDataLine.open(format);
            targetDataLine.start();
            // Reads 0.1 second of audio in each call.
            short[] snowBoyData = new short[1600];
            byte[] targetData = new byte[snowBoyData.length * 2];
            int numBytesRead;
            while (true) {
                if (interrupt) {
                    return new WakeUpMsg().interrupt();
                }
                numBytesRead = targetDataLine.read(targetData, 0, targetData.length);
                if (numBytesRead == -1) {
                    logger.error("failed to read audio data.");
                    return new WakeUpMsg().failed();
                }
                long start = System.currentTimeMillis();
                ByteBuffer.wrap(targetData).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(snowBoyData);
                for (Map.Entry<SnowboyDetect, RobotConfig.SnowBoyUser> entry : snowBoyDetectMap.entrySet()) {
                    int result = entry.getKey().RunDetection(snowBoyData, snowBoyData.length);
                    if (result > 0) {
                        logger.debug("wakeUp success, snowBoyUser = {}, RunDetection use {} ms", entry.getValue(), System.currentTimeMillis() - start);
                        return new WakeUpMsg(entry.getValue().uid);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("snowBoy waitWakeUp failed", e);
            return new WakeUpMsg().exception();
        } finally {
            IOKit.closeIo(targetDataLine);
            running = false;
            MicSemaphore.release();
        }
    }

    @Override
    public void interrupt() {
        interrupt = true;
    }

    //BIN_LIB为JAR包中存放DLL的路径
    //getResourceAsStream以JAR中根路径为开始点
    private synchronized static String copy2NativeDir(String filePath) {
        String nativeTempDir = System.getProperty("java.io.tmpdir");
        InputStream in = null;
        FileOutputStream writer = null;
        String libFullName = filePath.substring(filePath.lastIndexOf("/"));
        File extractedLibFile = new File(nativeTempDir + libFullName);
        if (!extractedLibFile.exists() || extractedLibFile.length() == 0) {
            try {
                in = IOKit.getInputStream(filePath);
                writer = new FileOutputStream(extractedLibFile);
                byte[] bytes = IOKit.readToByteBuffer(in);
                writer.write(bytes);
                writer.flush();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                IOKit.closeIo(in);
                IOKit.closeIo(writer);
            }
        }
        return extractedLibFile.toString();
    }
}
