package com.qingkouwei.handyinstruction.section.me.activity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.section.base.BaseInitActivity;
import com.hyphenate.easeui.widget.EaseTitleBar;

public class NamePasswordActivity extends BaseInitActivity {
    private EaseTitleBar titleBar;

    @Override
    protected int getLayoutId() {
        return R.layout.demo_activity_name_password;
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar = findViewById(R.id.title_bar);
    }

    @Override
    protected void initListener() {
        super.initListener();
        titleBar.setOnBackPressListener(new EaseTitleBar.OnBackPressListener() {
            @Override
            public void onBackPress(View view) {
                back(view);
            }
        });
    }

    public void back(View view) {
        setResult(RESULT_CANCELED);
        finish();
    }

    public void onOk(View view) {
        String username = ((EditText)findViewById(R.id.username)).getText().toString().trim();
        String password = ((EditText)findViewById(R.id.password)).getText().toString().trim();
        setResult(RESULT_OK, new Intent().putExtra("username", username).putExtra("password", password));
        finish();
    }

    public void onCancel(View view) {
        setResult(RESULT_CANCELED);
        finish();
    }

}
