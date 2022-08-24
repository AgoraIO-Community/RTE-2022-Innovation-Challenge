package com.agora.crane.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivitySettingRoleBinding;
import com.agora.crane.utils.UserManager;

/**
 * @Author: hyx
 * @Date: 2022/8/7
 * @introduction 设置角色界面
 */
public class SettingRoleActivity extends BaseActivity<ActivitySettingRoleBinding> {

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, SettingRoleActivity.class);
        mActivity.startActivity(mIntent);
    }


    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        checkRole();
        showBackButton();
        setTitle(getString(R.string.set_role));
    }

    /**
     * 检测当前的角色
     */
    private void checkRole() {
        String role = UserManager.getRole();
        switch (role) {
            case UserManager.ROLE_OPERATOR:
                mBinding.rgRole.check(R.id.rb_role_operator);
                break;
            case UserManager.ROLE_CONSTRUCTION:
                mBinding.rgRole.check(R.id.rb_role_construction);
                break;
            case UserManager.ROLE_CAMERA_FORWARD:
                mBinding.rgRole.check(R.id.rb_role_camera_forward);
                break;
            case UserManager.ROLE_CAMERA_BACK:
                mBinding.rgRole.check(R.id.rb_role_camera_back);
                break;
            case UserManager.ROLE_CAMERA_LEFT:
                mBinding.rgRole.check(R.id.rb_role_camera_left);
                break;
            case UserManager.ROLE_CAMERA_RIGHT:
                mBinding.rgRole.check(R.id.rb_role_camera_right);
                break;
            case UserManager.ROLE_CAMERA_UP:
                mBinding.rgRole.check(R.id.rb_role_camera_up);
                break;
            case UserManager.ROLE_CAMERA_DOWN:
                mBinding.rgRole.check(R.id.rb_role_camera_down);
                break;
        }
    }


    /**
     * 设置点击控件
     *
     * @param view 添加的控件
     */
    @Override
    public void onClick(View view) {

    }

    @SuppressLint("NonConstantResourceId")
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.rgRole.setOnCheckedChangeListener((radioGroup, i) -> {
            switch (i) {
                case R.id.rb_role_operator:
                    UserManager.saveRole(UserManager.ROLE_OPERATOR);
                    break;
                case R.id.rb_role_construction:
                    UserManager.saveRole(UserManager.ROLE_CONSTRUCTION);
                    break;
                case R.id.rb_role_camera_forward:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_FORWARD);
                    break;
                case R.id.rb_role_camera_back:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_BACK);
                    break;
                case R.id.rb_role_camera_left:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_LEFT);
                    break;
                case R.id.rb_role_camera_right:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_RIGHT);
                    break;
                case R.id.rb_role_camera_up:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_UP);
                    break;
                case R.id.rb_role_camera_down:
                    UserManager.saveRole(UserManager.ROLE_CAMERA_DOWN);
                    break;
                default:
                    break;
            }
        });
    }
}