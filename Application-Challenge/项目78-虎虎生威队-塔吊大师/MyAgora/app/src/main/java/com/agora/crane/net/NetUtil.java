package com.agora.crane.net;

import android.content.Context;

import com.agora.crane.utils.HLog;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  网络请求
 */
public class NetUtil {


    /**
     * get请求
     *
     * @param callback 接口回调
     * @param context  上下文
     */
    public static void getRequest(final String url, final IRequestCallback callback, final Context context) {
        HLog.e("接口：" + url);
        IRequestManager manager = RequestFactory.getRequestManager();
        manager.get(url, new IRequestCallback() {
            @Override
            public void onSuccess(String success) {
                callback.onSuccess(success);
            }

            @Override
            public void onFailure(String message) {
                HLog.e("getFailure:" + message);
                callback.onFailure(message);

            }

        }, context);
    }

}
