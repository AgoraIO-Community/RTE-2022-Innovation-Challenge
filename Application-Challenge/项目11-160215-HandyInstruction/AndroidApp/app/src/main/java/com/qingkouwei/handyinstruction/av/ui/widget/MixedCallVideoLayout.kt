package com.qingkouwei.handyinstruction.av.ui.widget

import android.app.Activity
import android.graphics.Bitmap
import android.opengl.GLSurfaceView
import android.os.Handler
import android.util.AttributeSet
import android.util.Log
import android.view.SurfaceView
import android.view.View
import android.widget.FrameLayout
import android.widget.Toast
import com.hyphenate.chat.EMClient
import com.hyphenate.easecallkit.EaseCallKit
import com.hyphenate.easecallkit.EaseCallKit.EaseCallError.RTC_ERROR
import com.hyphenate.easecallkit.base.EaseCallEndReason.EaseCallEndReasonHangup
import com.hyphenate.easecallkit.base.EaseCallFloatWindow
import com.hyphenate.easecallkit.base.EaseCallKitTokenCallback
import com.hyphenate.easecallkit.base.EaseCallType
import com.hyphenate.easecallkit.base.EaseCallType.SINGLE_VIDEO_CALL
import com.hyphenate.easecallkit.base.EaseCallType.SINGLE_VOICE_CALL
import com.hyphenate.easecallkit.base.EaseUserAccount
import com.hyphenate.util.EMLog
import com.qingkouwei.handyinstruction.R
import com.qingkouwei.handyinstruction.R.layout
import com.qingkouwei.handyinstruction.av.bean.Size
import com.qingkouwei.handyinstruction.av.util.AndroidUtils
import com.qingkouwei.handyinstruction.av.util.Resource.Companion.getString
import com.qingkouwei.handyinstruction.av.video.DrawVideoSource
import com.qingkouwei.handyinstruction.av.video.MixVideoHelper
import com.qingkouwei.handyinstruction.av.video.VideoSourceMgr
import com.qingkouwei.handyinstruction.common.utils.DemoLog
import com.qingkouwei.handyinstruction.common.utils.ToastUtils
import com.wonxing.adapter.holder.ColorPickerHoder.ColorPickerListener
import io.agora.rtc.Constants
import io.agora.rtc.IRtcEngineEventHandler
import io.agora.rtc.RtcEngine
import io.agora.rtc.gl.EglBase14.Context
import io.agora.rtc.gl.RendererCommon
import io.agora.rtc.mediaio.IVideoSource
import io.agora.rtc.mediaio.MediaIO
import io.agora.rtc.models.UserInfo
import io.agora.rtc.video.VideoCanvas
import io.agora.rtc.video.VideoEncoderConfiguration
import io.agora.rtc.video.VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_15
import io.agora.rtc.video.VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_ADAPTIVE
import kotlinx.android.synthetic.main.mixed_call_layout.view.drawView
import kotlinx.android.synthetic.main.mixed_call_layout.view.lscFinish
import kotlinx.android.synthetic.main.mixed_call_layout.view.lslTime
import kotlinx.android.synthetic.main.mixed_call_layout.view.menu
import kotlinx.android.synthetic.main.mixed_call_layout.view.pickColorLayout
import java.util.HashMap

class MixedCallVideoLayout : FrameLayout {
  protected val TAG = javaClass.simpleName + "Log"
  private val uIdMap: MutableMap<Int, EaseUserAccount> = HashMap()
  private var mRootView: View? =null
  private var mChannelName: String? = null
  private var mPeerUserId: String? = null

  private var mVideoSource: IVideoSource? = null

  private var isMicEnable: Boolean = true
  private var isFlashlightOpen: Boolean = false

  private var mGLSurfaceView: GLSurfaceView? = null
  private var mMixVideoHelper: MixVideoHelper? = null

  private var mRemoteRender: MixVideoHelper.YuvImageRenderer? = null
  private var mRender: MixVideoHelper.YuvImageRenderer? = null

  private var mHandler: Handler? = null

  private var mDrawVideoSource: DrawVideoSource? = null

  private var drawingViewWidth: Int = 0
  private var drawingViewHeight: Int = 0

  private var mRtcEngine: RtcEngine? = null
  private var agoraAppId: String? = null
  var listener = EaseCallKit.getInstance().callListener
  private var isCameraFront: Boolean = false;
  private var remoteUId = 0
  protected var mCallType: EaseCallType? = null
  private var mCallback: Callback? = null
  private var mActivity: Activity? = null

  private val mRtcEventHandler: IRtcEngineEventHandler = object : IRtcEngineEventHandler() {
    override fun onError(err: Int) {
      super.onError(err)
      DemoLog.d(
        TAG,
        "IRtcEngineEventHandler onError:$err"
      )
      if (listener != null) {
        listener.onCallError(RTC_ERROR, err, "rtc error")
      }
    }

    override fun onJoinChannelSuccess(channel: String, uid: Int, elapsed: Int) {
      DemoLog.d(TAG, "onJoinChannelSuccess channel:$channel uid$uid")
      mActivity?.runOnUiThread(Runnable {
        DemoLog.i(TAG, "onJoinChannelSuccess callback = " + mCallback)
        mCallback?.onJoinChannelSuccess(channel, uid, elapsed)
      })
    }

    override fun onRejoinChannelSuccess(channel: String, uid: Int, elapsed: Int) {
      super.onRejoinChannelSuccess(channel, uid, elapsed)
    }

    override fun onLeaveChannel(stats: RtcStats) {
      super.onLeaveChannel(stats)
    }

    override fun onLocalUserRegistered(uid: Int, userAccount: String) {
      super.onLocalUserRegistered(uid, userAccount)
    }

    override fun onUserInfoUpdated(uid: Int, userInfo: UserInfo) {
      super.onUserInfoUpdated(uid, userInfo)
    }

    override fun onUserJoined(uid: Int, elapsed: Int) {
      super.onUserJoined(uid, elapsed)
      mActivity?.runOnUiThread(Runnable { //检测到对方进来
        mCallback?.makeOngoingStatus()
        mCallback?.setUserJoinChannelInfo(null, uid)
      })
    }

    override fun onUserOffline(uid: Int, reason: Int) {
      mActivity?.runOnUiThread(Runnable {
        //检测到对方退出 自己退出
        mCallback?.exitChannel()
        if (uIdMap != null) {
          uIdMap.remove(uid)
        }
        if (listener != null) {
          //对方挂断
          val time: Long = mCallback?.getChronometerSeconds()!!
          listener.onEndCallWithReason(mCallType, mChannelName, EaseCallEndReasonHangup, time * 1000)
        }
      })
    }

    override fun onFirstRemoteVideoDecoded(uid: Int, width: Int, height: Int, elapsed: Int) {
      mActivity?.runOnUiThread(Runnable {
        remoteUId = uid
        addNewUser(uid, width, height)
      })
    }

    @Deprecated("") override fun onFirstRemoteAudioFrame(uid: Int, elapsed: Int) {
      mActivity?.runOnUiThread(Runnable {
        remoteUId = uid
        mCallback?.onFirstRemoteAudioFrame(uid, elapsed)
      })
    }

    override fun onRemoteVideoStateChanged(uid: Int, state: Int, reason: Int, elapsed: Int) {
      mActivity?.runOnUiThread(Runnable {
        //对端停止视频
        if (uid == remoteUId) {
          //远端转换为视频流
          if (state == Constants.REMOTE_VIDEO_STATE_STOPPED || state == Constants.REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED) {
            mCallType = SINGLE_VOICE_CALL
            EaseCallKit.getInstance().callType = SINGLE_VOICE_CALL
            EaseCallFloatWindow.getInstance(mActivity?.getApplicationContext()).callType =
              mCallType
            mCallback?.onRemoteVideoStateChanged(uid, state, reason, elapsed)
            if (mRtcEngine != null) {
              mRtcEngine!!.muteLocalVideoStream(true)
              mRtcEngine!!.enableVideo()
            }
          }
        }
      })
    }
  }


  constructor(context: android.content.Context) : super(context) {
    init(context)
  }
  constructor(context: android.content.Context, attributeSet: AttributeSet) : super(
    context,
    attributeSet
  ) {
    init(context)
  }
  constructor(context: android.content.Context, attributeSet: AttributeSet, defStyleAttr: Int) : super(
    context,
    attributeSet,
    defStyleAttr
  ) {
    init(context)
  }
  constructor(
    context: android.content.Context,
    attributeSet: AttributeSet,
    defStyleAttr: Int,
    defStyleRes: Int
  ) : super(context, attributeSet, defStyleAttr, defStyleRes) {
    init(context)
  }
  private fun init(context: android.content.Context){
    initView(context)
  }
  fun setupRtcEngine(channelName: String, peerUserId: String, callType: EaseCallType) {
    DemoLog.i(TAG, "setupRtcEngine")
    mCallType = callType
    mChannelName = channelName
    mPeerUserId = peerUserId
    initializeEngine()
    mHandler = Handler()
    if(callType == SINGLE_VIDEO_CALL){
      mMixVideoHelper = MixVideoHelper.setView(this.mGLSurfaceView, Runnable {
        mHandler!!.post {
          VideoSourceMgr.getInstance().initEGLContext(
            mMixVideoHelper!!.eglBaseContext as Context?, Size(
              VideoEncoderConfiguration.VD_1280x720.width,
              VideoEncoderConfiguration.VD_1280x720.height
            ), Size(AndroidUtils.getScreenHeight(context), AndroidUtils.getScreenWidth(context))
          )
          mVideoSource = VideoSourceMgr.getInstance().mainVideoSource
          mRender = mMixVideoHelper!!.createGuiRenderer(
            0, 0, 100, 100,
            RendererCommon.ScalingType.SCALE_ASPECT_FILL, false
          )

          mRender!!.setBufferType(MediaIO.BufferType.TEXTURE)
          mRender!!.setPixelFormat(MediaIO.PixelFormat.TEXTURE_OES)

          mRtcEngine!!.setVideoSource(mVideoSource)
          mRtcEngine!!.setLocalVideoRenderer(mRender)
          preview(true, null, 0)
          setupVideoConfig(Constants.CLIENT_ROLE_BROADCASTER)
          joinChannel(mChannelName!!, 0)
        }
      })
      mGLSurfaceView!!.visibility = View.VISIBLE
    }else{
      joinChannel(mChannelName!!, 0)
    }

  }
  fun updateUI(){
    DemoLog.i(TAG, "updateUI")
    if(mCallType == SINGLE_VIDEO_CALL){
      menu.visibility = View.VISIBLE
      lscFinish.visibility = View.VISIBLE
      lslTime.visibility = View.VISIBLE
      lslTime.start()
    }
  }
  private fun preview(start: Boolean, view: SurfaceView?, uid: Int) {
    if (start) {
      mRtcEngine!!.setupLocalVideo(VideoCanvas(view, VideoCanvas.RENDER_MODE_HIDDEN, uid))
      mRtcEngine!!.startPreview()
    } else {
      mRtcEngine!!.stopPreview()
    }
  }
  private fun initView(context: android.content.Context) {
    mActivity = context as Activity;
    mRootView = inflate(context, layout.mixed_call_layout, this)
    mGLSurfaceView = mRootView?.findViewById<View>(R.id.glSurfaceView) as GLSurfaceView
    var w = VideoEncoderConfiguration.VD_1280x720.height.toFloat()
    var h = VideoEncoderConfiguration.VD_1280x720.width.toFloat()
    val ratio = w / h
    val screenWidth = AndroidUtils.getScreenWidth(context)
    var screenHeight = AndroidUtils.getScreenHeight(context)
    val screenRatio = screenWidth / screenHeight;
    DemoLog.e(TAG, "ratio = " + ratio + ";screenRatio = " + screenRatio)

    if (ratio < screenRatio) {
      var width = (screenHeight * ratio).toInt()
      DemoLog.e(TAG, "width = " + width)
      drawView.layoutParams.width = width
      mGLSurfaceView!!.layoutParams.width = width
    } else {
      var height = (AndroidUtils.getScreenWidth(getContext()).toFloat() / ratio).toInt()
      DemoLog.e(TAG, "height = " + height)
      drawView.layoutParams.height = height
      mGLSurfaceView!!.layoutParams.height = height
    }


    lscFinish.setOnClickListener {
      tryQuit()
    }
    pickColorLayout.setColorPickerListener(object : ColorPickerListener {
      override fun onSelected(color: Int) {
        if (!mMixVideoHelper!!.isBlend) {
          showToast(R.string.toast_not_support)
          return
        }
        drawView.color = color
        pickColorLayout.visibility = View.GONE
      }
    })
    menu.setOnDrawOpenClickListener {
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnDrawOpenClickListener
      }
      menu.openDrawMenu()
      drawView.visibility = View.VISIBLE
      if (drawingViewWidth != 0 && drawingViewHeight != 0) {
        VideoSourceMgr.getInstance().addDrawing(drawingViewWidth, drawingViewHeight);
      }
    }
    menu.setOnDrawCloseClickListener {
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnDrawCloseClickListener
      }
      pickColorLayout.visibility = View.GONE
      drawView.visibility = View.GONE
      VideoSourceMgr.getInstance().delDrawing()
    }
    menu.setOnDrawClearClickListener() {
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnDrawClearClickListener
      }
      drawView.clear()
    }
    menu.setOnDrawEraserClickListener { v ->
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnDrawEraserClickListener
      }
      if (v.isSelected) {
        drawView.setEsaserMode(true)
      } else {
        drawView.setEsaserMode(false)
      }
    }
    menu.setOnDrawColorClickListener {
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnDrawColorClickListener
      }
      if (pickColorLayout.visibility == View.GONE) {
        pickColorLayout.visibility = View.VISIBLE
      } else {
        pickColorLayout.visibility = View.GONE
      }

    }
    menu.setOnFrameModeListener {
      menu.changeFrameMode(mMixVideoHelper!!.isBlend )
      mMixVideoHelper!!.isBlend = !mMixVideoHelper!!.isBlend
    }
    drawView.setmOnDrawCallback(
      object : DrawView.OnDrawCallback {
        override fun updatePix(bitmap: Bitmap?) {
          if (VideoSourceMgr.getInstance().drawVideoSource != null && VideoSourceMgr.getInstance().drawVideoSource.isRunning) {
            if (mDrawVideoSource != null) {
              mDrawVideoSource?.onVideoFrameBitmap(bitmap)
            } else {
              mDrawVideoSource = VideoSourceMgr.getInstance().drawVideoSource
              mDrawVideoSource?.onVideoFrameBitmap(bitmap)
            }
          }
        }
      }
    )
    drawView.setViewSizeChangeCallback { width, height ->
      if (width == 0 || height == 0) {
        return@setViewSizeChangeCallback
      }
      DemoLog.i(TAG, "setViewSizeChangeCallback:" + width + "*" + height);
      drawingViewWidth = width
      drawingViewHeight = height
      VideoSourceMgr.getInstance().addDrawing(width, height)
    }
    menu.setOnMikeModeListener {
      if (isMicEnable) {
        mRtcEngine!!.disableAudio()
        menu.setMikeStateText(R.string._text_livestudio_menu_mike_open_state)
        isMicEnable = false
      } else {
        mRtcEngine!!.enableAudio()
        menu.setMikeStateText(R.string._text_livestudio_menu_mike_close_state)
        isMicEnable = true
      }
    }
    menu.setOnCameraModeListener {
      VideoSourceMgr.getInstance().cameraVideoSource.switchCamera()
    }
    menu.setOnFlashlightListener {
      if (!mMixVideoHelper!!.isBlend) {
        showToast(R.string.toast_not_support)
        return@setOnFlashlightListener
      }
      if (VideoSourceMgr.getInstance().cameraVideoSource.isFacingMode) {
        Toast.makeText(getContext(), "前置摄像头无法开启", Toast.LENGTH_SHORT).show()
      } else {
        if (isFlashlightOpen) {
          if (VideoSourceMgr.getInstance().cameraVideoSource.switchFlashlight(false)) {
            isFlashlightOpen = false
          }
        } else {
          if (VideoSourceMgr.getInstance().cameraVideoSource.switchFlashlight(true)) {
            isFlashlightOpen = true
          }
        }
      }

    }
    menu.visibility = View.GONE
    drawView.visibility = View.GONE
    lscFinish.visibility = View.GONE
    lslTime.visibility = View.GONE
  }

  private fun initializeEngine() {
    try {
      val config = EaseCallKit.getInstance().callKitConfig
      if (config != null) {
        agoraAppId = config.agoraAppId
      }
      mRtcEngine = RtcEngine.create(context, agoraAppId, mRtcEventHandler)
      //因为有小程序 设置为直播模式 角色设置为主播
      mRtcEngine!!.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING)
      mRtcEngine!!.setClientRole(Constants.CLIENT_ROLE_BROADCASTER)
      EaseCallFloatWindow.getInstance().setRtcEngine(
        context.applicationContext,
        mRtcEngine
      )
    } catch (e: Exception) {
      DemoLog.e(TAG, Log.getStackTraceString(e))
      throw RuntimeException(
        """
            NEED TO check rtc sdk init fatal error
            ${Log.getStackTraceString(e)}
            """.trimIndent()
      )
    }
  }

  private fun setupVideoConfig(cRole: Int) {
    if (EaseCallKit.getInstance().callType == SINGLE_VIDEO_CALL) {
      mRtcEngine!!.enableVideo()
      val videoEncoderConfiguration = VideoEncoderConfiguration(
        VideoEncoderConfiguration.VD_840x480,
        FRAME_RATE_FPS_15, 610,
        ORIENTATION_MODE_ADAPTIVE
      )
      mRtcEngine!!.setVideoEncoderConfiguration(videoEncoderConfiguration)
      mRtcEngine!!.setClientRole(cRole)

      isCameraFront = false
    } else {
      mRtcEngine!!.disableVideo()
    }
  }

  /**
   * 加入频道
   */
  private fun joinChannel(channelName: String, uuid: Int) {
    DemoLog.i(TAG,"joinChannel:" + channelName)
    val callKitConfig = EaseCallKit.getInstance().callKitConfig
    if (listener != null && callKitConfig != null && callKitConfig.isEnableRTCToken) {
      listener.onGenerateToken(
        EMClient.getInstance().currentUser,
        channelName,
        EMClient.getInstance().options.appKey,
        object : EaseCallKitTokenCallback {
          override fun onSetToken(token: String, uId: Int) {
            DemoLog.d(
              TAG,
              "onSetToken token:$token uid: $uId"
            )
            //获取到Token uid加入频道
            mRtcEngine!!.joinChannel(token, channelName, null, uId)
            //自己信息加入uIdMap
            uIdMap.put(uId, EaseUserAccount(uId, EMClient.getInstance().currentUser))
          }

          override fun onGetTokenError(error: Int, errorMsg: String) {
            EMLog.e(
              TAG,
              "onGenerateToken error :$error errorMsg:$errorMsg"
            )
            //获取Token失败,退出呼叫
            mCallback?.exitChannel()
          }
        })
    }
  }
  private fun addNewUser(uid: Int, width: Int, height: Int) {
    DemoLog.e(TAG, "addNewUser")
    mRemoteRender = mMixVideoHelper!!.createGuiRenderer(
      75,
      0,
      25,
      25,
      RendererCommon.ScalingType.SCALE_ASPECT_FILL,
      false
    )
    mRemoteRender!!.setBufferType(MediaIO.BufferType.BYTE_ARRAY)
    mRemoteRender!!.setPixelFormat(MediaIO.PixelFormat.I420)
    mRtcEngine!!.setRemoteVideoRenderer(uid, mRemoteRender)
  }
  /**
   * 离开频道
   */
  fun leaveChannel() {
    // 离开当前频道。
    if (mRtcEngine != null) {
      mRtcEngine!!.leaveChannel()
    }

  }

  private fun tryQuit() {
    mCallback!!.exitChannelDisplay()
  }

  fun isCameraFront(): Boolean {
    return isCameraFront
  }
  fun getRtcEngine(): RtcEngine{
    return mRtcEngine!!;
  }
  protected fun showToast(resId: Int) {
    showToast(getString(resId))
  }

  protected fun showToast(msg: String) {
    if (!mActivity!!.isFinishing) {
      ToastUtils.showToast(msg, 1000)
    }
  }
  fun release(){
    VideoSourceMgr.getInstance().destroy()
  }
  fun setCallback(callback: Callback){
    this.mCallback = callback
  }
  interface Callback{
    fun exitChannel()
    fun onJoinChannelSuccess(channel: String, uid: Int, elapsed: Int)
    fun makeOngoingStatus()
    fun setUserJoinChannelInfo(userName: String?, uId: Int)
    fun onFirstRemoteAudioFrame(uid: Int, elapsed: Int)
    fun onRemoteVideoStateChanged(uid: Int, state: Int, reason: Int, elapsed: Int)
    fun getChronometerSeconds(): Long
    fun exitChannelDisplay()
  }
}