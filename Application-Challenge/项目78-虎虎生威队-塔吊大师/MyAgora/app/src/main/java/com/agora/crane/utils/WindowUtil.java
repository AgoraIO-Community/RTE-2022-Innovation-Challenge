package com.agora.crane.utils;

import android.app.Activity;
import android.content.Context;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;

/**
 * @Author: hyx
 * @Date: 2022/7/24
 * @introduction 窗口工具类
 */
public class WindowUtil {


    public static int SCREEN_WIDTH, SCREEN_HEIGHT;
    public static int VIDEO_WIDTH, VIDEO_HEIGHT;


    /**
     * 获取屏幕宽高
     *
     * @param context 上下文
     */
    public static void getScreenSize(Activity context) {
        DisplayMetrics dm = new DisplayMetrics();
        context.getWindowManager().getDefaultDisplay().getMetrics(dm);
        SCREEN_WIDTH = dm.widthPixels;
        SCREEN_HEIGHT = dm.heightPixels;
        VIDEO_WIDTH = (int) (SCREEN_WIDTH / 360.0f * 135);
        VIDEO_HEIGHT = (int) (SCREEN_WIDTH / 360.0f * 165);
    }

    /**
     * 设置背景透明度
     *
     * @param mActivity 上下文
     * @param f         透明度百分比
     */
    public static void setBgAlpha(Activity mActivity, float f) {
        WindowManager.LayoutParams layoutParams = mActivity.getWindow().getAttributes();
        layoutParams.alpha = f;
        mActivity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_BLUR_BEHIND);
        mActivity.getWindow().setAttributes(layoutParams);
    }

    /**
     * 隐藏软键盘
     *
     * @param mContext  上下文
     */
    public static void hideBoard(Context mContext) {
        InputMethodManager imm = (InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm.isActive()) {
            imm.toggleSoftInput(InputMethodManager.SHOW_IMPLICIT, InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    /**
     * dp 转 px
     *
     * @param context 上下文
     * @param dpValue dp值
     * @return 返回px值
     */
    public static int dp2px(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }

}
