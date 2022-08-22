package com.agora.crane.widget;

import android.content.Context;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;

import com.agora.crane.R;
import com.airbnb.lottie.LottieAnimationView;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 进度条
 */
public class LoadingDialog extends AlertDialog {

    private TextView tvContent;
    private LottieAnimationView lottieView;
    private String content;

    /**
     * 构造函数
     *
     * @param context 上下文
     */
    public LoadingDialog(Context context) {
        super(context, R.style.loading_dialog);
    }

    /**
     * 构造函数
     *
     * @param context 上下文
     * @param content 显示的文本
     */
    public LoadingDialog(Context context, String content) {
        super(context, R.style.loading_dialog);
        this.content = content;
    }

    /**
     * 创建
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setContentView(R.layout.layout_loading);
        setCanceledOnTouchOutside(false);
        lottieView = findViewById(R.id.lottie_view);
        tvContent = findViewById(R.id.tv_layout_loading_content);
        if (content != null) {
            setContent(content);
        }
    }

    /**
     * 隐藏
     */
    @Override
    public void dismiss() {
        super.dismiss();
        if (lottieView != null && lottieView.isAnimating()) {
            lottieView.clearAnimation();
        }
    }

    /**
     * 设置文字
     *
     * @param content 文字内容
     */
    public void setContent(String content) {
        tvContent.setText(content);
    }

}
