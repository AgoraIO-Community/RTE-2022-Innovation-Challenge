package com.agora.crane.utils;

import android.annotation.SuppressLint;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @Author: hyx
 * @Date: 2022/7/23
 * @introduction 日期转换类
 */
public class DateUtil {

    private static final int SIXTY = 60;

    /**
     * yyyy-MM-dd
     */
    @SuppressLint("SimpleDateFormat")
    private static final SimpleDateFormat SIMPLE_DATE_FORMAT_TWE = new SimpleDateFormat("yyyy-MM-dd");


    public static Date getDate(String time) {
        Date date = null;
        try {
            date = SIMPLE_DATE_FORMAT_TWE.parse(time);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return date;
    }


    /**
     * @param lo 毫秒数
     * @return String yyyy-MM-dd HH:mm:ss
     * @Description long类型转换成日期
     */
    public static String longToDate(long lo) {
        Date date = new Date(lo);
        SimpleDateFormat sd = new SimpleDateFormat("yyyy年MM月dd日");
        return sd.format(date);
    }

    /**
     * @param time 毫秒数
     * @return String yyyy-MM-dd HH:mm:ss
     * @Description long类型转换成日期
     */
    public static String longToDate(String time) {
        try {
            long lt = new Long(time);
            Date date = new Date(lt);
            SimpleDateFormat sd = new SimpleDateFormat("yyyy年MM月dd日");
            return sd.format(date);
        } catch (Exception e) {
            return "";
        }
    }


    /**
     * 获取当前时间
     *
     * @return 返回当前时间
     */
    public static String getCurrentTime() {
        @SuppressLint("SimpleDateFormat") SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(new Date());
    }

    /**
     * 比对时间，比对当前时间和结束时间的差值
     * @param endTime 结束时间
     */
    public static long compareToTime(String endTime) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
            String currentTime = getCurrentTime();
            Date begin = sdf.parse(currentTime);
            Date end = sdf.parse(endTime);
            return end.getTime() - begin.getTime();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0L;
    }

    /**
     * 秒数转成时分秒的形式
     * @param s  时间秒
     * @return   返回时分秒形式
     */
    public static String formatTimeBySecond(int s) {
        int hour = 0;
        int minute = 0;
        int second;
        second = s;
        if (second > SIXTY) {
            minute = second / SIXTY;
            second = second % SIXTY;
        }
        if (minute > SIXTY) {
            hour = minute / SIXTY;
            minute = minute % SIXTY;
        }
        String strTime = hour + "时" + minute + "分" + second + "秒";
        if (hour == 0) {
            strTime = +minute + "分" + second + "秒";
        }
        if (minute == 0) {
            strTime = second + "秒";
        }
        return strTime;
    }


}
