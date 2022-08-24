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

}
