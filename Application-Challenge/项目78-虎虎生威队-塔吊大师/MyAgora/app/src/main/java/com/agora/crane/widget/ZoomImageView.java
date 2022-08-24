package com.agora.crane.widget;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.Animation;
import android.view.animation.ScaleAnimation;

import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatImageView;

import com.agora.crane.utils.DoubleClickUtil;

/**
 * @Author: hyx
 * @Date: 2022/8/21
 * @introduction  点击缩放的ImageView
 */
public class ZoomImageView extends AppCompatImageView {

    /**
     * 构造方法
     * @param context  上下文
     * @param attrs    属性集
     */
    public ZoomImageView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    /**
     * 触摸事件
     *
     * @param event event对象
     * @return 返回值
     */
    @SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN && isEnabled()) {
            if (DoubleClickUtil.isFastClick()) {
                setClickable(false);
                return false;
            } else {
                setClickable(true);
            }
            ScaleAnimation scaleAnimation = new ScaleAnimation(1.0f, 0.95f, 1.0f, 0.95f, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
            scaleAnimation.setDuration(100);
            scaleAnimation.setRepeatCount(1);
            scaleAnimation.setRepeatMode(Animation.REVERSE);
            scaleAnimation.setInterpolator(new AccelerateDecelerateInterpolator());
            startAnimation(scaleAnimation);
        }
        return super.onTouchEvent(event);
    }

    /**
     * 执行点击事件
     */
    @Override
    public boolean performClick() {
        return super.performClick();
    }
}