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
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.view.SurfaceView;
import android.view.View;
import android.widget.FrameLayout;

import androidx.interpolator.view.animation.LinearOutSlowInInterpolator;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.bean.TokenBean;
import com.agora.crane.databinding.ActivityCallOperationBinding;
import com.agora.crane.net.BaseUrl;
import com.agora.crane.net.IRequestCallback;
import com.agora.crane.net.NetUtil;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.GsonUtil;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;
import com.agora.crane.widget.LayoutVideo;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMCmdMessageBody;
import com.hyphenate.chat.EMMessage;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import io.agora.rtc.IRtcEngineEventHandler;
import io.agora.rtc.RtcEngine;
import io.agora.rtc.video.VideoCanvas;
import io.agora.rtc.video.VideoEncoderConfiguration;

/**
 * @Author: hyx
 * @Date: 2022/7/21
 * @introduction 通话界面(操作员)
 */
public class CallOperationActivity extends BaseActivity<ActivityCallOperationBinding> {


    /**
     * 申请权限码
     */
    private static final int PERMISSION_CODE = 22;

    /**
     * 填写频道名称。
     */
    private String channelName;

    private RtcEngine mRtcEngine;
    /**
     * 设置当前播放动画的控件的层级
     */
    private int currentZ = 10;
    /**
     * 标记动画是否播放结束，播放过程不做其他处理
     */
    private boolean animPlayFinish = true;
    /**
     * 标记是否是放大状态，是的话再点击则缩小
     */
    private boolean statusBig = false;

    private int[] moveDistance;
    /**
     * 当前执行动画的控件
     */
    private LayoutVideo currentView;

    /**
     * 现场施工uid
     */
    private int constructionId;
    private boolean muteSound = false;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String channelName) {
        Intent mIntent = new Intent(mActivity, CallOperationActivity.class);
        mIntent.putExtra("channelName", channelName);
        mActivity.startActivity(mIntent);
    }

    /**
     * 视频通话监听
     */
    private final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {
        @Override
        // 监听频道内的远端用户，获取用户的 uid 信息。
        public void onUserJoined(int uid, int elapsed) {
            runOnUiThread(() -> {
                // 从 onUserJoined 回调获取 uid 后，调用 setupRemoteVideo，设置远端视频视图。
                setupRemoteVideo(uid);
            });
        }

        @Override
        public void onNetworkQuality(int uid, int txQuality, int rxQuality) {
            super.onNetworkQuality(uid, txQuality, rxQuality);
            setNetworkQuality(uid, rxQuality);
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
        requestPermission(new String[]{Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO}, PERMISSION_CODE);
        setOnClickViewList(mBinding.layoutForward, mBinding.layoutBack, mBinding.layoutLeft, mBinding.layoutRight,
                mBinding.layoutUp, mBinding.layoutDown, mBinding.viewMaskCallOperation,
                mBinding.tvCallOperationHangUp, mBinding.tvCallOperationPickUp,
                mBinding.clCallOperationCallToConstruction, mBinding.ivCallOperationSound);
        EventBus.getDefault().register(this);
        mBinding.waveViewCallOperation.setDuration(6000);
        mBinding.waveViewCallOperation.setStyle(Paint.Style.FILL);
        mBinding.waveViewCallOperation.setColor(Color.parseColor("#ffffff"));
        mBinding.waveViewCallOperation.setStrokeWidth(5);
        mBinding.waveViewCallOperation.setInterpolator(new LinearOutSlowInInterpolator());
    }

    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        channelName = getIntent().getStringExtra("channelName");
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

        NetUtil.getRequest(BaseUrl.GET_CALL_TOKEN + channelName, new IRequestCallback() {
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
                        mRtcEngine.joinChannel(bean.getData(), channelName, "", Constant.getCodeRole());
                    }
                }
            }

            @Override
            public void onFailure(String message) {
            }
        }, this);
    }

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
     * 接受
     */
    private void pickUp() {
        mBinding.tvCallOperationCall.setText(getString(R.string.call_to_operator_pick_up));
    }

    /**
     * 挂断
     */
    private void hangUp() {
        mBinding.waveViewCallOperation.stop();
        mBinding.clCallOperationCallToConstruction.setVisibility(View.VISIBLE);
        mBinding.tvCallOperationPickUp.setVisibility(View.GONE);
        mBinding.tvCallOperationHangUp.setVisibility(View.GONE);
        mBinding.tvCallOperationCall.setText(getString(R.string.call_to_construction));
    }

    /**
     * 解析指令
     *
     * @param content 消息内容
     */
    private void parseOrder(String content) {
        if (content.contains(ORDER_CALL)) {
            mBinding.waveViewCallOperation.start();
            mBinding.clCallOperationCallToConstruction.setVisibility(View.GONE);
            mBinding.tvCallOperationPickUp.setVisibility(View.VISIBLE);
            mBinding.tvCallOperationHangUp.setVisibility(View.VISIBLE);
        } else if (content.contains(ORDER_HANG_UP)) {
            hangUp();
        } else if (content.contains(ORDER_PICK_UP)) {
            mBinding.waveViewCallOperation.stop();
            mBinding.tvCallOperationPickUp.setVisibility(View.GONE);
            mBinding.tvCallOperationCall.setText(getString(R.string.call_to_operator_pick_up));
        } else {
            if (mBinding.ivCallOperationOrder.getVisibility() != View.VISIBLE) {
                mBinding.ivCallOperationOrder.setVisibility(View.VISIBLE);
            }
            if (content.contains(ORDER_LEFT)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_left);
            } else if (content.contains(ORDER_UP)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_up);
            } else if (content.contains(ORDER_RIGHT)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_right);
            } else if (content.contains(ORDER_DOWN)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_down);
            } else if (content.contains(ORDER_FORWARD)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_forward);
            } else if (content.contains(ORDER_BACK)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_arrow_back);
            } else if (content.contains(ORDER_OK)) {
                mBinding.ivCallOperationOrder.setImageResource(R.drawable.icon_ok);
            }
            ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mBinding.ivCallOperationOrder, "scaleX", 1.3f, 0.8f, 1.2f, 0.9f, 1f);
            ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mBinding.ivCallOperationOrder, "scaleY", 1.3f, 0.8f, 1.2f, 0.9f, 1f);
            AnimatorSet animatorSet = new AnimatorSet();
            animatorSet.playTogether(animScaleX, animScaleY);
            animatorSet.setDuration(1000);
            animatorSet.start();
            animatorSet.addListener(new Animator.AnimatorListener() {
                @Override
                public void onAnimationStart(Animator animator) {
                    mBinding.ivCallOperationOrder.setVisibility(View.VISIBLE);
                }

                @Override
                public void onAnimationEnd(Animator animator) {
                    if (content.contains(ORDER_OK)) {
                        mBinding.ivCallOperationOrder.setVisibility(View.GONE);
                    }
                }

                @Override
                public void onAnimationCancel(Animator animator) {

                }

                @Override
                public void onAnimationRepeat(Animator animator) {

                }
            });
        }

    }

    /**
     * 设置远程视频
     *
     * @param uid 用户ID
     */
    private void setupRemoteVideo(int uid) {
        switch (uid) {
            case Constant.CODE_ROLE_CONSTRUCTION:
                FrameLayout container = mBinding.flCallOperation;
                SurfaceView surfaceView = RtcEngine.CreateRendererView(mContext);
                surfaceView.setZOrderMediaOverlay(true);
                container.addView(surfaceView);
                mRtcEngine.setupRemoteVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_HIDDEN, uid));
                constructionId = uid;
                break;
            case Constant.CODE_ROLE_CAMERA_FORWARD:
                mBinding.layoutForward.setUid(uid, mRtcEngine);
                break;
            case Constant.CODE_ROLE_CAMERA_BACK:
                mBinding.layoutBack.setUid(uid, mRtcEngine);
                break;
            case Constant.CODE_ROLE_CAMERA_LEFT:
                mBinding.layoutLeft.setUid(uid, mRtcEngine);
                break;
            case Constant.CODE_ROLE_CAMERA_RIGHT:
                mBinding.layoutRight.setUid(uid, mRtcEngine);
                break;
            case Constant.CODE_ROLE_CAMERA_UP:
                mBinding.layoutUp.setUid(uid, mRtcEngine);
                break;
            case Constant.CODE_ROLE_CAMERA_DOWN:
                mBinding.layoutDown.setUid(uid, mRtcEngine);
                break;
            default:
                break;
        }
    }

    /**
     * 设置接收质量
     *
     * @param uid       用户ID
     * @param rxQuality 接收质量
     */
    private void setNetworkQuality(int uid, int rxQuality) {
        switch (uid) {
            case Constant.CODE_ROLE_CONSTRUCTION:
                setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_FORWARD:
                mBinding.layoutForward.setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_BACK:
                mBinding.layoutBack.setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_LEFT:
                mBinding.layoutLeft.setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_RIGHT:
                mBinding.layoutRight.setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_UP:
                mBinding.layoutUp.setNetworkQuality(rxQuality);
                break;
            case Constant.CODE_ROLE_CAMERA_DOWN:
                mBinding.layoutDown.setNetworkQuality(rxQuality);
                break;
            default:
                break;
        }
    }

    /**
     * 设置现场施工网络状态
     *
     * @param txQuality 网络质量
     */
    public void setNetworkQuality(int txQuality) {
        switch (txQuality) {
            case IRtcEngineEventHandler.Quality.EXCELLENT:
                mBinding.ivCallOperationNetwork.setImageResource(R.drawable.net_word_4);
                break;
            case IRtcEngineEventHandler.Quality.GOOD:
            case IRtcEngineEventHandler.Quality.POOR:
                mBinding.ivCallOperationNetwork.setImageResource(R.drawable.net_word_3);
                break;
            case IRtcEngineEventHandler.Quality.BAD:
                mBinding.ivCallOperationNetwork.setImageResource(R.drawable.net_word_2);
                break;
            default:
                mBinding.ivCallOperationNetwork.setImageResource(R.drawable.net_word_1);
                break;
        }
    }


    /**
     * 点击事件
     *
     * @param view 点击的控件
     */
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        if (!animPlayFinish) {
            return;
        }
        if (statusBig) {
            narrowAnim(currentView);
            return;
        }
        switch (view.getId()) {
            case R.id.layout_forward:
                currentView = mBinding.layoutForward;
                break;
            case R.id.layout_back:
                currentView = mBinding.layoutBack;
                break;
            case R.id.layout_left:
                currentView = mBinding.layoutLeft;
                break;
            case R.id.layout_right:
                currentView = mBinding.layoutRight;
                break;
            case R.id.layout_up:
                currentView = mBinding.layoutUp;
                break;
            case R.id.layout_down:
                currentView = mBinding.layoutDown;
                break;
            case R.id.view_mask_call_operation:
                narrowAnim(currentView);
                break;
            case R.id.tv_call_operation_pick_up:
                sendOrder(ORDER_PICK_UP);
                mBinding.waveViewCallOperation.stop();
                pickUp();
                return;
            case R.id.tv_call_operation_hang_up:
                mBinding.waveViewCallOperation.stop();
                sendOrder(ORDER_HANG_UP);
                hangUp();
                return;
            case R.id.cl_call_operation_call_to_construction:
                sendOrder(ORDER_CALL);
                mBinding.tvCallOperationCall.setText(getString(R.string.call_to_operator_ing));
                return;
            case R.id.iv_call_operation_sound:
                if (mRtcEngine != null) {
                    int muteResult = mRtcEngine.muteRemoteAudioStream(constructionId, !muteSound);
                    if (Constant.MUTE_SUCCESS_CODE == muteResult) {
                        muteSound = !muteSound;
                        mBinding.ivCallOperationSound.setImageResource(muteSound ? R.drawable.sound_close : R.drawable.sound_open);
                    }
                }
                return;
            default:
                break;
        }
        enlargeAnim(currentView);
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
        cmdMsg.setTo(channelName);
        cmdMsg.addBody(cmdBody);
        EMClient.getInstance().chatManager().sendMessage(cmdMsg);
    }


    /**
     * 放大动画
     *
     * @param mView 执行动画控件
     */
    private void enlargeAnim(LayoutVideo mView) {
        mBinding.viewMaskCallOperation.setZ(currentZ);
        mBinding.viewMaskCallOperation.setVisibility(View.VISIBLE);
        currentZ++;
        mView.setZ(currentZ);
        mView.setZLayout(currentZ);
        moveDistance = getMoveDistance(mView);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mView, "scaleX", 1, 2);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mView, "scaleY", 1, 2);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mView, "translationX", 0, moveDistance[2]);
        ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mView, "translationY", 0, moveDistance[3]);
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
     *
     * @param mView 执行动画控件
     */
    private void narrowAnim(LayoutVideo mView) {
        mBinding.viewMaskCallOperation.setVisibility(View.GONE);
        ObjectAnimator animScaleX = ObjectAnimator.ofFloat(mView, "scaleX", 2, 1);
        ObjectAnimator animScaleY = ObjectAnimator.ofFloat(mView, "scaleY", 2, 1);
        ObjectAnimator animTranslationX = ObjectAnimator.ofFloat(mView, "translationX", moveDistance[2], 0);
        ObjectAnimator animTranslationY = ObjectAnimator.ofFloat(mView, "translationY", moveDistance[3], 0);
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