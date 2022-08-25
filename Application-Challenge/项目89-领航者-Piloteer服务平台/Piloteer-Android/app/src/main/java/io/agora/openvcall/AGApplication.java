package io.agora.openvcall;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.os.Looper;
import android.text.Layout;
import android.text.TextUtils;
import android.util.Log;
import android.view.TextureView;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.jiangdg.usbcamera.UVCCameraHelper;
import com.serenegiant.usb.CameraDialog;
import com.serenegiant.usb.USBMonitor;
import com.serenegiant.usb.common.AbstractUVCCameraHandler;
import com.serenegiant.usb.encoder.RecordParams;
import com.serenegiant.usb.widget.CameraViewInterface;
import com.serenegiant.usb.widget.UVCCameraTextureView;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import androidx.appcompat.app.AlertDialog;
import io.agora.openvcall.model.AGEventHandler;
import io.agora.openvcall.model.CurrentUserSettings;
import io.agora.openvcall.model.EngineConfig;
import io.agora.openvcall.model.MyEngineEventHandler;
import io.agora.rtc.Constants;
import io.agora.rtc.RtcEngine;
import io.agora.usb.utils.CrashHandler;

public class AGApplication extends Application implements CameraDialog.CameraDialogParent{
    public static int camWidth=1280;
    public static int camHeight=720;
    private CrashHandler mCrashHandler;
    // File Directory in sd card
    public static final String DIRECTORY_NAME = "USBCamera";
    private CurrentUserSettings mVideoSettings = new CurrentUserSettings();

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private RtcEngine mRtcEngine;
    private EngineConfig mConfig;
    private MyEngineEventHandler mEventHandler;

    LinearLayout uvcParent;
    public int temp;

    protected UVCCameraHelper mCameraHelper;
    protected CameraViewInterface mUVCCameraView;
    protected UVCCameraTextureView uvcView;
    protected AlertDialog mDialog;

    protected boolean isRequest;
    protected boolean isPreview;
    public boolean isUCameraInit;
    public UVCCameraHelper uvcCameraHelper(){return mCameraHelper;}
    public CameraViewInterface cameraUVCView(){return mUVCCameraView;}
    public UVCCameraTextureView uvcCameraTextureView(){return uvcView;}
    public void SetUVCView(LinearLayout parent,boolean attach){
        if(attach){
            if(uvcParent!=null){
                uvcParent.removeViewInLayout(uvcView);
            }
            uvcParent=parent;
            parent.addView(uvcView);
        }else{
            uvcParent=null;
            parent.removeViewInLayout(uvcView);
        }


    }

    public RtcEngine rtcEngine() {
        return mRtcEngine;
    }

    public EngineConfig config() {
        return mConfig;
    }

    public CurrentUserSettings userSettings() {
        return mVideoSettings;
    }

    public void addEventHandler(AGEventHandler handler) {
        mEventHandler.addEventHandler(handler);
    }

    public void remoteEventHandler(AGEventHandler handler) {
        mEventHandler.removeEventHandler(handler);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mCrashHandler = CrashHandler.getInstance();
        mCrashHandler.init(getApplicationContext(), getClass());
        createRtcEngine();
    }
    private UVCCameraHelper.OnMyDevConnectListener listener = new UVCCameraHelper.OnMyDevConnectListener() {

        @Override
        public void onAttachDev(UsbDevice device) {
            // request open permission
            if (!isRequest) {
                isRequest = true;
                if (mCameraHelper != null) {
                    temp = mCameraHelper.getUsbDeviceCount();
                    if(temp==0){
                        showShortMsg("Camera Count is 0");
                    }
                    else{
                        showShortMsg("Camera Found in camera count");
                    }

                    mCameraHelper.requestPermission(0);
                }
            }
        }

        @Override
        public void onDettachDev(UsbDevice device) {
            // close camera
            if (isRequest) {
                isRequest = false;
                mCameraHelper.closeCamera();
                showShortMsg(device.getDeviceName() + " is out");
            }
        }

        @Override
        public void onConnectDev(UsbDevice device, boolean isConnected) {
            if (!isConnected) {
                showShortMsg("fail to connect,please check resolution params");
                isPreview = false;
            } else {
                isPreview = true;
                showShortMsg("connecting");
                // initialize seekbar
                // need to wait UVCCamera initialize over
                new Thread(() -> {
                    try {
                        Thread.sleep(2500);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    Looper.prepare();
                    if(mCameraHelper != null && mCameraHelper.isCameraOpened()) {
                        //   mSeekBrightness.setProgress(mCameraHelper.getModelValue(UVCCameraHelper.MODE_BRIGHTNESS));
                        //      mSeekContrast.setProgress(mCameraHelper.getModelValue(UVCCameraHelper.MODE_CONTRAST));
                    }
                    Looper.loop();
                }).start();
            }
        }

        @Override
        public void onDisConnectDev(UsbDevice device) {
            showShortMsg("disconnecting");
        }
    };
    public void initUsbCam(Activity activity, AbstractUVCCameraHandler.OnPreViewResultListener resultListener){
        //usb_camera_view
        TextureView fl= (TextureView) TextureView.inflate(this,R.layout.usb_view,null);   //自定义的布局
        //   LinearLayout lin= findViewById(R.id.camera_view_main);
        uvcView =(UVCCameraTextureView)fl;
        //   lin.addView(uvcView);
       // uvcView.setCallback(this);
        // UVCCameraTextureView surfaceV=new UVCCameraTextureView(this);
        // step.1 initialize UVCCameraHelper
        mUVCCameraView = (CameraViewInterface) uvcView;
        //mUVCCameraView.setCallback(call);
        mCameraHelper = UVCCameraHelper.getInstance(camWidth,camHeight);
        mCameraHelper.setDefaultFrameFormat(UVCCameraHelper.FRAME_FORMAT_MJPEG);
        mCameraHelper.initUSBMonitor(activity, mUVCCameraView, listener);
        isUCameraInit=true;
        mCameraHelper.setOnPreviewFrameListener(resultListener);

    }

    private void showShortMsg(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    @Override
    public USBMonitor getUSBMonitor() {
        return mCameraHelper.getUSBMonitor();
    }

    @Override
    public void onDialogResult(boolean canceled) {
        if (canceled) {
            showShortMsg("取消操作");
        }
    }
    private void createRtcEngine() {
        Context context = getApplicationContext();
        String appId = context.getString(R.string.agora_app_id);
        if (TextUtils.isEmpty(appId)) {
            throw new RuntimeException("NEED TO use your App ID, get your own ID at https://dashboard.agora.io/");
        }

        mEventHandler = new MyEngineEventHandler();
        try {
            // Creates an RtcEngine instance
            mRtcEngine = RtcEngine.create(context, appId, mEventHandler);
        } catch (Exception e) {
            log.error(Log.getStackTraceString(e));
            throw new RuntimeException("NEED TO check rtc sdk init fatal error\n" + Log.getStackTraceString(e));
        }

        /*
          Sets the channel profile of the Agora RtcEngine.
          The Agora RtcEngine differentiates channel profiles and applies different optimization
          algorithms accordingly. For example, it prioritizes smoothness and low latency for a
          video call, and prioritizes video quality for a video broadcast.
         */
        mRtcEngine.setChannelProfile(Constants.CHANNEL_PROFILE_COMMUNICATION);
        // Enables the video module.
        mRtcEngine.enableVideo();
        /*
          Enables the onAudioVolumeIndication callback at a set time interval to report on which
          users are speaking and the speakers' volume.
          Once this method is enabled, the SDK returns the volume indication in the
          onAudioVolumeIndication callback at the set time interval, regardless of whether any user
          is speaking in the channel.
         */
        mRtcEngine.enableAudioVolumeIndication(200, 3, false);

        mConfig = new EngineConfig();
    }

    @Override
    public void onTerminate() {
        super.onTerminate();
    }
}
