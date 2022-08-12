package com.qingkouwei.handyinstruction.section.login.fragment;

import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.text.Editable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.TextPaint;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;
import com.hyphenate.EMError;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.interfaceOrImplement.OnResourceParseCallback;
import com.qingkouwei.handyinstruction.common.utils.ToastUtils;
import com.qingkouwei.handyinstruction.section.base.BaseInitFragment;
import com.qingkouwei.handyinstruction.section.base.WebViewActivity;
import com.qingkouwei.handyinstruction.section.login.viewmodels.LoginViewModel;
import com.hyphenate.easeui.utils.EaseEditTextUtils;
import com.hyphenate.easeui.widget.EaseTitleBar;

public class RegisterFragment extends BaseInitFragment implements TextWatcher, View.OnClickListener, EaseTitleBar.OnBackPressListener{

    private EaseTitleBar mToolbarRegister;
    private EditText mEtLoginName;
    private EditText mEtLoginPwd;
    private EditText mEtLoginPwdConfirm;
    private Button mBtnLogin;
    private String mUserName;
    private String mPwd;
    private String mPwdConfirm;
    private LoginViewModel mViewModel;
    private Drawable clear;
    private Drawable eyeOpen;
    private Drawable eyeClose;

    @Override
    protected int getLayoutId() {
        return R.layout.demo_fragment_register;
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        mToolbarRegister = findViewById(R.id.toolbar_register);
        mEtLoginName = findViewById(R.id.et_login_name);
        mEtLoginPwd = findViewById(R.id.et_login_pwd);
        mEtLoginPwdConfirm = findViewById(R.id.et_login_pwd_confirm);
        mBtnLogin = findViewById(R.id.btn_login);
    }

    @Override
    protected void initListener() {
        super.initListener();
        mEtLoginName.addTextChangedListener(this);
        mEtLoginPwd.addTextChangedListener(this);
        mEtLoginPwdConfirm.addTextChangedListener(this);
        mBtnLogin.setOnClickListener(this);
        mToolbarRegister.setOnBackPressListener(this);
        EaseEditTextUtils.clearEditTextListener(mEtLoginName);
    }

    @Override
    protected void initData() {
        super.initData();
        mViewModel = new ViewModelProvider(mContext).get(LoginViewModel.class);
        mViewModel.getRegisterObservable().observe(this, response -> {
            parseResource(response, new OnResourceParseCallback<String>(true) {
                @Override
                public void onSuccess(String data) {
                    ToastUtils.showToast(getResources().getString(R.string.em_register_success));
                    onBackPress();
                }

                @Override
                public void onError(int code, String message) {
                    if(code == EMError.USER_ALREADY_EXIST) {
                        ToastUtils.showToast(R.string.demo_error_user_already_exist);
                    }else {
                        ToastUtils.showToast(message);
                    }
                }

                @Override
                public void onLoading(String data) {
                    super.onLoading(data);
                    showLoading();
                }

                @Override
                public void hideLoading() {
                    super.hideLoading();
                    dismissLoading();
                }
            });

        });
        //切换密码可见不可见的两张图片
        eyeClose = getResources().getDrawable(R.drawable.d_pwd_hide);
        eyeOpen = getResources().getDrawable(R.drawable.d_pwd_show);
        clear = getResources().getDrawable(R.drawable.d_clear);
        EaseEditTextUtils.changePwdDrawableRight(mEtLoginPwd, eyeClose, eyeOpen, null, null, null);
        EaseEditTextUtils.changePwdDrawableRight(mEtLoginPwdConfirm, eyeClose, eyeOpen, null, null, null);
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {

    }

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {

    }

    @Override
    public void afterTextChanged(Editable s) {
        checkEditContent();
    }

    private void checkEditContent() {
        mUserName = mEtLoginName.getText().toString().trim();
        mPwd = mEtLoginPwd.getText().toString().trim();
        mPwdConfirm = mEtLoginPwdConfirm.getText().toString().trim();
        EaseEditTextUtils.showRightDrawable(mEtLoginName, clear);
        EaseEditTextUtils.showRightDrawable(mEtLoginPwd, eyeClose);
        EaseEditTextUtils.showRightDrawable(mEtLoginPwdConfirm, eyeClose);
        setButtonEnable(!TextUtils.isEmpty(mUserName) && !TextUtils.isEmpty(mPwd) && !TextUtils.isEmpty(mPwdConfirm));
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_login :
                registerToHx();
                break;
        }
    }

    private void registerToHx() {
        if(!TextUtils.isEmpty(mUserName) && !TextUtils.isEmpty(mPwd) && !TextUtils.isEmpty(mPwdConfirm)) {
            if(!TextUtils.equals(mPwd, mPwdConfirm)) {
                showToast(R.string.em_password_confirm_error);
                return;
            }
            mViewModel.register(mUserName, mPwd);
        }
    }

    private void setButtonEnable(boolean enable) {
        mBtnLogin.setEnabled(enable);
        //同时需要修改右侧drawalbeRight对应的资源
//        Drawable rightDrawable;
//        if(enable) {
//            rightDrawable = ContextCompat.getDrawable(mContext, R.drawable.demo_login_btn_right_enable);
//        }else {
//            rightDrawable = ContextCompat.getDrawable(mContext, R.drawable.demo_login_btn_right_unable);
//        }
//        mBtnLogin.setCompoundDrawablesWithIntrinsicBounds(null, null, rightDrawable, null);
    }

    @Override
    public void onBackPress(View view) {
        onBackPress();
    }

    private abstract class MyClickableSpan extends ClickableSpan {

        @Override
        public void updateDrawState(@NonNull TextPaint ds) {
            super.updateDrawState(ds);
            ds.bgColor = Color.TRANSPARENT;
            ds.setColor(ContextCompat.getColor(mContext, R.color.white));
        }
    }
}
