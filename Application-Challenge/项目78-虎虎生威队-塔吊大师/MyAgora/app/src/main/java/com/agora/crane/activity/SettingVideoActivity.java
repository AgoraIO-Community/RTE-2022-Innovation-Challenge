package com.agora.crane.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivitySettingVideoBinding;
import com.agora.crane.utils.UserManager;

/**
 * @Author: hyx
 * @Date: 2022/8/7
 * @introduction 设置视频界面
 */
public class SettingVideoActivity extends BaseActivity<ActivitySettingVideoBinding> {


    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, SettingVideoActivity.class);
        mActivity.startActivity(mIntent);
    }


    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        checkVideo();
        showBackButton();
        setTitle(getString(R.string.set_video));
    }

    /**
     * 检测当前的角色
     */
    private void checkVideo() {
        String video = UserManager.getVideo();
        switch (video) {
            case UserManager.VIDEO_LOW:
                mBinding.rgVideo.check(R.id.rb_video_low);
                break;
            case UserManager.VIDEO_MIDDLE:
                mBinding.rgVideo.check(R.id.rb_video_middle);
                break;
            case UserManager.VIDEO_HIGH:
                mBinding.rgVideo.check(R.id.rb_video_high);
                break;
        }
    }

    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.rgVideo.setOnCheckedChangeListener((radioGroup, i) -> {
            switch (i) {
                case R.id.rb_video_low:
                    UserManager.saveVideo(UserManager.VIDEO_LOW);
                    break;
                case R.id.rb_video_middle:
                    UserManager.saveVideo(UserManager.VIDEO_MIDDLE);
                    break;
                case R.id.rb_video_high:
                    UserManager.saveVideo(UserManager.VIDEO_HIGH);
                    break;
                default:
                    break;
            }
        });
    }

    @Override
    public void onClick(View view) {

    }
}