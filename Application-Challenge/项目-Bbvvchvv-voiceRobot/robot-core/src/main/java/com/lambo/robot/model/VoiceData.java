package com.lambo.robot.model;

import javax.sound.sampled.AudioFormat;
import java.io.Serializable;

/**
 * 语音录音数据.
 * Created by Administrator on 2017/7/20.
 */
public class VoiceData implements Serializable {
    private static final long serialVersionUID = 1437366440915823909L;

    /**
     * 用户id.
     */
    private String uid;
    private AudioFormat audioFormat;
    /**
     * 有声音的语音次数.
     */
    private int voiceTime;

    /**
     * 有语音的数据块.
     */
    private byte[] data;

    public VoiceData(int voiceTime, byte[] data) {
        this(voiceTime, data, null);
    }

    public VoiceData(int voiceTime, byte[] data, AudioFormat audioFormat) {
        this.voiceTime = voiceTime;
        this.data = data;
        this.audioFormat = audioFormat;
    }

    public AudioFormat getAudioFormat() {
        return audioFormat;
    }

    public void setAudioFormat(AudioFormat audioFormat) {
        this.audioFormat = audioFormat;
    }

    public int getVoiceTime() {
        return voiceTime;
    }

    public void setVoiceTime(int voiceTime) {
        this.voiceTime = voiceTime;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    @Override
    public String toString() {
        return "VoiceData{" +
                "voiceTime=" + voiceTime +
                ", data.length = " + data.length +
                '}';
    }
}
