package com.agora.crane.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.LayoutInflater;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;

import com.agora.crane.R;
import com.agora.crane.databinding.LayoutTitleBarBinding;

/**
 * @Author: hyx
 * @Date: 2022/8/1
 * @introduction 标题控件
 */
public class LayoutTitleBar extends ConstraintLayout {

    private final LayoutTitleBarBinding mBinding;


    public LayoutTitleBar(@NonNull Context context) {
        this(context, null, 0);
    }

    /**
     * 构造方法
     *
     * @param context 上下文
     * @param attrs   属性集
     */
    public LayoutTitleBar(@NonNull Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    /**
     * 构造方法
     *
     * @param context      上下文
     * @param attrs        属性集
     * @param defStyleAttr 样式属性
     */
    public LayoutTitleBar(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        mBinding = LayoutTitleBarBinding.inflate(LayoutInflater.from(context), this, true);
        TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.layout_title, 0, 0);
        String title = typedArray.getString(R.styleable.layout_title_title);
        String titleRight = typedArray.getString(R.styleable.layout_title_title_right);
        int iconLeft = typedArray.getResourceId(R.styleable.layout_title_icon_left, 0);
        int iconRight = typedArray.getResourceId(R.styleable.layout_title_icon_right, 0);
        if (!TextUtils.isEmpty(title)) {
            mBinding.tvTitleBarTitle.setText(title);
        }
        if (!TextUtils.isEmpty(titleRight)) {
            mBinding.tvTitleBarRight.setText(titleRight);
            mBinding.tvTitleBarRight.setVisibility(VISIBLE);
        }
        if (iconLeft != 0) {
            mBinding.ivTitleBarLeft.setImageResource(iconLeft);
            mBinding.ivTitleBarLeft.setVisibility(VISIBLE);
        }
        if (iconRight != 0) {
            mBinding.ivTitleBarRight.setImageResource(iconRight);
            mBinding.ivTitleBarRight.setVisibility(VISIBLE);
        }
        setListener();
    }

    /**
     * 设置点击监听方法
     */
    private void setListener() {
        mBinding.ivTitleBarLeft.setOnClickListener(view -> {
            if (mListener != null) {
                mListener.onClickLeft();
            }
        });
        mBinding.ivTitleBarRight.setOnClickListener(view -> {
            if (mListener != null) {
                mListener.onClickRight();
            }
        });
        mBinding.tvTitleBarRight.setOnClickListener(view -> {
            if (mListener != null) {
                mListener.onClickRight();
            }
        });
    }

    /**
     * 设置标题
     *
     * @param title 标题
     */
    public void setTitle(String title) {
        if (title != null) {
            mBinding.tvTitleBarTitle.setText(title);
        }
    }

    public interface ClickListener {
        /**
         * 点击左边按钮
         */
        void onClickLeft();

        /**
         * 点击右边按钮
         */
        void onClickRight();

    }

    private ClickListener mListener;

    /**
     * 设置点击监听
     *
     * @param mListener 监听器
     */
    public void setClickListener(ClickListener mListener) {
        this.mListener = mListener;
    }
}
