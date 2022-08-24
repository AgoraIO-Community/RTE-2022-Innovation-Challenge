package com.agora.crane.activity;

import android.graphics.Color;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewbinding.ViewBinding;

import com.agora.crane.R;
import com.agora.crane.utils.MyApplication;
import com.agora.crane.widget.LoadingDialog;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

/**
 * @Author: hyx
 * @Date: 2022/7/22
 * @introduction 界面基类
 */
public abstract class BaseActivity<W extends ViewBinding> extends BasePermissionActivity implements View.OnClickListener {

    protected W mBinding;
    public boolean needFullScreen = false;
    public boolean needStatusBarTransparent = false;
    public AppCompatActivity mContext;
    public LoadingDialog mLoadingDialog;
    public TextView tvTitle;
    public ActionBar actionBar;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        initAfterSetContentView();
        super.onCreate(savedInstanceState);
        Type superclass = getClass().getGenericSuperclass();
        assert superclass != null;
        Class<?> aClass = (Class<?>) ((ParameterizedType) superclass).getActualTypeArguments()[0];
        try {
            Method method = aClass.getDeclaredMethod("inflate", LayoutInflater.class);
            mBinding = (W) method.invoke(null, getLayoutInflater());
            assert mBinding != null;
            setContentView(mBinding.getRoot());
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
        mContext = this;
        actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setCustomView(R.layout.title_text);
            actionBar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
            actionBar.setDisplayShowCustomEnabled(true);
            tvTitle = actionBar.getCustomView().findViewById(R.id.tv_title);
        }
        setListener();
        initData(savedInstanceState);
        MyApplication.addActivity(this);

    }

    /**
     * 设置布局之前做的初始化工作
     */
    protected void initAfterSetContentView() {
        if (needFullScreen) {
            supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
        if (needStatusBarTransparent) {
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            setNativeLightStatusBar(true);
            getWindow().setStatusBarColor(Color.WHITE);
        }
    }

    /**
     * 设置标题栏文字颜色
     *
     * @param dark true：黑色   false：白色
     */
    public void setNativeLightStatusBar(boolean dark) {
        View decor = getWindow().getDecorView();
        if (dark) {
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        } else {
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    /**
     * 设置标题
     *
     * @param title 标题
     */
    public void setTitle(String title) {
        if (tvTitle != null) {
            tvTitle.setText(title);
        }
    }

    /**
     * 显示返回按钮
     */
    public void showBackButton() {
        if (actionBar != null) {
            actionBar.setHomeButtonEnabled(true);//设置左上角的图标是否可以点击
            actionBar.setDisplayHomeAsUpEnabled(true);//给左上角图标的左边加上一个返回的图标
        }
    }


    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    protected abstract void initData(Bundle savedInstanceState);

    /**
     * 设置监听
     */
    protected void setListener() {
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * 显示进度条
     *
     * @param content 进度条文字，默认：加载中...
     */
    public void showLoading(String content) {
        if (mContext == null || isFinishing()) {
            return;
        }
        if (mLoadingDialog == null) {
            if (!TextUtils.isEmpty(content)) {
                mLoadingDialog = new LoadingDialog(mContext, content);
            } else {
                mLoadingDialog = new LoadingDialog(mContext);
            }
        }

        mLoadingDialog.show();
    }

    /**
     * 隐藏进度条
     */
    public void hideLoading() {
        if (isFinishing()) {
            return;
        }
        if (mLoadingDialog != null && mLoadingDialog.isShowing()) {
            mLoadingDialog.dismiss();
            mLoadingDialog = null;
        }
    }

    /**
     * 设置点击控件
     *
     * @param views 添加的控件
     */
    protected void setOnClickViewList(View... views) {
        if (views == null || views.length == 0) {
            return;
        }

        for (View view : views) {
            view.setOnClickListener(this);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        hideLoading();
    }
}
