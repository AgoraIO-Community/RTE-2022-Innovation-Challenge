package com.agora.crane.utils;

import android.widget.Toast;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction  Toast工具类
 */
public class ToastUtil {

    /**
     * 显示Toast
     * @param content  显示内容
     */
    public static void show(String content){
        Toast.makeText(MyApplication.getApplication(),content,Toast.LENGTH_SHORT ).show();
    }

    /**
     * 显示Toast
     * @param content  显示内容
     */
    public static void show(int content){
        Toast.makeText(MyApplication.getApplication(),content,Toast.LENGTH_SHORT ).show();
    }

}
