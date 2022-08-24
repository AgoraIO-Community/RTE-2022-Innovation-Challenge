package com.agora.crane.activity;

import static com.agora.crane.utils.Constant.ORDER_BACK;
import static com.agora.crane.utils.Constant.ORDER_CALL;
import static com.agora.crane.utils.Constant.ORDER_DOWN;
import static com.agora.crane.utils.Constant.ORDER_FORWARD;
import static com.agora.crane.utils.Constant.ORDER_HANG_UP;
import static com.agora.crane.utils.Constant.ORDER_LEFT;
import static com.agora.crane.utils.Constant.ORDER_OK;
import static com.agora.crane.utils.Constant.ORDER_PICK_UP;
import static com.agora.crane.utils.Constant.ORDER_RIGHT;
import static com.agora.crane.utils.Constant.ORDER_UP;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.bean.TokenBean;
import com.agora.crane.databinding.ActivityCallConstructionBinding;
import com.agora.crane.net.BaseUrl;
import com.agora.crane.net.IRequestCallback;
import com.agora.crane.net.NetUtil;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.GsonUtil;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMCmdMessageBody;
import com.hyphenate.chat.EMMessage;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import io.agora.rtc.IRtcEngineEventHandler;
import io.agora.rtc.RtcEngine;
import io.agora.rtc.video.VideoEncoderConfiguration;

/**
 * @Author: hyx
 * @Date: 2022/7/21
 * @introduction 通话界面(现场施工)
 */
public class CallConstructionActivity extends BaseActivity<ActivityCallConstructionBinding> {

    /**
     * 申请权限码
     */
    private static final int PERMISSION_CODE = 22;

    private String conversationId;
    /**
     * 标记动画是否播放结束，播放过程不做其他处理
     */
    private boolean animPlayFinish = true;
    /**
     * 设置当前播放动画的控件的层级
     */
    private int currentZ = 10;
    /**
     * 标记是否是放大状态，是的话再点击则缩小
     */
    private boolean statusBig = false;

    private int[] moveDistance;

    private RtcEngine mRtcEngine;

    /**
     * 是否与操作员通话中
     */
    private boolean calling = false;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String conversationId) {
        Intent mIntent = new Intent(mActivity, CallConstructionActivity.class);
        mIntent.putExtra("conversationId", conversationId);
        mActivity.startActivity(mIntent);
    }

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
        requestPermission(new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO}, PERMISSION_CODE);
        setOnClickViewList(mBinding.ivCallConstructionLeft, mBinding.ivCallConstructionUp, mBinding.ivCallConstructionRight,
                mBinding.ivCallConstructionDown, mBinding.ivCallConstructionForward, mBinding.ivCallConstructionBack,
                mBinding.layoutOperator, mBinding.clCallConstructionCallToOperator, mBinding.tvCallConstructionOk,
                mBinding.tvCallConstructionHangUp, mBinding.tvCallConstructionPickUp);
        EventBus.getDefault().register(this);
    }

    /**
     * 视频通话监听
     */
    private final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {
        @Override
        // 监听频道内的远端用户，获取用户的 uid 信息。
        public void onUserJoined(int uid, int elapsed) {
            runOnUiThread(() -> {
                // 从 onUserJoined 回调获取 uid 后，设置远端视频视图。
                if (Constant.CODE_ROLE_OPERATOR == uid) {
                    mBinding.layoutOperator.setUid(uid, mRtcEngine);
                }
            });
        }

        @Override
        public void onNetworkQuality(int uid, int txQuality, int rxQuality) {
            super.onNetworkQuality(uid, txQuality, rxQuality);
            mBinding.layoutOperator.setNetworkQuality(txQuality);
        }
    };

    /**
     * 监听eventBus事件
     *
     * @param bean 参数
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onMessageEvent(EventBusBean bean) {
        if (bean != null) {
            switch (bean.getType()) {
                //接收操作指令
                case EventBusBean.TYPE_ORDER:
                    parseOrder(bean.getContent());
                    break;
                default:
                    break;
            }
        }
    }


    /**
     * 解析指令
     *
     * @param content 消息内容
     */
    private void parseOrder(String content) {
        if (content.contains(ORDER_CALL)) {
            mBinding.clCallConstructionCallToOperator.setVisibility(View.GONE);
            mBinding.tvCallConstructionHangUp.setVisibility(View.VISIBLE);
            mBinding.tvCallConstructionPickUp.setVisibility(View.VISIBLE);
        } else if (content.contains(ORDER_PICK_UP)) {
            mBinding.tvCallConstructionCall.setText(getString(R.string.call_to_operator_pick_up));
            if (animPlayFinish && !statusBig) {
                enlargeAnim();
            }
        } else if (content.contains(ORDER_HANG_UP)) {
            calling = false;
            mBinding.tvCallConstructionCall.setText(getString(R.string.call_to_operator));
            if (animPlayFinish && statusBig) {
                narrowAnim();
            }
        }
    }


    /**
     * 设置监听
     */
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
                        mRtcEngine.joinChannel(bean.getData(), conversationId, "", Constant.getCodeRole());
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
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.iv_call_construction_left:
                sendOrder(ORDER_LEFT);
                break;
            case R.id.iv_call_construction_up:
                sendOrder(ORDER_UP);
                break;
            case R.id.iv_call_construction_right:
                sendOrder(ORDER_RIGHT);
                break;
            case R.id.iv_call_construction_down:
                sendOrder(ORDER_DOWN);
                break;
            case R.id.iv_call_construction_forward:
                sendOrder(ORDER_FORWARD);
                break;
            case R.id.iv_call_construction_back:
                sendOrder(ORDER_BACK);
                break;
            case R.id.layout_operator:
                if (!animPlayFinish) {
                    return;
                }
                if (statusBig) {
                    narrowAnim();
                    return;
                }
                enlargeAnim();
                break;
            case R.id.cl_call_construction_call_to_operator:
                if (calling) {
                    sendOrder(ORDER_HANG_UP);
                    mBinding.tvCallConstructionCall.setText(getString(R.string.call_to_operator));
                } else {
                    sendOrder(ORDER_CALL);
                    mBinding.tvCallConstructionCall.setText(getString(R.string.call_to_operator_ing));
                }
                calling = !calling;
                break;
            case R.id.tv_call_construction_ok:
                sendOrder(ORDER_OK);
                break;
            case R.id.tv_call_construction_pick_up:
                sendOrder(ORDER_PICK_UP);
                pickUp();
                break;
            case R.id.tv_call_construction_hang_up:
                sendOrder(ORDER_HANG_UP);
                hangUp();
                break;
            default:
                break;
        }
    }

    /**
     * 接受
     */
    private void pickUp() {
        mBinding.tvCallConstructionPickUp.setVisibility(View.GONE);
        if (animPlayFinish && !statusBig) {
            enlargeAnim();
        }
    }

    /**
     * 挂断
     */
    private void hangUp() {
        mBinding.clCallConstructionCallToOperator.setVisibility(View.VISIBLE);
        mBinding.tvCallConstructionPickUp.setVisibility(View.GONE);
        mBinding.tvCallConstructionHangUp.setVisibility(View.GONE);
    }

    /**
     * 发送指令
     *
     * @param action 指令
     */
    private void sendOrder(String action) {
        EMMessage cmdMsg = EMMessage.createSendMessage(EMMessage.Type.CMD);
        cmdMsg.setChatType(EMMessage.ChatType.GroupChat);
        EMCmdMessageBody cmdBody = new EMCmdMessageBody(action);
        cmdMsg.setTo(conversationId);
        cmdMsg.addBody(cmdBody);
        EMClient.getInstance().chatManager().sendMessage(cmdMsg);
    }


    /**
     * 放大动画
     */
    private void enlargeAnim() {
        mBinding.viewMaskCallConstruction.setZ(currentZ);
        mBinding.viewMaskCallConstruction.setVisibility(View.VISIBLE);
        currentZ++;
        mBinding.layoutOperator.setZ(currentZ);
        moveDistance = getMoveDistance(mBinding.layoutOperator);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mBinding.layoutOperator, "scaleX", 1, 2);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mBinding.layoutOperator, "scaleY", 1, 2);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mBinding.layoutOperator, "translationX", 0, moveDistance[2]);
        ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mBinding.layoutOperator, "translationY", 0, moveDistance[3]);
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(animScaleX, animScaleY, animTranslationX, animTranslationY);
        animatorSet.setDuration(300);
        animatorSet.start();
        animatorSet.addListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animator) {
                animPlayFinish = false;
            }

            @Override
            public void onAnimationEnd(Animator animator) {
                animPlayFinish = true;
                statusBig = true;
            }

            @Override
            public void onAnimationCancel(Animator animator) {

            }

            @Override
            public void onAnimationRepeat(Animator animator) {

            }
        });
    }

    /**
     * 缩小动画
     */
    private void narrowAnim() {
        mBinding.viewMaskCallConstruction.setVisibility(View.GONE);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mBinding.layoutOperator, "scaleX", 2, 1);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mBinding.layoutOperator, "scaleY", 2, 1);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mBinding.layoutOperator, "translationX", moveDistance[2], 0);
        ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mBinding.layoutOperator, "translationY", moveDistance[3], 0);
        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.playTogether(animScaleX, animScaleY, animTranslationX, animTranslationY);
        animatorSet.setDuration(300);
        animatorSet.start();
        animatorSet.addListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animator) {
                animPlayFinish = false;
            }

            @Override
            public void onAnimationEnd(Animator animator) {
                animPlayFinish = true;
                statusBig = false;
            }

            @Override
            public void onAnimationCancel(Animator animator) {

            }

            @Override
            public void onAnimationRepeat(Animator animator) {

            }
        });
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
        mView.getLocationInWindow(position);
        int[] toPosition = new int[]{(WindowUtil.SCREEN_HEIGHT - WindowUtil.VIDEO_WIDTH) / 2, (WindowUtil.SCREEN_WIDTH - WindowUtil.VIDEO_HEIGHT) / 2};
        return new int[]{position[0], position[1], toPosition[0] - position[0], toPosition[1] - position[1]};
    }

    /**
     * 界面销毁
     */
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mRtcEngine != null) {
            mRtcEngine.leaveChannel();
            RtcEngine.destroy();
        }
        EventBus.getDefault().unregister(this);
    }
}