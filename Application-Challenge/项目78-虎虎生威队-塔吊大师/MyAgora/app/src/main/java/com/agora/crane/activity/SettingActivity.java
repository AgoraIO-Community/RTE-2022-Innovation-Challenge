package com.agora.crane.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivitySettingBinding;
import com.agora.crane.popupwindow.PopupWindowTip;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.HLog;
import com.agora.crane.utils.ToastUtil;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.EMCallBack;
import com.hyphenate.chat.EMClient;

/**
 * @Author: hyx
 * @Date: 2022/8/2
 * @introduction 设置界面
 */
public class SettingActivity extends BaseActivity<ActivitySettingBinding> {

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, SettingActivity.class);
        mActivity.startActivity(mIntent);
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.tvLogout, mBinding.layoutItemSettingRole, mBinding.layoutItemSettingVideo);
        showBackButton();
        setTitle(getString(R.string.setting));
    }

    /**
     * 点击监听
     * @param view 点击的控件
     */
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv_logout:
                showPopupLogout();
                break;
            case R.id.layout_item_setting_role:
                SettingRoleActivity.skipActivity(mContext);
                break;
            case R.id.layout_item_setting_video:
                SettingVideoActivity.skipActivity(mContext);
                break;
            default:
                break;
        }
    }

    /**
     * 显示退出对话框
     */
    private void showPopupLogout(){
        WindowUtil.setBgAlpha(mContext, Constant.MASK_TRAN);
        PopupWindowTip mPopupWindowLogout = new PopupWindowTip(mContext);
        mPopupWindowLogout.setTip(getString(R.string.tip_logout));
        mPopupWindowLogout.showAtLocation(mContext.getWindow().getDecorView(), Gravity.CENTER,0,0);
        mPopupWindowLogout.setClickListener(() -> logout());
        mPopupWindowLogout.setOnDismissListener(() -> WindowUtil.setBgAlpha(mContext,Constant.MASK_LIGHT));
    }

    /**
     * 退出登录
     */
    private void logout() {
        showLoading(getString(R.string.logout_ing));
        EMClient.getInstance().logout(true, new EMCallBack() {
            @Override
            public void onSuccess() {
                hideLoading();
                UserManager.saveLoginStatus(false);
                LoginActivity.skipActivity(mContext);
                finish();
            }

            @Override
            public void onError(int code, String error) {
                HLog.e("退出登录失败code:" + code + "  error:" + error);
                ToastUtil.show(getString(R.string.logout_failure) + error);
            }
        });
    }
}