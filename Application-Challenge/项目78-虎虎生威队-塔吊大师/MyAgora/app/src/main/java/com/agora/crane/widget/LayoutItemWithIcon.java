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
import com.agora.crane.databinding.LayoutItemWithIconBinding;

/**
 * @Author: hyx
 * @Date: 2022/8/1
 * @introduction
 */
public class LayoutItemWithIcon extends ConstraintLayout {

    private final LayoutItemWithIconBinding mBinding;

    /**
     * 构造方法
     *
     * @param context 上下文
     * @param attrs   属性集
     */
    public LayoutItemWithIcon(@NonNull Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    /**
     * 构造方法
     *
     * @param context      上下文
     * @param attrs        属性集
     * @param defStyleAttr 样式属性
     */
    public LayoutItemWithIcon(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        mBinding = LayoutItemWithIconBinding.inflate(LayoutInflater.from(context), this, true);
        TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.layout_item, 0, 0);
        String title = typedArray.getString(R.styleable.layout_item_item_title);
        int iconLeft = typedArray.getResourceId(R.styleable.layout_item_item_icon, 0);
        if (!TextUtils.isEmpty(title)) {
            mBinding.tvItemTitle.setText(title);
        }
        if (iconLeft != 0) {
            mBinding.ivItemLeft.setImageResource(iconLeft);
        }
    }

}
