package com.agora.crane.popupwindow;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.PopupWindow;
import android.widget.TextView;

import com.agora.crane.R;

/**
 * @Author: hyx
 * @Date: 2022/8/8
 * @introduction 退出登录确认
 */
public class PopupWindowTip extends PopupWindow implements View.OnClickListener {

    /**
     * 布局控件
     */
    private View viewRoot;
    private TextView tvSure, tvCancel, tvTipContent;

    /**
     * 构造方法
     *
     * @param mContext 上下文
     */
    public PopupWindowTip(Context mContext) {
        viewRoot = LayoutInflater.from(mContext).inflate(R.layout.popupwindow_tip, null);
        setContentView(viewRoot);
        setWidth(ViewGroup.LayoutParams.MATCH_PARENT);
        setHeight(ViewGroup.LayoutParams.MATCH_PARENT);
        setOutsideTouchable(true);
        setFocusable(true);
        tvSure = viewRoot.findViewById(R.id.tv_popup_window_tip_sure);
        tvCancel = viewRoot.findViewById(R.id.tv_popup_window_tip_cancel);
        tvTipContent = viewRoot.findViewById(R.id.tv_popup_window_tip_content);
        tvSure.setOnClickListener(this);
        tvCancel.setOnClickListener(this);
    }

    /**
     * 设置提示方案
     *
     * @param tip 提示方案
     */
    public void setTip(String tip) {
        tvTipContent.setText(tip);
    }


    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        if (mClickListener == null) {
            return;
        }
        switch (view.getId()) {
            case R.id.tv_popup_window_tip_sure:
                mClickListener.onClickSure();
                break;
            default:
                break;
        }
        dismiss();
    }

    public interface ClickListener {

        /**
         * 点击确定
         */
        void onClickSure();

    }

    private ClickListener mClickListener;

    /**
     * 设置监听器
     *
     * @param mClickListener 监听器对象
     */
    public void setClickListener(ClickListener mClickListener) {
        this.mClickListener = mClickListener;
    }

}
