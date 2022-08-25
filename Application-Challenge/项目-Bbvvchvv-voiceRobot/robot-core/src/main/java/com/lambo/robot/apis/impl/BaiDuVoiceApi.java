package com.lambo.robot.apis.impl;

import com.lambo.los.http.client.HttpConnection;
import com.lambo.los.kits.BizException;
import com.lambo.los.kits.Strings;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.apis.IVoiceApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.SocketTimeoutException;
import java.util.Base64;

/**
 * 百度语音合成器.
 * Created by lambo on 2017/7/20.
 */
public class BaiDuVoiceApi implements IVoiceApi {
    private Logger logger = LoggerFactory.getLogger(getClass());

    private static final String URL_TOKEN = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=%s&client_secret=%s&_=%s";
    private static final String URL_TEXT_2_AUDIO = "http://tsn.baidu.com/text2audio";
    private static final String URL_AUDIO_2_TEXT = "http://vop.baidu.com/server_api";
    private static final String JSON_AUDIO_2_TEXT = "{\"channel\":1,\"lan\":\"zh\",\"format\":\"%s\",\"rate\":\"%s\",\"cuid\":\"%s\"," +
            "\"token\":\"%s\",\"len\":%s,\"speech\":\"%s\"}";
    private final String appId;
    private final String appKey;
    private final String secretKey;

    private String token;
    private long expiresIn;

    public BaiDuVoiceApi(String appId, String appKey, String secretKey) {
        this.appId = appId;
        this.appKey = appKey;
        this.secretKey = secretKey;
    }


    /**
     * 语音识别.
     *
     * @param uid        用户对象.
     * @param sampleRate 采样rate. 有8000，16000.
     * @param data       语音数据.
     * @return 语音识别后的内容.注意采用的是带中文标点数据.
     */
    public String asr(String uid, float sampleRate, byte[] data) {
        return asr(uid, sampleRate, "pcm", data);
    }

    /**
     * 语音识别.
     *
     * @param uid        用户对象.
     * @param sampleRate 采样rate. 有8000，16000.
     * @param data       语音数据.
     * @return 语音识别后的内容.注意采用的是带中文标点数据.
     */
    @Override
    public String asr(String uid, float sampleRate, String format, byte[] data) {
        String token = getToken();
        logger.debug("tts use token = {}", token);
        String speech = baseEncode(data);
        if (null == uid) {
            logger.error("uid is null set default");
            uid = "default";
        }
        int retry = 3;
        while (retry > 0) { //进行重试.
            retry--;
            try {
                HttpConnection httpConnection = HttpConnection.connect(URL_AUDIO_2_TEXT).ignoreContentType(true);
                httpConnection.method(HttpConnection.Method.POST).timeout(10000);
                httpConnection.header("Content-type", "application/json");
                String requestBody = String.format(JSON_AUDIO_2_TEXT, format, sampleRate, uid, token, data.length, speech);
                httpConnection.postData(requestBody.getBytes());
                HttpConnection.Response response = httpConnection.execute();
                String body = response.body();
                logger.debug("asr, uid = {}, speech.length = {}", uid, data.length);
                String err_no = Strings.getFromJson(body, "err_no");
                if ("0".equals(err_no)) {
                    String result = body.substring(body.indexOf(":[") + 2, body.indexOf("]"));
                    result = Strings.trimQuotes(result);
                    logger.debug("asr success, result = {}", result);
                    return result;
                }
                logger.error("asr failed, uid = {}, speech.length = {}, body = {}", uid, data.length, body);
                return null;
            } catch (SocketTimeoutException ignored) { //网络事件不处理
            } catch (IOException e) {
                logger.error("asr failed, appKey = {}, uid = {}, speech.length = {}", appKey, uid, data.length, e);
                break;
            }
        }
        return null;
    }

    private String baseEncode(byte[] data) {
        return new String(Base64.getEncoder().encode(data));
    }

    @Override
    public byte[] tts(String uid, String textContent) {
        String token = getToken();
        logger.debug("tts use token = {}", token);
        if (null == uid) {
            logger.error("uid is null set default");
            uid = "default";
        }
        int retry = 3;
        while (retry > 0) {
            retry--;
            try {
                HttpConnection.Response response = HttpConnection.connect(URL_TEXT_2_AUDIO)
                        .data("tex", textContent)
                        .data("cuid", uid)
                        .data("tok", token)
                        .data("lan", "zh")
                        .data("ctp", "1")
                        .method(HttpConnection.Method.POST).timeout(10000).ignoreContentType(true).execute();
                String contentType = response.header("Content-type");
                if ("application/json".equals(contentType)) {
                    String body = response.body();
                    logger.error("tts failed, appKey = {}, body = {}", appKey, body);
                    throw new BizException(5000, body);
                }
                logger.debug("tts success, textContent = {}", textContent);
                return response.bodyAsBytes();
            } catch (SocketTimeoutException ignored) { //网络事件不处理
            } catch (IOException e) {
                logger.error("tts failed, appKey = {}, uid = {}, textContent = {}", appKey, uid, textContent, e);
                return null;
            }
        }
        return null;
    }

    private synchronized String getToken() {
        if (null == token || System.currentTimeMillis() > expiresIn) {
            String fileName = ".baiDuYuYin.token.cache";
            if (null == token) {
                if (new File(fileName).exists()) {
                    InputStream inputStream = null;
                    try {
                        inputStream = IOKit.getInputStream(fileName);
                        byte[] bytes = IOKit.readToByteBuffer(inputStream);
                        String[] tokens = new String(bytes).split(fileName);
                        this.token = tokens[0];
                        this.expiresIn = Long.valueOf(tokens[1]);
                    } catch (IOException ignored) {
                    } finally {
                        IOKit.closeIo(inputStream);
                    }
                    if (null != token) {
                        return getToken();
                    }
                }
            }
            logger.info("reset token = {}", token);
            try {
                String body = HttpConnection.connect(String.format(URL_TOKEN, appKey, secretKey, Math.random()))
                        .timeout(15000).ignoreContentType(true).method(HttpConnection.Method.GET).execute().body();
                if (!Strings.isBlank(body)) {
                    token = Strings.getFromJson(body, "access_token");
                    expiresIn = System.currentTimeMillis() + Long.valueOf(Strings.getFromJson(body, "expires_in")) * 1000 - 250000;
                    logger.info("getToken success, appKey = {}, token = {}", appKey, token);
                    FileOutputStream out = null;
                    try {
                        out = new FileOutputStream(fileName);
                        out.write((token + fileName + expiresIn).getBytes());
                        out.flush();
                    } catch (Exception ignored) {
                    } finally {
                        IOKit.closeIo(out);
                    }
                    return token;
                }
                logger.info("getToken failed, appKey = {}, body = {}", appKey, body);
            } catch (IOException e) {
                logger.error("getToken failed, appKey = {}", appKey, e);
            }
        }
        return token;
    }
}
