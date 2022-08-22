package com.agora.crane.net;

import android.content.Context;

import java.util.Map;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  请求管理
 */
public interface IRequestManager {
    /**
     * get请求
     *
     * @param url             接口地址
     * @param requestCallback 回调
     * @param context         上下文
     */
    void get(String url, IRequestCallback requestCallback, Context context);

    /**
     * post请求
     *
     * @param url             接口地址
     * @param requestBody     参数
     * @param requestCallback 回调
     * @param context         上下文
     */
    void post(String url, Map<String, String> requestBody, IRequestCallback requestCallback, Context context);

    /**
     * put请求
     *
     * @param url             接口地址
     * @param requestBody     参数
     * @param requestCallback 回调
     * @param context         上下文
     */
    void put(String url, Map<String, String> requestBody, IRequestCallback requestCallback, Context context);

    /**
     * delete请求
     *
     * @param url             接口地址
     * @param requestBody     参数
     * @param requestCallback 回调
     * @param context         上下文
     */
    void delete(String url, Map<String, String> requestBody, IRequestCallback requestCallback, Context context);

    /**
     * 下载请求
     *
     * @param fromUrl  文件源文件地址
     * @param saveUrl  保存文件的地址
     * @param fileName 文件名
     * @param callback 下载进度监听的回调
     */
    void download(String fromUrl, String saveUrl, String fileName,IDownCallback callback);
}
