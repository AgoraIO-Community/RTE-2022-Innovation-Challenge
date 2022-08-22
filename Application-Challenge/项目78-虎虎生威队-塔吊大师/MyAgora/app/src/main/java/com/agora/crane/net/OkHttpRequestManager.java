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


    @Override
    public void post(String url, Map<String, String> map, IRequestCallback requestCallback, Context context) {
        if (TextUtils.isEmpty(url)) {
            return;
        }
        FormBody.Builder fb = new FormBody.Builder();
        RequestBody body;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (entry != null && entry.getKey() != null && entry.getValue() != null) {
                fb.add(entry.getKey(), entry.getValue());
            }
        }
        body = fb.build();

        Request.Builder req = new Request.Builder();
        req.addHeader(VI_VIDEO, VI_VIDEO)
                .url(url)
                .post(body);
        if (getToken() != null && getToken().length() > 0) {
            req.addHeader("Authorization", "Bearer " + getToken());
        }
        Request request = req.build();
        addCallBack(requestCallback, request);
    }

    @Override
    public void put(String url, Map<String, String> map, IRequestCallback requestCallback, Context context) {
        if (TextUtils.isEmpty(url)) {
            return;
        }
        FormBody.Builder fb = new FormBody.Builder();
        RequestBody body;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (entry != null && entry.getKey() != null && entry.getValue() != null) {
                fb.add(entry.getKey(), entry.getValue());
            }
        }
        body = fb.build();

        Request.Builder req = new Request.Builder();
        req.addHeader(VI_VIDEO, VI_VIDEO)
                .url(url)
                .put(body);
        if (getToken() != null && getToken().length() > 0) {
            req.addHeader("Authorization", "Bearer " + getToken());
        }
        Request request = req.build();

        addCallBack(requestCallback, request);
    }


    @Override
    public void delete(String url, Map<String, String> map, IRequestCallback requestCallback, Context context) {
        if (TextUtils.isEmpty(url)) {
            return;
        }
        FormBody.Builder fb = new FormBody.Builder();
        RequestBody body;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (entry != null && entry.getKey() != null && entry.getValue() != null) {
                fb.add(entry.getKey(), entry.getValue());
            }
        }
        body = fb.build();

        Request.Builder req = new Request.Builder();
        req.addHeader(VI_VIDEO, VI_VIDEO)
                .url(url)
                .delete(body);
        if (getToken() != null && getToken().length() > 0) {
            req.addHeader("Authorization", "Bearer " + getToken());
        }
        Request request = req.build();
        addCallBack(requestCallback, request);
    }

    @Override
    public void download(String fromUrl, String saveUrl, String fileName, IDownCallback callback) {
        if (TextUtils.isEmpty(fromUrl)) {
            return;
        }
        Request request = new Request.Builder().url(fromUrl).build();
        okHttpClient = new OkHttpClient();
        okHttpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                if (callback != null) {
                    callback.onFailure(e.getMessage());
                }
            }

            @Override
            public void onResponse(@NotNull Call call, @NotNull Response response) throws IOException {
                InputStream is = null;
                byte[] buf = new byte[2048];
                int len;
                FileOutputStream fos = null;
                //储存下载文件的目录
                File dir = new File(saveUrl);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                File file = new File(dir, fileName);
                try {
                    is = response.body().byteStream();
                    long total = response.body().contentLength();
                    fos = new FileOutputStream(file);
                    long sum = 0;
                    while ((len = is.read(buf)) != -1) {
                        fos.write(buf, 0, len);
                        sum += len;
                        float progress = (int) (sum * 1.0f / total * 100);
                        //下载中更新进度条
                        callback.onProgress(progress);
                    }
                    fos.flush();
                    //下载完成
                    callback.onSuccess("");
                } catch (Exception e) {
                    callback.onFailure(e.getMessage());
                } finally {
                    try {
                        if (is != null) {
                            is.close();
                        }
                        if (fos != null) {
                            fos.close();
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
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
