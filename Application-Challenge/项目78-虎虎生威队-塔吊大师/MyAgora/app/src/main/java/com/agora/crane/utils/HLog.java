package com.agora.crane.utils;

import android.content.Context;
import android.util.Log;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

/**
 * @Author: hyx
 * @Date: 2022/7/23
 * @introduction  日志打印类
 */
public class HLog {

    final private static int I = 3;
    private static final int ELEMENT_LENGTH = 5;

    /**
     * 打印Log
     */
    public static final boolean SHOW_LOG = Constant.DEBUG;

    /**
     * 打印info
     *
     * @param msg 打印的信息
     */
    public static void i(final String msg) {
        if (!SHOW_LOG) {
            return;
        }
        StackTraceElement[] elements = Thread.currentThread().getStackTrace();
        String strInfo = "";
        if (elements.length >= ELEMENT_LENGTH) {
            strInfo = elements[I].getMethodName() + "(" + elements[I].getClassName().substring(elements[I].getClassName().lastIndexOf(".") + 1) + ".java:" + elements[I].getLineNumber() + ")";
        }
        Log.i("HLog", strInfo + "  " + msg);
    }

    /**
     * 打印error
     *
     * @param msg 打印的信息
     */
    public static void e(final String msg) {
        if (!SHOW_LOG) {
            return;
        }
        StackTraceElement[] elements = Thread.currentThread().getStackTrace();
        String strInfo = "";
        if (elements.length >= ELEMENT_LENGTH) {
            strInfo = elements[I].getMethodName() + "(" + elements[I].getClassName().substring(elements[I].getClassName().lastIndexOf(".") + 1) + ".java:" + elements[I].getLineNumber() + ")";
        }
        Log.e("HLog", strInfo + "  " + msg);
    }

    /**
     * 打印debug
     *
     * @param msg 打印的信息
     */
    public static void d(final String msg) {
        if (!SHOW_LOG) {
            return;
        }
        StackTraceElement[] elements = Thread.currentThread().getStackTrace();
        String strInfo = "";
        if (elements.length >= ELEMENT_LENGTH) {
            strInfo = elements[I].getMethodName() + "(" + elements[I].getClassName().substring(elements[I].getClassName().lastIndexOf(".") + 1) + ".java:" + elements[I].getLineNumber() + ")";
        }
        Log.d("HLog", strInfo + "  " + msg);
    }

    /**
     * 打印warn
     *
     * @param msg 打印的信息
     */
    public static void w(final String msg) {
        if (!SHOW_LOG) {
            return;
        }
        StackTraceElement[] elements = Thread.currentThread().getStackTrace();
        String strInfo = "";
        if (elements.length >= ELEMENT_LENGTH) {
            strInfo = elements[I].getMethodName() + "(" + elements[I].getClassName().substring(elements[I].getClassName().lastIndexOf(".") + 1) + ".java:" + elements[I].getLineNumber() + ")";
        }
        Log.w("HLog", strInfo + "  " + msg);
    }


    /**
     * 保存日志到本地，方便过长的日志获取
     *
     * @param mContext 上下文环境
     * @param content  传入的内容
     * @param fileName 文件名
     */
    public static void local(Context mContext, String content, String fileName) {
        if (!SHOW_LOG) {
            return;
        }
        BufferedWriter out = null;
        String path = mContext.getExternalFilesDir(null).getPath() + "/files" + fileName + DateUtil.getCurrentTime() + ".txt";
        File file = new File(path);
        try {
            out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true)));
            out.write(content);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (out != null) {
                    out.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

}
