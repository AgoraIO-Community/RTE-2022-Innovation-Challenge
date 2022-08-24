package com.agora.crane.net;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  下载回调
 */
public interface IRequestCallback {

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

}
