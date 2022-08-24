package com.agora.crane.activity;

import static com.agora.crane.utils.Constant.getAppVersionName;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.KeyEvent;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivityLoginBinding;
import com.agora.crane.utils.MyApplication;
import com.agora.crane.utils.ToastUtil;
import com.agora.crane.utils.UserManager;
import com.hyphenate.EMCallBack;
import com.hyphenate.chat.EMClient;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 登录界面
 */
public class LoginActivity extends BaseActivity<ActivityLoginBinding> {

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, LoginActivity.class);
        mActivity.startActivity(mIntent);
    }

    /**
     * 设置布局之前做的初始化工作
     */
    @Override
    protected void initAfterSetContentView() {
        needFullScreen = true;
        super.initAfterSetContentView();
    }

    /**
     * 初始化
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.ivLoginCleanAccount, mBinding.ivLoginCleanPassword, mBinding.tvLogin, mBinding.tvLoginRegister);
        String appInfo = getString(R.string.application_name) + getAppVersionName();
        mBinding.tvLoginAppName.setText(appInfo);
    }

    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.etAccount.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable == null || editable.length() == 0) {
                    mBinding.ivLoginCleanAccount.setVisibility(View.GONE);
                } else {
                    mBinding.ivLoginCleanAccount.setVisibility(View.VISIBLE);
                }
            }
        });
        mBinding.etLoginPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable == null || editable.length() == 0) {
                    mBinding.ivLoginCleanPassword.setVisibility(View.GONE);
                } else {
                    mBinding.ivLoginCleanPassword.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    /**
     * 点击事件
     * @param view  当前点击的控件
     */
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.iv_login_clean_account:
                mBinding.etAccount.setText("");
                break;
            case R.id.iv_login_clean_password:
                mBinding.etLoginPassword.setText("");
                break;
            case R.id.tv_login:
                login();
                break;
            case R.id.tv_login_register:
                RegisterActivity.skipActivity(LoginActivity.this);
                break;
            default:
                break;
        }
    }

    /**
     * 登录
     */
    private void login() {
        String account = mBinding.etAccount.getText().toString();
        String password = mBinding.etLoginPassword.getText().toString();
        if (TextUtils.isEmpty(account)) {
            ToastUtil.show(R.string.please_input_account);
            return;
        }
        if (TextUtils.isEmpty(password)) {
            ToastUtil.show(R.string.please_input_password);
            return;
        }
        showLoading("");
        EMClient.getInstance().login(account, password, new EMCallBack() {
            // 登录成功回调
            @Override
            public void onSuccess() {
                hideLoading();
                UserManager.saveUserName(account);
                UserManager.saveLoginStatus(true);
                MainActivity.skipActivity(mContext);
                finish();
            }

            // 登录失败回调，包含错误信息
            @Override
            public void onError(final int code, final String error) {
                hideLoading();
                runOnUiThread(() -> ToastUtil.show(getString(R.string.login_failure) + ":" + error));
            }

            @Override
            public void onProgress(int i, String s) {

            }

        });
    }

    /**
     * 菜单、返回键响应
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // TODO Auto-generated method stub
        if(keyCode == KeyEvent.KEYCODE_BACK)
        {
            MyApplication.removeAllActivity();
        }
        return false;
    }
}