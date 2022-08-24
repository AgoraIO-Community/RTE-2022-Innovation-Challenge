package com.agora.crane.utils;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

/**
 * @Author: hyx
 * @Date: 2022/7/23
 * @introduction 常量工具类
 */
public class Constant {

    /**
     * 调试状态
     */
    public static final boolean DEBUG = true;

    /**
     * 静音成功码
     */
    public static final int MUTE_SUCCESS_CODE = 0;

    /**
     * 操作员角色码
     */
    public static final int CODE_ROLE_OPERATOR = 2000;
    /**
     * 现场施工角色码
     */
    public static final int CODE_ROLE_CONSTRUCTION = 3000;
    /**
     * 摄像头角色码
     */
    public static final int CODE_ROLE_CAMERA_FORWARD = 4001;
    public static final int CODE_ROLE_CAMERA_BACK = 4002;
    public static final int CODE_ROLE_CAMERA_LEFT = 4003;
    public static final int CODE_ROLE_CAMERA_RIGHT = 4004;
    public static final int CODE_ROLE_CAMERA_UP = 4005;
    public static final int CODE_ROLE_CAMERA_DOWN = 4006;

    /**
     * 蒙板透明度
     */
    public static final float MASK_TRAN = 0.7f;
    public static final float MASK_LIGHT = 1.0f;

    /**
     * 操作指令
     */
    public static final String ORDER_LEFT = "left";
    public static final String ORDER_UP = "up";
    public static final String ORDER_RIGHT = "right";
    public static final String ORDER_DOWN = "down";
    public static final String ORDER_FORWARD = "forward";
    public static final String ORDER_BACK = "back";
    public static final String ORDER_CALL = "call";
    public static final String ORDER_PICK_UP = "pickUp";
    public static final String ORDER_HANG_UP = "hangUp";
    public static final String ORDER_OK = "ok";

    /**
     * 应用ID
     */
    public static final String APP_ID = "937ed990831f46adbdf914d49b808087";

    /**
     * 获取角色代号
     * @return 返回角色代号
     */
    public static int getCodeRole() {
        String role = UserManager.getRole();
        switch (role) {
            case UserManager.ROLE_OPERATOR:
                return CODE_ROLE_OPERATOR;
            case UserManager.ROLE_CONSTRUCTION:
                return CODE_ROLE_CONSTRUCTION;
            case UserManager.ROLE_CAMERA_FORWARD:
                return CODE_ROLE_CAMERA_FORWARD;
            case UserManager.ROLE_CAMERA_BACK:
                return CODE_ROLE_CAMERA_BACK;
            case UserManager.ROLE_CAMERA_LEFT:
                return CODE_ROLE_CAMERA_LEFT;
            case UserManager.ROLE_CAMERA_RIGHT:
                return CODE_ROLE_CAMERA_RIGHT;
            case UserManager.ROLE_CAMERA_UP:
                return CODE_ROLE_CAMERA_UP;
            case UserManager.ROLE_CAMERA_DOWN:
                return CODE_ROLE_CAMERA_DOWN;
            default:
                return 0;
        }
    }

    /**
     * 获取当前版本名
     *
     * @return 返回当前版本名
     */
    public static String getAppVersionName() {
        String versionName = "";
        try {
            PackageManager pm = MyApplication.getApplication().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(MyApplication.getApplication().getPackageName(), 0);
            versionName = pi.versionName;
            if (versionName == null || versionName.length() <= 0) {
                return "";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return versionName;
    }


}
