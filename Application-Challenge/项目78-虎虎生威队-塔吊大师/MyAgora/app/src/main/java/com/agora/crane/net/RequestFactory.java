package com.agora.crane.net;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  网络请求工厂类
 */
public class RequestFactory {

    public static IRequestManager getRequestManager() {
        return OkHttpRequestManager.getInstance();
    }

}
