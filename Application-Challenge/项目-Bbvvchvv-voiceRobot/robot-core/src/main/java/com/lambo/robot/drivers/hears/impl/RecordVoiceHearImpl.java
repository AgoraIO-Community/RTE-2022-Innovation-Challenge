package com.lambo.robot.drivers.hears.impl;

import com.lambo.los.kits.Strings;
import com.lambo.robot.apis.impl.BaiDuVoiceApi;
import com.lambo.robot.drivers.hears.IHear;
import com.lambo.robot.drivers.records.IRecord;
import com.lambo.robot.model.VoiceData;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.VoiceDataMsg;

import javax.sound.sampled.LineUnavailableException;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 录制语音听觉.
 * Created by Administrator on 2017/7/22.
 */
public class RecordVoiceHearImpl implements IHear {

    private final IRecord record;
    private final BaiDuVoiceApi baiDuVoiceApi;
    private final AtomicBoolean running = new AtomicBoolean(true);

    public RecordVoiceHearImpl(IRecord record, BaiDuVoiceApi baiDuVoiceApi) {
        this.record = record;
        this.baiDuVoiceApi = baiDuVoiceApi;
    }

    @Override
    public HearMsg listening() {
        VoiceDataMsg voiceDataMsg;
        try {
            voiceDataMsg = recordVoiceDataMsg();
            if (!voiceDataMsg.isSuccess()) {
                HearMsg hearMsg = new HearMsg(null);
                hearMsg.setMsgState(voiceDataMsg.getMsgState());
                return hearMsg;
            }
        } catch (InterruptedException e) {
            return new HearMsg(null).interrupt();
        } catch (TimeoutException e) {
            return new HearMsg(null).interrupt();
        }
        VoiceData voiceData = voiceDataMsg.getContent();
        if (null == voiceData) {
            return new HearMsg(null).failed();
        }
        String asr = baiDuVoiceApi.asr(voiceDataMsg.getUid(), (int) voiceData.getAudioFormat().getFrameRate(), voiceData.getData());
        asr = Strings.trimQuotes(asr);
        if (Strings.isBlank(asr) || Strings.isBlank(asr.replace("，", ""))) {
            return new HearMsg(null).noContent();
        }
        if (asr.endsWith("，")) {
            asr = asr.substring(0, asr.length() - 1);
        }
        return new HearMsg(asr);
    }

    private VoiceDataMsg recordVoiceDataMsg() throws TimeoutException, InterruptedException {
        try {
            VoiceData voiceData = record.record();
            if (null == voiceData) {
                return new VoiceDataMsg(null).failed();
            }
            return new VoiceDataMsg(voiceData);
        } catch (LineUnavailableException e) {
            return new VoiceDataMsg(null).exception();
        }
    }

    @Override
    public void interrupt() {
        record.interrupt();
        running.set(false);
    }
}
