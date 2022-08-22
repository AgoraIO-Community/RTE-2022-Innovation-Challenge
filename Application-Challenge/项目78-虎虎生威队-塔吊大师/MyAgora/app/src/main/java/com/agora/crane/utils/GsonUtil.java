package com.agora.crane.utils;


import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;


/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction Gson解析类
 */
public class GsonUtil {

    private static Gson gson;

    public static Gson getInstance() {
        if (gson == null) {
            gson = new Gson();
        }
        return gson;
    }

    /**
     * 对象转JSON
     *
     * @param obj 对象
     * @return 返回json
     */
    public static String toJson(Object obj) {
        return getInstance().toJson(obj);
    }


    /**
     * json转实体对象
     *
     * @param json  json数据
     * @param clazz 实体对象泛型
     * @return 返回实体对象
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return getInstance().fromJson(json, clazz);
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
        }
        return null;
    }


}
