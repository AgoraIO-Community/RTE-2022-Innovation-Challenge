package io.agora.metachat.example;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.concurrent.ConcurrentHashMap;
import org.json.JSONObject;
import javax.net.ssl.TrustManager;
import java.security.KeyStore;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.SSLContext;
import io.agora.metachat.IMetachatEventHandler;
import io.agora.metachat.IMetachatScene;
import io.agora.metachat.IMetachatSceneEventHandler;
import io.agora.metachat.IMetachatService;
import io.agora.metachat.MetachatConfig;
import io.agora.metachat.MetachatSceneInfo;
import io.agora.metachat.MetachatUserAvatarConfig;
import io.agora.metachat.MetachatUserInfo;
import io.agora.metachat.MetachatUserPositionInfo;
import io.agora.metachat.example.dialog.CustomDialog;
import io.agora.rtc2.ChannelMediaOptions;
import io.agora.rtc2.Constants;
import io.agora.rtc2.IRtcEngineEventHandler;
import io.agora.rtc2.RtcEngine;
import io.agora.rtc2.video.AgoraVideoFrame;
import io.agora.spatialaudio.ILocalSpatialAudioEngine;
import io.agora.spatialaudio.LocalSpatialAudioConfig;
import io.agora.spatialaudio.RemoteVoicePositionInfo;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.RequestBody;
import okhttp3.Response;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

public class MetaChatContext implements IMetachatEventHandler, IMetachatSceneEventHandler {

    private final static String TAG = MetaChatContext.class.getName();
    private volatile static MetaChatContext instance = null;
    private final static boolean enableSpatialAudio = true;

    private RtcEngine rtcEngine;
    private ILocalSpatialAudioEngine spatialAudioEngine;
    private IMetachatService metaChatService;
    private IMetachatScene metaChatScene;
    private MetachatSceneInfo sceneInfo;
    private MetachatUserAvatarConfig avatarConfig;
    private String roomName;
    private String mRtctk;
    private final ConcurrentHashMap<IMetachatEventHandler, Integer> metaChatEventHandlerMap;
    private final ConcurrentHashMap<IMetachatSceneEventHandler, Integer> metaChatSceneEventHandlerMap;
    private boolean mJoinedRtc = false;

    private MetaChatContext() {
        metaChatEventHandlerMap = new ConcurrentHashMap<>();
        metaChatSceneEventHandlerMap = new ConcurrentHashMap<>();
    }

    public static MetaChatContext getInstance() {
        if (instance == null) {
            synchronized (MetaChatContext.class) {
                if (instance == null) {
                    instance = new MetaChatContext();
                }
            }
        }
        return instance;
    }
    public void httptest(){
        String url = "https://www.tingwx.com/index/?tp=bdtoken";
   /*     TrustManager[] tms = MyHttp2.getTrustManager();
        OkHttpClient okHttpClient = new OkHttpClient()
                .newBuilder()
                .sslSocketFactory(MyHttp2.getSSLSocketFactory(),tms[0])//配置
                .hostnameVerifier(MyHttp2.getHostnameVerifier())//配置
                .build();
        final */
        Log.e(TAG, "exceptio!!!!!!!!!!!!!!!!!!!!!");
        try {
        Request request = new Request.Builder()
                .url(url)
                .get()//默认就是GET请求，可以不写
                .build();
        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init((KeyStore) null);
        TrustManager[] trustManagers = trustManagerFactory.getTrustManagers();
        if (trustManagers.length != 1 || !(trustManagers[0] instanceof X509TrustManager)) {
            throw new IllegalStateException("Unexpected default trust managers:" + Arrays.toString(trustManagers));
        }
        X509TrustManager trustManager = (X509TrustManager) trustManagers[0];
        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(null, new TrustManager[] { trustManager }, null);
        SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();
    //    OkHttpClient client = new OkHttpClient.Builder()
     //           .sslSocketFactory(sslSocketFactory, trustManager);
        OkHttpClient okHttpClient = new OkHttpClient()
                .newBuilder()
                .sslSocketFactory(sslSocketFactory, trustManager)//配置
                .hostnameVerifier(MyHttp2.getHostnameVerifier())//配置
                .build();
        Call call = okHttpClient.newCall(request);

            Response response = call.execute();
            Log.e(TAG, "onResponse okhttp : " + response.body().string());
         //   JSONObject jsonobj = new JSONObject(response.body().string());
          //  Log.e(TAG, "onResponse okhttp : " + jsonobj.get("token").toString());
        Log.e(TAG, "exceptio222222222!!!!!!!!!!!!!!!!!!!!!");
     /*   call.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken######################");Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken######################");
                Log.e(TAG, "onFailure: ");
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken######################");Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken######################");
                try {
                    Log.e(TAG, "onResponse okhttp : " + response.body().string());
                    JSONObject jsonobj = new JSONObject(response.body().string());
                    Log.e(TAG, "onResponse okhttp : " + jsonobj.get("token").toString());
                }
                catch (Exception e) {
                    Log.e(TAG, "exception@#@#@#@#");

                    e.printStackTrace();
                }

            }
        });*/
        } catch (Exception e) {
            Log.e(TAG, "exception&&&&&&&&&&&&&&&");
            Log.e(TAG, "exception&&&&&&&&&&&&&&&");
            Log.e(TAG, e.toString());
            e.printStackTrace();
        }
    }

    public boolean initialize(Context context, @Nullable String nickname, @Nullable String avatar,String rtctk,String rtmtk) {
        int ret = Constants.ERR_OK;
        Log.e(TAG, "mToken#^^^^^^^^^^^^^^^^#####");

        Log.e(TAG, "mToken##^^^^^^^^^^^^^^^^^^^######");
       // httptest();
        if (rtcEngine == null) {
            try {
                rtcEngine = RtcEngine.create(context, KeyCenter.APP_ID, new IRtcEngineEventHandler() {
                    @Override
                    public void onJoinChannelSuccess(String channel, int uid, int elapsed) {
                        Log.d(TAG, String.format("onJoinChannelSuccess %s %d", channel, uid));
                        mJoinedRtc = true;
                    }

                    @Override
                    public void onUserOffline(int uid, int reason) {
                        Log.d(TAG, String.format("onUserOffline %d %d ", uid, reason));
                        if (spatialAudioEngine != null)
                            spatialAudioEngine.removeRemotePosition(uid);
                    }

                    @Override
                    public void onAudioRouteChanged(int routing) {
                        Log.d(TAG, String.format("onAudioRouteChanged %d", routing));
                    }
                });
                Log.e(TAG, "mToken#$$$$$$$$$$$$$$$$$#####");
                Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken######################");Log.e(TAG, "mToken######################");
                Log.e(TAG, "mToken#####98989898#########");


                Log.e(TAG, "mToken##$$$$$$$$$$$$$$$$$$$4######");
                rtcEngine.enableAudio();
                rtcEngine.disableVideo();
                rtcEngine.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING);
                rtcEngine.setAudioProfile(
                        Constants.AUDIO_PROFILE_DEFAULT, Constants.AUDIO_SCENARIO_GAME_STREAMING
                );
                Log.e(TAG, "mToken#####106106106#####");
                {
                    metaChatService = IMetachatService.create();
                    MetachatConfig config = new MetachatConfig() {{

                        mRtcEngine = rtcEngine;
                        mAppId = KeyCenter.APP_ID;
                        mToken = rtmtk;//KeyCenter.RTM_TOKEN;//MyHttp.httpstest("https://www.tingwx.com?tp=bdtoken","","");//KeyCenter.RTM_TOKEN;
                        mRtctk = rtctk;
                        mLocalDownloadPath = context.getExternalCacheDir().getPath();
                        mUserInfo = new MetachatUserInfo() {{
                            mUserId = KeyCenter.RTM_UID;
                            mUserName = nickname == null ? mUserId : nickname;
                            mUserIconUrl = avatar == null ? "https://accpic.sd-rtn.com/pic/test/png/2.png" : avatar;
                        }};
                        Log.e(TAG, "mToken######################");
                        Log.e(TAG, "mToken######################");
                        Log.e(TAG, "mToken######################");

                        Log.e(TAG, mToken);
                        Log.e(TAG, "mToken######################");
                        Log.e(TAG, "mToken######################");
                        Log.e(TAG, "mToken######################");
                        mEventHandler = MetaChatContext.this;
                    }};
                    ret += metaChatService.initialize(config);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
        return ret == Constants.ERR_OK;
    }

    public void destroy() {
        IMetachatService.destroy();
        metaChatService = null;
        RtcEngine.destroy();
        rtcEngine = null;
    }

    public void registerMetaChatEventHandler(IMetachatEventHandler eventHandler) {
        metaChatEventHandlerMap.put(eventHandler, 0);
    }

    public void unregisterMetaChatEventHandler(IMetachatEventHandler eventHandler) {
        metaChatEventHandlerMap.remove(eventHandler);
    }

    public void registerMetaChatSceneEventHandler(IMetachatSceneEventHandler eventHandler) {
        metaChatSceneEventHandlerMap.put(eventHandler, 0);
    }

    public void unregisterMetaChatSceneEventHandler(IMetachatSceneEventHandler eventHandler) {
        metaChatSceneEventHandlerMap.remove(eventHandler);
    }

    public boolean getScenes() {
        return metaChatService.getScenes() == Constants.ERR_OK;
    }

    public boolean isSceneDownloaded(MetachatSceneInfo sceneInfo) {
        return metaChatService.isSceneDownloaded(sceneInfo.mSceneId) > 0;
    }

    public boolean downloadScene(MetachatSceneInfo sceneInfo) {
        return metaChatService.downloadScene(sceneInfo.mSceneId) == Constants.ERR_OK;
    }

    public boolean cancelDownloadScene(MetachatSceneInfo sceneInfo) {
        return metaChatService.cancelDownloadScene(sceneInfo.mSceneId) == Constants.ERR_OK;
    }

    public void prepareScene(MetachatSceneInfo sceneInfo, MetachatUserAvatarConfig avatarConfig) {
        this.sceneInfo = sceneInfo;
        this.avatarConfig = avatarConfig;
    }

    public boolean createAndEnterScene(String roomName) {
        Log.d(TAG, String.format("createAndEnterScene %s", roomName));
        this.roomName = roomName;

        if (spatialAudioEngine == null && enableSpatialAudio) {
            spatialAudioEngine = ILocalSpatialAudioEngine.create();
            LocalSpatialAudioConfig config = new LocalSpatialAudioConfig() {{
                mRtcEngine = rtcEngine;
            }};
            spatialAudioEngine.initialize(config);
            spatialAudioEngine.muteLocalAudioStream(false);
            spatialAudioEngine.muteAllRemoteAudioStreams(false);
        }

        if (metaChatScene == null) {
            metaChatScene = metaChatService.createScene(this.roomName, this);

         /*   Log.e(TAG, String.format("createAndEnterScene %s", String.valueOf(metaChatScene.mScenePath)));
            Log.e(TAG, String.format("createAndEnterScene %s", String.valueOf(metaChatScene.mScenePath)));
            Log.e(TAG, String.format("createAndEnterScene %s", String.valueOf(metaChatScene.mScenePath)));
            Log.e(TAG, String.format("createAndEnterScene %s", String.valueOf(metaChatScene.mScenePath)));*/


        }
        mJoinedRtc = false;
        return metaChatScene.enterScene(sceneInfo, avatarConfig) == Constants.ERR_OK;
    }

    public boolean updateRole(int role) {
        int ret = Constants.ERR_OK;
        boolean isBroadcaster = role == Constants.CLIENT_ROLE_BROADCASTER;
        ret += rtcEngine.updateChannelMediaOptions(new ChannelMediaOptions() {{
            publishAudioTrack = isBroadcaster;
            clientRoleType = role;
        }});
        avatarConfig.mLocalVisible = true;
        avatarConfig.mSyncPosition = isBroadcaster;
        avatarConfig.mRemoteVisible = isBroadcaster;
        ret += metaChatScene.updateLocalAvatarConfig(avatarConfig);
        return ret == Constants.ERR_OK;
    }

    public boolean enableLocalAudio(boolean enabled) {
        return rtcEngine.enableLocalAudio(enabled) == Constants.ERR_OK;
    }

    public boolean muteAllRemoteAudioStreams(boolean mute) {
        if (spatialAudioEngine != null) {
            return spatialAudioEngine.muteAllRemoteAudioStreams(mute) == Constants.ERR_OK;
        }
        return rtcEngine.muteAllRemoteAudioStreams(mute) == Constants.ERR_OK;
    }

    public boolean leaveScene() {
        Log.d(TAG, "leaveScene");
        int ret = Constants.ERR_OK;
        if (metaChatScene != null) {
            ret += rtcEngine.leaveChannel();
            ret += metaChatScene.leaveScene();
        }
        if (spatialAudioEngine != null) {
            ILocalSpatialAudioEngine.destroy();
            spatialAudioEngine = null;
        }
        return ret == Constants.ERR_OK;
    }

    @Override
    public void onConnectionStateChanged(int state, int reason) {
        for (IMetachatEventHandler handler : metaChatEventHandlerMap.keySet()) {
            handler.onConnectionStateChanged(state, reason);
        }
    }

    @Override
    public void onRequestToken() {
        for (IMetachatEventHandler handler : metaChatEventHandlerMap.keySet()) {
            handler.onRequestToken();
        }
    }

    @Override
    public void onGetScenesResult(MetachatSceneInfo[] scenes, int errorCode) {
        for (IMetachatEventHandler handler : metaChatEventHandlerMap.keySet()) {
            handler.onGetScenesResult(scenes, errorCode);
        }
    }

    @Override
    public void onDownloadSceneProgress(MetachatSceneInfo sceneInfo, int progress, int state) {
        for (IMetachatEventHandler handler : metaChatEventHandlerMap.keySet()) {
            handler.onDownloadSceneProgress(sceneInfo, progress, state);
        }
    }

    @Override
    public void onEnterSceneResult(int errorCode) {
        Log.e(TAG, String.format("onEnterSceneResult#############  %d", errorCode));
        if (errorCode == 0) {
            rtcEngine.joinChannel(
                    /*KeyCenter.RTC_TOKEN*/mRtctk, roomName, KeyCenter.RTC_UID,
                    new ChannelMediaOptions() {{
                        publishAudioTrack = true;
                        autoSubscribeAudio = true;
                        clientRoleType = Constants.CLIENT_ROLE_BROADCASTER;
                    }});
            if (spatialAudioEngine != null) {
                // audio的mute状态交给ILocalSpatialAudioEngine统一管理
                rtcEngine.muteAllRemoteAudioStreams(true);
            }

            pushVideoFrameToDisplay();
        }
        for (IMetachatSceneEventHandler handler : metaChatSceneEventHandlerMap.keySet()) {
            handler.onEnterSceneResult(errorCode);
        }
    }

    // Just for test
    private void pushVideoFrameToDisplay() {
        metaChatScene.enableVideoDisplay(0, true);
        metaChatScene.pushVideoFrameToDisplay(0, new AgoraVideoFrame() {{
            format = AgoraVideoFrame.FORMAT_RGBA;
            stride = 496;
            height = 498;
            buf = new byte[stride * 4 * height];
            try {
                AssetManager assetManager = MainApplication.instance.getAssets();
                InputStream stream = assetManager.open("test.rgba", AssetManager.ACCESS_BUFFER);
                stream.read(buf);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }});
    }

    @Override
    public void onLeaveSceneResult(int errorCode) {
        Log.d(TAG, String.format("onLeaveSceneResult %d", errorCode));
        if (errorCode == 0) {
            metaChatScene.release();
            metaChatScene = null;
        }

        for (IMetachatSceneEventHandler handler : metaChatSceneEventHandlerMap.keySet()) {
            handler.onLeaveSceneResult(errorCode);
        }
    }

    @Override
    public void onRecvMessageFromScene(byte[] message) {
        Log.d(TAG, String.format("onRecvMessageFromScene %s", new String(message)));
        for (IMetachatSceneEventHandler handler : metaChatSceneEventHandlerMap.keySet()) {
            handler.onRecvMessageFromScene(message);
        }
    }

    @Override
    public void onUserPositionChanged(String uid, MetachatUserPositionInfo posInfo) {
     /*   Log.e(TAG, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        Log.e(TAG, String.format("onUserPositionChanged %s %s %s %s %s", uid,
                Arrays.toString(posInfo.mPosition),
                Arrays.toString(posInfo.mForward),
                Arrays.toString(posInfo.mRight),
                Arrays.toString(posInfo.mUp)
        ));*/


        if (spatialAudioEngine != null) {
            try {
                int userId = Integer.parseInt(uid);
                if (KeyCenter.RTC_UID == userId) {
                    spatialAudioEngine.updateSelfPosition(
                            posInfo.mPosition, posInfo.mForward, posInfo.mRight, posInfo.mUp
                    );
                } else if (mJoinedRtc) {
                    spatialAudioEngine.updateRemotePosition(userId, new RemoteVoicePositionInfo() {{
                        position = posInfo.mPosition;
                        forward = posInfo.mForward;
                    }});
                }
            } catch (NumberFormatException e) {
                e.printStackTrace();
            }
        }

        for (IMetachatSceneEventHandler handler : metaChatSceneEventHandlerMap.keySet()) {
            handler.onUserPositionChanged(uid, posInfo);
        }
    }

}
