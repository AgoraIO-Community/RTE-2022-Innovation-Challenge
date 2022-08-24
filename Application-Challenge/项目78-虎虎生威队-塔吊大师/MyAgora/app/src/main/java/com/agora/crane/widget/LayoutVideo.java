package com.agora.crane.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.SurfaceView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;

import com.agora.crane.R;
import com.agora.crane.databinding.LayoutVideoBinding;
import com.agora.crane.utils.Constant;

import io.agora.rtc.IRtcEngineEventHandler;
import io.agora.rtc.RtcEngine;
import io.agora.rtc.video.VideoCanvas;

/**
 * @Author: hyx
 * @Date: 2022/7/24
 * @introduction
 */
public class LayoutVideo extends ConstraintLayout {

    private final LayoutVideoBinding mBinding;
    private Context mContext;
    private RtcEngine mRtcEngine;
    private int uid;
    private boolean muteSound = false;

    public LayoutVideo(@NonNull Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public LayoutVideo(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        mContext = context;
        mBinding = LayoutVideoBinding.inflate(LayoutInflater.from(context), this, true);
        setListener();
        TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.layout_video, 0, 0);
        String textDirection = typedArray.getString(R.styleable.layout_video_text_direction);
        mBinding.tvDirection.setText(textDirection);
    }

    /**
     * 设置监听
     */
    private void setListener() {
        mBinding.ivSound.setOnClickListener(view -> {
            if (mRtcEngine == null) {
                return;
            }
            int muteResult = mRtcEngine.muteRemoteAudioStream(uid, !muteSound);
            if (Constant.MUTE_SUCCESS_CODE == muteResult) {
                muteSound = !muteSound;
                mBinding.ivSound.setImageResource(muteSound ? R.drawable.sound_close : R.drawable.sound_open);
            }
        });
    }

    /**
     * 设置用户id和引擎
     *
     * @param uid        用户id
     * @param mRtcEngine 引擎
     */
    public void setUid(int uid, RtcEngine mRtcEngine) {
        this.uid = uid;
        this.mRtcEngine = mRtcEngine;
        SurfaceView mSurfaceView = RtcEngine.CreateRendererView(mContext);
        mSurfaceView.setZOrderMediaOverlay(true);
        mBinding.fl.addView(mSurfaceView);
        mRtcEngine.setupRemoteVideo(new VideoCanvas(mSurfaceView, VideoCanvas.RENDER_MODE_HIDDEN, uid));
    }

    /**
     * 设置Z层级
     *
     * @param z 层级
     */
    public void setZLayout(int z) {
        if (mRtcEngine == null) {
            return;
        }
        mBinding.fl.removeAllViews();
        SurfaceView mSurfaceView = RtcEngine.CreateRendererView(mContext);
        mSurfaceView.setZOrderMediaOverlay(true);
        mBinding.fl.addView(mSurfaceView);
        mRtcEngine.setupRemoteVideo(new VideoCanvas(mSurfaceView, VideoCanvas.RENDER_MODE_HIDDEN, uid));
    }

    /**
     * 设置网络状态
     *
     * @param txQuality 网络质量
     */
    public void setNetworkQuality(int txQuality) {
        switch (txQuality) {
            case IRtcEngineEventHandler.Quality.EXCELLENT:
                mBinding.ivNetwork.setImageResource(R.drawable.net_word_4);
                break;
            case IRtcEngineEventHandler.Quality.GOOD:
            case IRtcEngineEventHandler.Quality.POOR:
                mBinding.ivNetwork.setImageResource(R.drawable.net_word_3);
                break;
            case IRtcEngineEventHandler.Quality.BAD:
                mBinding.ivNetwork.setImageResource(R.drawable.net_word_2);
                break;
            default:
                mBinding.ivNetwork.setImageResource(R.drawable.net_word_1);
                break;
        }
    }

}
