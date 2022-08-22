package com.agora.crane.bean;

/**
 * @Author: hyx
 * @Date: 2022/8/9
 * @introduction
 */
public class TokenBean {

    private int code;
    private String data;

    public int getCode() {
        return code;
    }

    public String getData() {
        return data == null ? "" : data;
    }
}
