package com.agora.crane.net;

import android.content.Context;
import android.os.Handler;
import android.text.TextUtils;

import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  OkHttp请求管理类
 */
public class OkHttpRequestManager implements IRequestManager {

    private static String token;
    private final static String VI_VIDEO = "hivideo";

    private OkHttpClient okHttpClient;
    private Handler handler;

    public static OkHttpRequestManager getInstance() {
        return SingletonHolder.INSTANCE;
    }

    private static class SingletonHolder {
        private static final OkHttpRequestManager INSTANCE = new OkHttpRequestManager();
    }

    public OkHttpRequestManager() {
        okHttpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build();
        //在哪个线程创建该对象，则最后的请求结果将在该线程回调
        handler = new Handler();
    }

    @Override
    public void get(String url, IRequestCallback requestCallback, Context context) {
        if (TextUtils.isEmpty(url)) {
            return;
        }
        Request.Builder req = new Request.Builder();
        req.addHeader(VI_VIDEO, VI_VIDEO)
                .url(url)
                .get();
        if (getToken() != null && getToken().length() > 0) {
            req.addHeader("Authorization", "Bearer " + getToken());
        }
        Request request = req.build();
        addCallBack(requestCallback, request);
    }


    private void addCallBack(final IRequestCallback requestCallback, final Request request) {
        okHttpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(final Call call, final IOException e) {
                e.printStackTrace();
                handler.post(() -> requestCallback.onFailure(e.getMessage()));
            }

            @Override
            public void onResponse(final Call call, final Response response) {
                String json = "";
                try {
                    json = response.body().string();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                final String jsonResult = json;

                if (response.isSuccessful()) {
                    handler.post(() -> requestCallback.onSuccess(jsonResult));
                } else {
                    handler.post(() -> requestCallback.onFailure(jsonResult));
                }
            }
        });
    }

    private String getToken() {
        if (token == null || token.length() == 0) {
            token = "";
        }
        return token;
    }


    public static void cleanToken() {
        token = null;
    }

}
