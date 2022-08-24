package com.agora.crane.activity;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.bean.TokenBean;
import com.agora.crane.databinding.ActivityCallCameraBinding;
import com.agora.crane.net.BaseUrl;
import com.agora.crane.net.IRequestCallback;
import com.agora.crane.net.NetUtil;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.GsonUtil;
import com.agora.crane.utils.UserManager;

import io.agora.rtc.IRtcEngineEventHandler;
import io.agora.rtc.RtcEngine;
import io.agora.rtc.video.VideoEncoderConfiguration;


/**
 * @Author: hyx
 * @Date: 2022/7/21
 * @introduction 通话界面(摄像头)
 */

public class CallCameraActivity extends BaseActivity<ActivityCallCameraBinding> {

    /**
     * 申请权限码
     */
    private static final int PERMISSION_CODE = 22;
    private String conversationId;
    private RtcEngine mRtcEngine;
    private int myUid;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String conversationId) {
        Intent mIntent = new Intent(mActivity, CallCameraActivity.class);
        mIntent.putExtra("conversationId", conversationId);
        mActivity.startActivity(mIntent);
    }

    /**
     * 视频通话监听
     */
    private final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {
        @Override
        // 监听频道内的远端用户，获取用户的 uid 信息。
        public void onUserJoined(int uid, int elapsed) {
            if (mRtcEngine != null && uid != myUid) {
                mRtcEngine.muteRemoteAudioStream(uid, true);
            }
        }

        @Override
        public void onNetworkQuality(int uid, int txQuality, int rxQuality) {
            super.onNetworkQuality(uid, txQuality, rxQuality);
        }
    };

    /**
     * 设置布局之前做的初始化工作
     */
    @Override
    protected void initAfterSetContentView() {
        needFullScreen = true;
        super.initAfterSetContentView();
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        myUid = Constant.getCodeRole();
        String userRole = String.format(getString(R.string.user_role), UserManager.getRoleName());
        mBinding.tvCallCameraRole.setText(userRole);
        requestPermission(new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO}, PERMISSION_CODE);
    }

    @Override
    protected void setListener() {
        super.setListener();
        conversationId = getIntent().getStringExtra("conversationId");
        setPermissionList(new PermissionListener() {
            @Override
            public void onAllow(int permissionCode) {
                if (PERMISSION_CODE == permissionCode) {
                    initializeAndJoinChannel();
                }
            }

            @Override
            public void onRefuse(int permissionCode) {

            }

            @Override
            public void onRefuseAndDoNotAsk(int permissionCode) {

            }
        });
    }

    /**
     * 初始化和加入频道
     */
    private void initializeAndJoinChannel() {

        NetUtil.getRequest(BaseUrl.GET_CALL_TOKEN + conversationId, new IRequestCallback() {
            @Override
            public void onSuccess(String success) {
                if (success != null && success.length() > 0) {
                    TokenBean bean = GsonUtil.fromJson(success, TokenBean.class);
                    if (bean != null) {
                        try {
                            mRtcEngine = RtcEngine.create(getBaseContext(), Constant.APP_ID, mRtcEventHandler);
                        } catch (Exception e) {
                            throw new RuntimeException("Check the error.");
                        }
                        // 视频默认禁用，你需要调用 enableVideo 开始视频流。
                        mRtcEngine.enableVideo();
                        int width = 640, height = 480;
                        String videoConfig = UserManager.getVideo();
                        if (UserManager.VIDEO_HIGH.equals(videoConfig)) {
                            width = 960;
                            height = 720;
                        } else if (UserManager.VIDEO_LOW.equals(videoConfig)) {
                            width = 480;
                            height = 360;
                        }
                        VideoEncoderConfiguration.VideoDimensions dimensions = new VideoEncoderConfiguration.VideoDimensions(width, height);
                        VideoEncoderConfiguration configuration = new VideoEncoderConfiguration(dimensions, VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_15, 0, VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE);
                        mRtcEngine.setVideoEncoderConfiguration(configuration);
                        mRtcEngine.joinChannel(bean.getData(), conversationId, "", myUid);
                    }
                }
            }

            @Override
            public void onFailure(String message) {
            }
        }, this);
    }

    /**
     * 点击事件
     *
     * @param view 点击的控件
     */
    @Override
    public void onClick(View view) {

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mRtcEngine != null) {
            mRtcEngine.leaveChannel();
            RtcEngine.destroy();
        }
    }
}