package com.lambo.robot.apis;

/**
 * 默认机器人接口.
 * Created by lambo on 2017/7/31.
 */
public interface IRobotApi {

    /**
     *  请求处理.
     *
     * @param uid         用户id.
     * @param textContent 内容.
     * @return 语音数据.
     */
    String ask(String uid, String textContent);
}
