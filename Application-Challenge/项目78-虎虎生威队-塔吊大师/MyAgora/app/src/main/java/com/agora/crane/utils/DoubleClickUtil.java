package com.agora.crane.utils;

/**
 * @Author: hyx
 * @Date: 2022/8/21
 * @introduction  解决快速点击问题工具类
 */
public class DoubleClickUtil {

    /**
     * 两次点击的间隔为400毫秒
     */
    private static final int CLICK_INTERVAL = 400;
    /**
     * 上次点击的时间
     */
    private static long lastClickTime;

    /**
     * 判断是否是快速点击
     * @return true:快速点击  false:正常点击
     */
    public synchronized static boolean isFastClick() {
        long time = System.currentTimeMillis();
        if (time - lastClickTime < CLICK_INTERVAL) {
            return true;
        }
        lastClickTime = time;
        return false;
    }

}
