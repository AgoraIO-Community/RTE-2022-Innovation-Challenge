package com.lambo.robot.apis.impl;

import com.lambo.los.kits.ProcessKit;
import com.lambo.robot.apis.IVolumeApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 树莓派系统处理音量.
 * Created by lambo on 2017/7/29.
 */
public class LinuxVolumeApi implements IVolumeApi {
    private Logger logger = LoggerFactory.getLogger(getClass());

    private final Pattern compile = Pattern.compile("\\[([0-9]+)%\\]");

    @Override
    public int getVolume() {
        int result = -1;
        try {
            ProcessKit.ProcessStatus processStatus = ProcessKit.execute(5000, "/bin/sh", "-c", "amixer sget PCM ");
            if (processStatus.exitCode == 0) {
                Matcher matcher = compile.matcher(processStatus.output);
                if (matcher.find()) {
                    result = Integer.valueOf(matcher.group(1));
                }
            }
        } catch (IOException | InterruptedException | TimeoutException e) {
            logger.error("getVolume failed", e);
        }
        return result;
    }


    @Override
    public boolean setVolume(int volume) {
        if (volume < 0 || volume > 100) {
            return false;
        }
        try {
            ProcessKit.ProcessStatus processStatus = ProcessKit.execute(5000, "/bin/sh", "-c", "amixer sset PCM " + volume + "%");
            if (processStatus.exitCode == 0) {
                return true;
            }
        } catch (IOException | InterruptedException | TimeoutException e) {
            logger.error("setVolume failed, volume = {}", volume, e);
        }
        return false;
    }
}
