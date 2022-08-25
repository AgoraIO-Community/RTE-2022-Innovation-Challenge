package com.lambo.robot.drivers.records;

import com.lambo.robot.drivers.IDriver;
import com.lambo.robot.model.VoiceData;

import javax.sound.sampled.LineUnavailableException;
import java.util.concurrent.TimeoutException;

/**
 * 录音机.用于录制说话的声音.
 * Created by lambo on 2017/7/22.
 */
public interface IRecord extends IDriver {

    /**
     * 录制，最小有效的记录时间为3次.
     *
     * @param minVoiceTime 最小的语音次数.
     * @return
     */
    VoiceData record(int maxRecordTime, int minVoiceTime) throws TimeoutException, InterruptedException, LineUnavailableException;

    default VoiceData record() throws InterruptedException, TimeoutException, LineUnavailableException {//默认最长60s录音.3次有声音.
        return record(60 * 1000, 3);
    }
}
