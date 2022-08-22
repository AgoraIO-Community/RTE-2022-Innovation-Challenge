package com.agora.crane.net;

import android.util.ArrayMap;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction  参数拼接
 */
public class SpliceUrl {

    public static String getUrl(String url, ArrayMap<String,String>map){
        StringBuilder tempParams = new StringBuilder();
        try {
            //处理参数
            int pos = 0;
            for (String key : map.keySet()) {
                if (pos > 0) {
                    tempParams.append("&");
                }
                //对参数进行URLEncoder
                String value = map.get(key) == null ? "" : map.get(key);
                tempParams.append(String.format("%s=%s", key, URLEncoder.encode(value, "utf-8")));
                pos++;
            }
        } catch (UnsupportedEncodingException | NullPointerException e) {
            e.printStackTrace();
        }
        return String.format("%s?%s", url, tempParams.toString());
    }

}
