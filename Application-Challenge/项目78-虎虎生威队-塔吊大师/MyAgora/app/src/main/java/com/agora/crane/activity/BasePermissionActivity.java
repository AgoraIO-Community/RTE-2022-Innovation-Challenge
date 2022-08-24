package com.agora.crane.activity;

import android.content.pm.PackageManager;
import android.os.Build;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/7/22
 * @introduction  权限基类
 */
public class BasePermissionActivity extends AppCompatActivity {

    /**
     * 还未开放的权限列表
     */
    private List permissionList;

    /**
     * 检验是否有权限
     */
    public void requestPermission(String[] permissionArray, int permissionCode) {
        permissionList = new ArrayList();
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
            for (int i = 0; i < permissionArray.length; i++) {
                if (ContextCompat.checkSelfPermission(this, permissionArray[i]) != PackageManager.PERMISSION_GRANTED) {
                    //先判断有没有权限 ，没有就添加到列表中
                    permissionList.add(permissionArray[i]);
                }
            }
        } else {//这个说明系统版本在6.0之下，不需要动态获取权限。
            if (listener != null) {
                listener.onAllow(permissionCode);
            }
            return;
        }
        getPermission(permissionCode);
    }

    /**
     * 获取权限
     */
    private void getPermission(int permissionCode) {
        if (!permissionList.isEmpty()) {
            //请求权限方法  并将List转为数组
            String[] permissions = (String[]) permissionList.toArray(new String[permissionList.size()]);
            ActivityCompat.requestPermissions(this, permissions, permissionCode);
        } else {
            if (listener != null) {
                listener.onAllow(permissionCode);
            }
        }
    }

    /**
     * 获取权限 重写方法
     *
     * @param requestCode  获取权限时设置的唯一标识
     * @param permissions  索要获取的权限
     * @param grantResults 获取结果
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        for (int i = 0; i < grantResults.length; i++) {
            if (grantResults[i] != PackageManager.PERMISSION_GRANTED) {
                //判断是否勾选禁止后不再询问
                boolean showRequestPermission = ActivityCompat.shouldShowRequestPermissionRationale(this, permissions[i]);
                if (showRequestPermission) {
                    // 禁止 & 未勾选禁止后不在访问
                    if (listener != null) {
                        listener.onRefuse(requestCode);
                    }
                    return;
                } else {
                    // 禁止 & 勾选禁止后不再访问
                    if (listener != null) {
                        listener.onRefuseAndDoNotAsk(requestCode);
                    }
                }
            } else {
                //获取权限成功
                if (listener != null) {
                    listener.onAllow(requestCode);
                }
            }
        }
    }

    /**
     * 权限获取回调接口
     */
    public interface PermissionListener {
        /**
         * 用户已授权此次请求全部权限
         *
         * @param permissionCode 权限请求码
         */
        void onAllow(int permissionCode);

        /**
         * 用户拒绝授权此次请求的权限
         *
         * @param permissionCode 权限请求码
         */
        void onRefuse(int permissionCode);

        /**
         * 用户拒绝授权此次请求的权限且勾选不再提示
         *
         * @param permissionCode 权限请求码
         */
        void onRefuseAndDoNotAsk(int permissionCode);
    }

    private PermissionListener listener;

    /**
     * 设置权限回调接口
     *
     * @param listener 接口实例
     */
    public void setPermissionList(PermissionListener listener) {
        this.listener = listener;
    }


}
