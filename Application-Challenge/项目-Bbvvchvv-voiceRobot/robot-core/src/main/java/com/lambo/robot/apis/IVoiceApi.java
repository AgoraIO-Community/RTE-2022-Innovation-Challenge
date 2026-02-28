package com.lambo.robot.apis;

/**
 * 语音接口.
 * Created by lambo on 2017/7/31.
 */
public interface IVoiceApi {

    /**
     * 语音识别.
     *
     * @param uid        用户id.
     * @param sampleRate 采样格式。8000，16000.
     * @param format     格式 pcm.
     * @param data       数据.
     * @return
     */
    String asr(String uid, float sampleRate, String format, byte[] data);

    /**
     * 文字转语音.
     *
     * @param uid         用户id.
     * @param textContent 内容.
     * @return 语音数据.
     */
    byte[] tts(String uid, String textContent);
}
