package com.agora.crane.net;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  下载文件回调
 */
public interface IDownCallback {

    /**
     * 访问成功
     * @param success 服务器返回的数据
     */
    void onSuccess(String success);
    /**
     * 访问失败
     * @param message 失败的信息
     */
    void onFailure(String message);

    /**
     * 进度监听
     * @param progress 进度
     */
    void onProgress(float progress);

}
