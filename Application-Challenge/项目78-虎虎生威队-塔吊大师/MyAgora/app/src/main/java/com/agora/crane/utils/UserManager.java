package com.agora.crane.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.agora.crane.R;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 用户管理工具类
 */
public class UserManager {

    private static final String LOGIN_STATUS = "login_status";
    private static final String ROLE = "role";
    private static final String VIDEO = "video";
    private static final String USER_NAME = "user_name";
    private static SharedPreferences mSharedPreferences;
    private static SharedPreferences.Editor mEditor;

    public static final String ROLE_OPERATOR = "role_operator";
    public static final String ROLE_CONSTRUCTION = "role_construction";
    public static final String ROLE_CAMERA_FORWARD = "role_camera_forward";
    public static final String ROLE_CAMERA_BACK = "role_camera_back";
    public static final String ROLE_CAMERA_LEFT = "role_camera_left";
    public static final String ROLE_CAMERA_RIGHT = "role_camera_right";
    public static final String ROLE_CAMERA_UP = "role_camera_up";
    public static final String ROLE_CAMERA_DOWN = "role_camera_down";

    public static final String VIDEO_LOW = "video_low";
    public static final String VIDEO_MIDDLE = "video_middle";
    public static final String VIDEO_HIGH = "video_high";

    /**
     * 保存用户名
     *
     * @param userName 用户名
     */
    public static void saveUserName(String userName) {
        saveString(USER_NAME, userName);
    }

    /**
     * 获取用户名
     *
     * @return 用户名
     */
    public static String getUserName() {
        return getString(USER_NAME);
    }

    /**
     * 保存登录状态
     *
     * @param status true：登录成功  false：退出登录
     */
    public static void saveLoginStatus(boolean status) {
        saveBoolean(LOGIN_STATUS, status);
    }

    /**
     * 获取登录状态
     *
     * @return true：登录成功  false：退出登录
     */
    public static boolean getLoginStatus() {
        return getBoolean(LOGIN_STATUS);
    }

    /**
     * 保存角色
     *
     * @param role 角色
     */
    public static void saveRole(String role) {
        saveString(ROLE, role);
    }

    /**
     * 获取角色
     *
     * @return 角色
     */
    public static String getRole() {
        return getString(ROLE);
    }

    /**
     * 保存视频辨率
     *
     * @param video 视频分辨率
     */
    public static void saveVideo(String video) {
        saveString(VIDEO, video);
    }

    /**
     * 获取视频分辨率
     *
     * @return 视频分辨率
     */
    public static String getVideo() {
        return getString(VIDEO);
    }


    public static String getRoleName() {
        String role = getRole();
        switch (role) {
            case ROLE_OPERATOR:
                return MyApplication.getApplication().getString(R.string.role_operator);
            case ROLE_CONSTRUCTION:
                return MyApplication.getApplication().getString(R.string.role_construction);
            case ROLE_CAMERA_FORWARD:
                return MyApplication.getApplication().getString(R.string.role_camera_forward);
            case ROLE_CAMERA_BACK:
                return MyApplication.getApplication().getString(R.string.role_camera_back);
            case ROLE_CAMERA_LEFT:
                return MyApplication.getApplication().getString(R.string.role_camera_left);
            case ROLE_CAMERA_RIGHT:
                return MyApplication.getApplication().getString(R.string.role_camera_right);
            case ROLE_CAMERA_UP:
                return MyApplication.getApplication().getString(R.string.role_camera_up);
            case ROLE_CAMERA_DOWN:
                return MyApplication.getApplication().getString(R.string.role_camera_down);
            default:
                return MyApplication.getApplication().getString(R.string.un_set_role);
        }
    }

    /**
     * 保存布尔数据
     *
     * @param key   关键字
     * @param value 值
     */
    private static void saveBoolean(String key, boolean value) {
        getEditor().putBoolean(key, value);
        getEditor().apply();
    }

    /**
     * 获取布尔数据
     *
     * @param key 关键字
     * @return 返回字符串数据
     */
    private static boolean getBoolean(String key) {
        return getSharedPreferences().getBoolean(key, false);
    }

    /**
     * 保存字符串数据
     *
     * @param key   关键字
     * @param value 值
     */
    private static void saveString(String key, String value) {
        getEditor().putString(key, value);
        getEditor().apply();
    }

    /**
     * 获取字符串数据
     *
     * @param key 关键字
     * @return 返回字符串数据
     */
    private static String getString(String key) {
        return getSharedPreferences().getString(key, "");
    }

    /**
     * 获取Editor对象
     *
     * @return 返回Editor对象
     */
    private static SharedPreferences.Editor getEditor() {
        if (mEditor == null) {
            mEditor = getSharedPreferences().edit();
        }
        return mEditor;
    }

    /**
     * 获取SharedPreferences对象
     *
     * @return 返回SharedPreferences对象
     */
    private static SharedPreferences getSharedPreferences() {
        if (mSharedPreferences == null) {
            mSharedPreferences = MyApplication.getApplication().getSharedPreferences("user", Context.MODE_PRIVATE);
        }
        return mSharedPreferences;
    }
}
