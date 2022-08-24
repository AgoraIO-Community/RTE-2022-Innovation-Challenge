package com.agora.crane.activity;

import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivityTestBinding;
import com.agora.crane.utils.HLog;
import com.agora.crane.utils.WindowUtil;

public class TestActivity extends BaseActivity<ActivityTestBinding> {

    private int[] moveDistance;

    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.btStart, mBinding.btEnd);
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.bt_start:
                startAnim1(mBinding.iv);
                break;
            case R.id.bt_end:
                endAnim1(mBinding.iv);
                break;
            default:
                break;
        }
    }

    private void startAnim1(View mView) {
        moveDistance = getMoveDistance(mView);
        HLog.e("开始的x:" + moveDistance[0] + "  到达的x:" + moveDistance[2]);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mView, "scaleX", 1, 2);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mView, "scaleY", 1, 2);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mView, "translationX", 0, moveDistance[2] - moveDistance[0]);
        //  ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mView, "translationY", moveDistance[1], moveDistance[3]);
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(animScaleX, animScaleY, animTranslationX);
        animatorSet.setDuration(300);
        //   animatorSet.setInterpolator(new LinearInterpolator());
        animatorSet.start();

    }

    private void endAnim1(View mView) {
        HLog.e("开始的x:" + moveDistance[0] + "  到达的x:" + moveDistance[2]);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mView, "scaleX", 2, 1);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mView, "scaleY", 2, 1);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mView, "translationX", moveDistance[2] - moveDistance[0], 0);
        //  ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mView, "translationY", moveDistance[3], moveDistance[1]);
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(animScaleX, animScaleY, animTranslationX);
        animatorSet.setDuration(300);
        //   animatorSet.setInterpolator(new LinearInterpolator());
        animatorSet.start();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                moveDistance = getMoveDistance(mView);
                HLog.e("开始的x:" + moveDistance[0] + "  到达的x:" + moveDistance[2]);
            }
        }, 500);
    }

    /**
     * 获取要求移动的距离，先获取当前控件的位置坐标，然后获取屏幕中间的坐标，由于刚好放大了一倍，所以移动后的距离再减去一个视频控件的宽度，得到最后移动的距离
     * 因为是横屏，所以算移动距离时屏幕宽高要对调
     *
     * @param mView 需要操作的控件
     * @return 返回移动距离
     */
    private int[] getMoveDistance(View mView) {
        int[] position = new int[2];
        mView.getLocationOnScreen(position);
        int[] toPosition = new int[]{(WindowUtil.SCREEN_HEIGHT - WindowUtil.VIDEO_WIDTH) / 2, (WindowUtil.SCREEN_WIDTH - WindowUtil.VIDEO_HEIGHT) / 2};
        return new int[]{position[0], position[1], toPosition[0] - position[0], toPosition[1] - position[1]};
    }
}