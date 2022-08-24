package com.agora.crane.activity;

import static com.agora.crane.utils.Constant.getAppVersionName;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivityRegisterBinding;
import com.agora.crane.utils.ToastUtil;
import com.hyphenate.chat.EMClient;
import com.hyphenate.exceptions.HyphenateException;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 注册界面
 */
public class RegisterActivity extends BaseActivity<ActivityRegisterBinding> {


    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, RegisterActivity.class);
        mActivity.startActivity(mIntent);
    }

    @Override
    protected void initAfterSetContentView() {
        needFullScreen = true;
        super.initAfterSetContentView();
    }

    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.tvRegister, mBinding.ivRegisterCleanAccount, mBinding.ivRegisterCleanPassword);
        String appInfo = getString(R.string.application_name) + getAppVersionName();
        mBinding.tvRegisterAppName.setText(appInfo);
    }

    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.etRegisterAccount.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable == null || editable.length() == 0) {
                    mBinding.ivRegisterCleanAccount.setVisibility(View.GONE);
                } else {
                    mBinding.ivRegisterCleanAccount.setVisibility(View.VISIBLE);
                }
            }
        });
        mBinding.etRegisterPassword.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable == null || editable.length() == 0) {
                    mBinding.ivRegisterCleanPassword.setVisibility(View.GONE);
                } else {
                    mBinding.ivRegisterCleanPassword.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv_register:
                register();
                break;
            case R.id.iv_register_clean_account:
                mBinding.etRegisterAccount.setText("");
                break;
            case R.id.iv_register_clean_password:
                mBinding.etRegisterPassword.setText("");
                break;
            default:
        }
    }

    /**
     * 注册
     */
    private void register() {
        String userName = mBinding.etRegisterAccount.getText().toString();
        String password = mBinding.etRegisterPassword.getText().toString();
        if (userName.length() == 0) {
            ToastUtil.show(getString(R.string.please_input_account));
            return;
        }
        if (password.length() == 0) {
            ToastUtil.show(getString(R.string.please_input_password));
            return;
        }
        showLoading("");
        new Thread(() -> {
            try {
                EMClient.getInstance().createAccount(userName, password);
                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    runOnUiThread(() -> {
                        hideLoading();
                        ToastUtil.show(getString(R.string.register_success));
                        finish();
                    });
                },1000);
            } catch (HyphenateException e) {
                e.printStackTrace();
                runOnUiThread(() -> {
                    hideLoading();
                    ToastUtil.show(getString(R.string.register_failure) + e.toString());
                });
            }
        }).start();
    }
}