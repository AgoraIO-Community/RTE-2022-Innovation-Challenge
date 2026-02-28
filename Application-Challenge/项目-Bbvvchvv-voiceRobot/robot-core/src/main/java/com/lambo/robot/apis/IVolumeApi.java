package com.lambo.robot.apis;

/**
 * 音量设置.
 * Created by lambo on 2017/7/29.
 */
public interface IVolumeApi {

    /**
     * 获取当前系统的音量.
     *
     * @return
     */
    int getVolume();

    /**
     * 设置系统的音量.
     *
     * @return 是否成功.
     */
    boolean setVolume(int volume);
}
