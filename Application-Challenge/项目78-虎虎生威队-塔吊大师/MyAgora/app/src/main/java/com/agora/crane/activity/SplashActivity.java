package com.agora.crane.activity;

import android.os.Bundle;
import android.os.Handler;
import android.view.View;


import com.agora.crane.databinding.ActivitySplashBinding;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;

/**
 * @Author: hyx
 * @Date: 2022/7/23
 * @introduction 启动页
 */
public class SplashActivity extends BaseActivity<ActivitySplashBinding> {


    /**
     * 设置布局之前做的初始化工作
     */
    @Override
    protected void initAfterSetContentView() {
        needFullScreen = true;
        super.initAfterSetContentView();
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        WindowUtil.getScreenSize(this);
        new Handler().postDelayed(() -> {
            boolean isLogin = UserManager.getLoginStatus();
            if (isLogin) {
                MainActivity.skipActivity(SplashActivity.this);
            } else {
                LoginActivity.skipActivity(SplashActivity.this);
            }
            finish();
        }, 2000);
    }

    @Override
    public void onClick(View view) {

    }
}