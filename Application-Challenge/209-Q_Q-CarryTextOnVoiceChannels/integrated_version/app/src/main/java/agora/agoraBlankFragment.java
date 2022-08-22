package agora;

/*
	author by:2432655389@qq.com
	商业合作请联系author
	非商业化使用请标明出处
	内有百度地图和agora的sdk的授权ak
	短时间内试用还ok，时间长了估计免费额度就over了
	长时间请替换成自己的授权ak
*/

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.telephony.CellIdentityCdma;
import android.telephony.CellIdentityGsm;
import android.telephony.CellIdentityLte;
import android.telephony.CellIdentityNr;
import android.telephony.CellIdentityWcdma;
import android.telephony.CellInfo;
import android.telephony.CellInfoCdma;
import android.telephony.CellInfoGsm;
import android.telephony.CellInfoLte;
import android.telephony.CellInfoNr;
import android.telephony.CellInfoWcdma;
import android.telephony.CellSignalStrengthCdma;
import android.telephony.CellSignalStrengthGsm;
import android.telephony.CellSignalStrengthLte;
import android.telephony.CellSignalStrengthNr;
import android.telephony.CellSignalStrengthWcdma;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.Observer;

import com.example.integrated_version.R;
import com.yanzhenjie.permission.AndPermission;
import com.yanzhenjie.permission.runtime.Permission;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import baiduMap.LiveDataBusBeta;
import baiduMap.baiduMapMainActivity;
import io.agora.rtc.AudioFrame;
import io.agora.rtc.Constants;
import io.agora.rtc.IAudioFrameObserver;
import io.agora.rtc.IRtcEngineEventHandler;
import io.agora.rtc.RtcEngine;
import io.agora.rtc.audio.AudioParams;
import io.agora.rtc.models.ChannelMediaOptions;

import static io.agora.rtc.IRtcEngineEventHandler.ClientRole.CLIENT_ROLE_BROADCASTER;


public class agoraBlankFragment extends BaseFragment implements View.OnClickListener, CompoundButton.OnCheckedChangeListener{
    private static final String TAG = agoraBlankFragment.class.getSimpleName();
    private EditText et_channel;
    private Button mute, join, speaker;
    @SuppressLint("UseSwitchCompatOrMaterialCode")
    private Switch loopback;
    private RtcEngine engine;
    private int myUid;
    private boolean joined = false;
    private boolean isEnableLoopBack = false;
    private AudioPlayer mAudioPlayer;
    private static final Integer SAMPLE_RATE = 48000;
    private static final Integer SAMPLES_PER_CALL = 8192;
    private static final Integer SAMPLE_NUM_OF_CHANNEL = 1;
    private static short[] data_short=new short[48000];
    private static int data_short_index=0,complexInput_index=0;
    private static byte destBig,destSmall,destBigRemote,destSmallRemote;
    private static short destShort;
    private static short[] destShortArray=new short[8192];
    private static double[] absData=new double[4096];
    private static double[] angleData=new double[4096];
    private static Qiu_fft.Complex[] complexInput=new Qiu_fft.Complex[8192];
    private static Qiu_fft.Complex[] complexOutput=new Qiu_fft.Complex[8192];
    private EditText freq_input,angle_input,angle_input2,time_input;
    private String s_freq,s_angle,s_time;
    private Button transmisson;
    private TextView freq_angle_output;
    private StringBuffer sb=new StringBuffer(256);
    private int[] result=new int[1024];
    private int result_index=0;
    Timer timer = new Timer();
    private int timerLimit=0;
    private int[] ceShi;
    private ArrayList<Integer> arrayList=new ArrayList<Integer>(20);
    private String jieGuoJingWeiDu;
    private int ceShi_index=0;
    private boolean flag=false;
    private StringBuffer jieGuoSb=new StringBuffer(256);
    private Button transmissonRight,transmissonLeft;
    TimerTask timerTask;
    private double[] intervalMain=new double[SAMPLE_RATE];
    private int sum_zero=0;
    private int sum_index_num=0;
    private boolean sum_zero_flag=true;
    private short pre_value;
    private boolean pre_value_none=true;
    private IFragmentCallback fragmentCallback;
    public void setFragmentCallback(IFragmentCallback callback){
        fragmentCallback=callback;
    }
    private Observer mObserver;
    private String jingWeiDu="";
    private Button UnicodeEncode,UnicodeDecode,rsrpEncode,rsrpDecode;
    private TextView freq_angle_output2,freq_angle_output3,freq_angle_output4;
    private boolean silenceFlag=false;
    private void intiData(){
        intervalMain[0]=0;
        for(int i=1;i<SAMPLE_RATE;i++)
        {
            intervalMain[i]=intervalMain[i-1]+(2*Math.PI)/(double)SAMPLE_RATE;
        }
    }
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handler = new Handler();
        intiData();
        mObserver=new Observer() {
            @Override
            public void onChanged(Object o) {

            }
        };

        LiveDataBusBeta.getInstance()
                .with("baiduMap",String.class)
                .observe(this, new Observer<String>() {
                    @Override
                    public void onChanged(String s) {
                        jingWeiDu=s;
                        freq_input.setText(jingWeiDu+",校验码："+jingWeiDu.hashCode()%99);
                    }
                });

    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_agora_blank, container, false);
        return view;
    }
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        join = view.findViewById(R.id.btn_join);
        et_channel = view.findViewById(R.id.et_channel);
        view.findViewById(R.id.btn_join).setOnClickListener(this);
        mute = view.findViewById(R.id.btn_mute);
        mute.setOnClickListener(this);
        speaker = view.findViewById(R.id.btn_speaker);
        speaker.setOnClickListener(this);
        loopback = view.findViewById(R.id.loopback);
        loopback.setOnCheckedChangeListener(this);
        freq_input=view.findViewById(R.id.freq_input);
        angle_input=view.findViewById(R.id.angle_input);
        angle_input2=view.findViewById(R.id.angle_input2);
        time_input=view.findViewById(R.id.time_input);
        transmisson=view.findViewById(R.id.transmission);
        transmisson.setOnClickListener(this);
        freq_angle_output=view.findViewById(R.id.freq_angle_output);
        transmissonRight=view.findViewById(R.id.transmissionRight);
        transmissonRight.setOnClickListener(this);
        transmissonLeft=view.findViewById(R.id.transmissionLeft);
        transmissonLeft.setOnClickListener(this);
        UnicodeEncode=view.findViewById(R.id.UnicodeEncode);
        UnicodeEncode.setOnClickListener(this);
        UnicodeDecode=view.findViewById(R.id.UnicodeDecode);
        UnicodeDecode.setOnClickListener(this);
        rsrpEncode=view.findViewById(R.id.rsrpEncode);
        rsrpEncode.setOnClickListener(this);
        rsrpDecode=view.findViewById(R.id.rsrpDecode);
        rsrpDecode.setOnClickListener(this);
        freq_angle_output2=view.findViewById(R.id.freq_angle_output2);
        freq_angle_output3=view.findViewById(R.id.freq_angle_output3);
        freq_angle_output4=view.findViewById(R.id.freq_angle_output4);

    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // Check if the context is valid
        Context context = getContext();
        if (context == null) {
            return;
        }
        try {
            String appId = getString(R.string.agora_app_id);
            engine = RtcEngine.create(getContext().getApplicationContext(), appId, iRtcEngineEventHandler);
            if(engine.registerAudioFrameObserver(audioFrameObserver)!=0){
                showLongToast(engine.registerAudioFrameObserver(audioFrameObserver)+"");
            }
            else{
                //showLongToast("registerAudioFrameObserver成功");
            }
            mAudioPlayer = new AudioPlayer(AudioManager.STREAM_VOICE_CALL, SAMPLE_RATE, SAMPLE_NUM_OF_CHANNEL, AudioFormat.CHANNEL_OUT_MONO);
        }
        catch (Exception e) {
            e.printStackTrace();
            getActivity().onBackPressed();
        }

    }
    public void onDestroy() {
        super.onDestroy();
        /**leaveChannel and Destroy the RtcEngine instance*/
        if (engine != null) {
            engine.leaveChannel();
        }
        handler.post(RtcEngine::destroy);
        engine = null;
        mAudioPlayer.stopPlayer();
    }
    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.btn_join) {
            data_short_index=0;//这样就不用必须得销毁activity
            if (!joined) {
                CommonUtil.hideInputBoard(getActivity(), et_channel);
                // call when join button hit
                String channelId = et_channel.getText().toString();
                // Check permission
                if (AndPermission.hasPermissions(this, Permission.Group.STORAGE, Permission.Group.MICROPHONE, Permission.Group.CAMERA)) {
                    joinChannel(channelId);
                    return;
                }
                // Request permission
                AndPermission.with(this).runtime().permission(
                        Permission.Group.STORAGE,
                        Permission.Group.MICROPHONE
                ).onGranted(permissions ->
                {
                    // Permissions Granted
                    joinChannel(channelId);
                }).start();
            } else {
                joined = false;
                engine.leaveChannel();
                join.setText(getString(R.string.join));
                speaker.setText(getString(R.string.speaker));
                speaker.setEnabled(false);
                mute.setText(getString(R.string.closemicrophone));
                mute.setEnabled(false);
            }
        } else if (v.getId() == R.id.btn_mute) {
            mute.setActivated(!mute.isActivated());
            mute.setText(getString(mute.isActivated() ? R.string.openmicrophone : R.string.closemicrophone));
            /**Turn off / on the microphone, stop / start local audio collection and push streaming.*/
            engine.muteLocalAudioStream(mute.isActivated());
        } else if (v.getId() == R.id.btn_speaker) {
            speaker.setActivated(!speaker.isActivated());
            speaker.setText(getString(speaker.isActivated() ? R.string.earpiece : R.string.speaker));
            /**Turn off / on the speaker and change the audio playback route.*/
            engine.setEnableSpeakerphone(speaker.isActivated());
        }
        else if(v.getId() == R.id.transmission){//地址编码
            try {
                resetTimer();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
            int int_freq=500;
            double double_angle=0;
            int int_time=48000;
            s_freq=freq_input.getText().toString();
            s_angle=angle_input.getText().toString();
            s_time=time_input.getText().toString();
            //获取编码字符串
            if(jingWeiDu.isEmpty()){
                ceShi=Han_encode.encode(Han_encode.stringToStr12("35.768457_115.035485"));
                freq_input.setText("错误，将编码默认数据"+",校验码："+"35.768457_115.035485".hashCode()%99);
            }
            else {
                ceShi = Han_encode.encode(Han_encode.stringToStr12(jingWeiDu));
            }
            sequenceGenerate();
            showLongToast("需要"+ceShi.length*0.26+"秒");
        }
        else if(v.getId() == R.id.transmissionRight){

            if(silenceFlag==false){
                silenceFlag=true;
                transmissonRight.setText("静音");
            }
            else{
                silenceFlag=false;
                transmissonRight.setText("有声");
            }
        }
        else if(v.getId()==R.id.transmissionLeft){
            int[] jieGuo=new int[arrayList.size()];
            for(int i=0;i<arrayList.size();i++) {
                jieGuo[i]=arrayList.get(i).intValue();
            }
            jieGuoJingWeiDu=Han_encode.str12ToString(Han_encode.decode(jieGuo));
            String[] strings=jieGuoJingWeiDu.split("_");
            if(strings.length==2&&jieGuoJingWeiDu.length()>12) {
                LiveDataBusBeta
                        .getInstance()
                        .with("key_MainActivity", String.class)
                        .setValue(jieGuoJingWeiDu);
                freq_angle_output2.setText("远端的经纬度：" + jieGuoJingWeiDu + ",远端的校验码：" + jieGuoJingWeiDu.hashCode() % 99);//freq_angle_output2默认安放经纬度信息
                Intent intent = new Intent(getActivity(), baiduMapMainActivity.class);
                startActivity(intent);
            }
            else {
                freq_angle_output2.setText("不符合格式，推测不是此解码方式，缓存区已被清除，请要求对方重传"+jieGuoJingWeiDu);
            }
            arrayList.clear();
        }
        else if(v.getId()==R.id.UnicodeEncode){
            try {
                resetTimer();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
            s_angle=angle_input.getText().toString();
            if(s_angle.isEmpty()){
                showLongToast("未输入信息流");
            }
            else{
                ceShi=Han_encodeHanZi.encode(s_angle);
                String str=Han_encodeHanZi.decode(Han_encodeHanZi.encode(s_angle));
                angle_input2.setText("校验码："+s_angle.hashCode()%99);
                sequenceGenerate();
                showLongToast("需要"+ceShi.length*0.26+"秒");
            }

        }
        else if(v.getId()==R.id.UnicodeDecode){//汉语解码
            int[] jieGuo=new int[arrayList.size()];
            String str="";
            for(int i=0;i<arrayList.size();i++) {
                jieGuo[i]=arrayList.get(i).intValue();
            }
            str=Han_encodeHanZi.decode(jieGuo);
            freq_angle_output3.setText("普通语言解码："+str+" 校验码："+str.hashCode()%99);
            arrayList.clear();

        }
        else if(v.getId()==R.id.rsrpEncode){
            try {
                resetTimer();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
            String str=getSignalInfo();
            if(str.isEmpty()){
                time_input.setText("未能捕获");
            }
            else{
                ceShi=Han_encode_signal.encode(Han_encode_signal.stringToStr12(str));
                time_input.setText(str+" 校验码："+str.hashCode()%99);
                sequenceGenerate();
                showLongToast("需要"+ceShi.length*0.26+"秒");
            }
        }
        else if(v.getId()==R.id.rsrpDecode){
            int[] jieGuo=new int[arrayList.size()];
            String str="";
            for(int i=0;i<arrayList.size();i++) {
                jieGuo[i]=arrayList.get(i).intValue();
            }
            str=Han_encode_signal.str12ToString(Han_encode_signal.decode(jieGuo));
            String[] strings=str.split("_");
            if(strings.length==5){
                freq_angle_output4.setText("信号解码 mcc:"+strings[0]+"mnc:"+strings[1]+"位置码："+strings[2]
                +"小区号："+strings[3]+"信号强度"+strings[4]+" 校验码:"+str.hashCode()%99);

            }
            else {
                freq_angle_output4.setText("不符合格式，推测不是此解码方式，缓存区已被清除，请要求对方重传");
            }
            arrayList.clear();
        }

    }
    private void resetTimer() throws Throwable {
        if(timerTask!=null) {
            timerTask.cancel();
            timer.purge();
            ceShi_index = 0;
            ceShi = null;
        }
        jieGuoSb.delete(0,jieGuoSb.length());
    }

    private void  sequenceGenerate2(int[] ceShi2){
        int singleNumber=4;
        int numIncrease=48000/singleNumber;
        timerTask=new TimerTask() {
            @Override
            public void run() {
                if(flag==false&&ceShi2!=null&&ceShi_index!=ceShi2.length) {
                    for (int i = 0; i < singleNumber&&ceShi_index<ceShi2.length; i++) {
                        Qiu_fft.generate4(data_short,intervalMain, ceShi2[ceShi_index] * (double) 48000 / 8192, 0, 48000, numIncrease, data_short_index%48000);
                        ceShi_index++;
                        data_short_index += numIncrease;
                    }
                    if(data_short_index==48000&&ceShi_index!=ceShi2.length){
                        flag=true;
                        data_short_index=0;
                    }
                    if(ceShi_index==ceShi2.length){
                        flag=true;
                        data_short_index=0;
                    }
                }
            }
        };
        timer.schedule(timerTask,0,513);

    }
    private void  sequenceGenerate(){
        int singleNumber=4;
        int numIncrease=48000/singleNumber;
        timerTask=new TimerTask() {
            @Override
            public void run() {
                if(flag==false&&ceShi!=null&&ceShi_index!=ceShi.length) {
                    for (int i = 0; i < singleNumber&&ceShi_index<ceShi.length; i++) {
                        Qiu_fft.generate4(data_short,intervalMain, ceShi[ceShi_index] * (double) 48000 / 8192, 0, 48000, numIncrease, data_short_index%48000);
                        ceShi_index++;
                        data_short_index += numIncrease;
                    }
                    if(data_short_index==48000){
                        flag=true;
                        data_short_index=0;
                    }
                    if(ceShi_index==ceShi.length){
                        flag=true;
                        data_short_index=0;
                    }
                }
            }
        };
        timer.schedule(timerTask,0,600);

    }
    private void joinChannel(String channelId) {
        engine.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING);
        engine.setClientRole(CLIENT_ROLE_BROADCASTER);
        String accessToken = getString(R.string.agora_access_token);
        if (TextUtils.equals(accessToken, "") || TextUtils.equals(accessToken, "<#YOUR ACCESS TOKEN#>")) {
            accessToken = null;
        }

        engine.enableAudioVolumeIndication(1000, 3, true);

        ChannelMediaOptions option = new ChannelMediaOptions();
        option.autoSubscribeAudio = true;
        option.autoSubscribeVideo = true;
        engine.setAudioProfile(4,3);
        int res = engine.joinChannel(accessToken, channelId, "Extra Optional Data", 0, option);
        if (res != 0) {
            showAlert(RtcEngine.getErrorDescription(Math.abs(res)));
            Log.e(TAG, RtcEngine.getErrorDescription(Math.abs(res)));
            return;
        }
        join.setEnabled(false);
    }

    private final IRtcEngineEventHandler iRtcEngineEventHandler = new IRtcEngineEventHandler() {
        @Override
        public void onWarning(int warn) {
            Log.w(TAG, String.format("onWarning code %d message %s", warn, RtcEngine.getErrorDescription(warn)));
        }
        @Override
        public void onError(int err) {
            Log.e(TAG, String.format("onError code %d message %s", err, RtcEngine.getErrorDescription(err)));
            showAlert(String.format("onError code %d message %s", err, RtcEngine.getErrorDescription(err)));
        }
        @Override
        public void onLeaveChannel(RtcStats stats) {
            super.onLeaveChannel(stats);
            Log.i(TAG, String.format("local user %d leaveChannel!", myUid));
            showLongToast(String.format("local user %d leaveChannel!", myUid));
        }
        @Override
        public void onJoinChannelSuccess(String channel, int uid, int elapsed) {
            Log.i(TAG, String.format("onJoinChannelSuccess channel %s uid %d", channel, uid));
            showLongToast(String.format("onJoinChannelSuccess channel %s uid %d", channel, uid));
            mAudioPlayer.startPlayer();
            myUid = uid;
            joined = true;
            handler.post(new Runnable() {
                @Override
                public void run() {
                    speaker.setEnabled(true);
                    mute.setEnabled(true);
                    join.setEnabled(true);
                    join.setText(getString(R.string.leave));
                    loopback.setEnabled(true);
                }
            });
        }
        @Override
        public void onRemoteAudioStateChanged(int uid, int state, int reason, int elapsed) {
            super.onRemoteAudioStateChanged(uid, state, reason, elapsed);
            Log.i(TAG, "onRemoteAudioStateChanged->" + uid + ", state->" + state + ", reason->" + reason);
        }

        @Override
        public void onUserJoined(int uid, int elapsed) {
            super.onUserJoined(uid, elapsed);
            Log.i(TAG, "onUserJoined->" + uid);
            showLongToast(String.format("user %d joined!", uid));
        }
        @Override
        public void onUserOffline(int uid, int reason) {
            Log.i(TAG, String.format("user %d offline! reason:%d", uid, reason));
            showLongToast(String.format("user %d offline! reason:%d", uid, reason));
        }

        @Override
        public void onActiveSpeaker(int uid) {
            super.onActiveSpeaker(uid);
            Log.i(TAG, String.format("onActiveSpeaker:%d", uid));
        }
    };
    private final IAudioFrameObserver audioFrameObserver = new IAudioFrameObserver() {
        @Override
        public boolean onRecordFrame(AudioFrame audioFrame) {
            if(flag==true) {
                for (int j = 0; j < audioFrame.numOfSamples; j++) {
                    destBig = (byte) (data_short[data_short_index]);//very good,果然agora比较离谱，不能直接putShort
                    audioFrame.samples.put(destBig);
                    destSmall = (byte) (data_short[data_short_index] >> 8);
                    audioFrame.samples.put(destSmall);
                    if(ceShi_index<ceShi.length) {
                        if (data_short_index < data_short.length - 1) {
                            data_short_index++;
                        } else {
                            flag = false;
                            data_short_index = 0;
                        }
                    }else if(ceShi_index==ceShi.length&&ceShi.length%4!=0){
                        if(data_short_index<data_short.length - 1-12000*(4-ceShi.length%4)){
                            data_short_index++;
                        }else{
                            flag = false;
                            data_short_index = 0;
                        }
                    }
                    else{
                        if (data_short_index < data_short.length - 1) {
                            data_short_index++;
                        } else {
                            flag = false;
                            data_short_index = 0;
                        }
                    }
                }
            }
            return true;
        }

        @SuppressLint("DefaultLocale")
        @Override
        public boolean onPlaybackFrame(AudioFrame audioFrame) {
                for (int j = 0; j < audioFrame.numOfSamples; j++) {
                    destBigRemote = audioFrame.samples.get();
                    destSmallRemote = audioFrame.samples.get();
                    int byteBufferPosition=audioFrame.samples.position();
                    destShort = (short) (destBigRemote | destSmallRemote << 8);

                    if(pre_value_none==true) {
                        pre_value = destShort;
                        pre_value_none=false;
                    }else {
                        if(5 >= pre_value - destShort||-5<=destShort-pre_value&&destShort<=10&&sum_zero_flag==true){
                            destShort=0;
                        }
                        pre_value=destShort;
                    }
                    int sum_zero_num=1500;
                    if (sum_zero_flag == true) {

                        if (sum_index_num <= sum_zero_num && destShort == 0) {
                            sum_index_num++;
                            if(sum_index_num%100==0){

                            }
                        } else if (sum_index_num > sum_zero_num && destShort != 0) {
                            sum_zero_flag = false;
                            sum_index_num=0;
                        } else if (sum_index_num > sum_zero_num && destShort == 0) {
                            if(sum_index_num>4999)
                                continue;
                            sum_index_num++;
                        } else if (sum_index_num < sum_zero_num && destShort != 0) {
                            sum_index_num = 0;
                        }
                    } else {

                        if(silenceFlag==true){
                            audioFrame.samples.position(byteBufferPosition-2);
                            audioFrame.samples.put((byte)0);
                            audioFrame.samples.put((byte)0);
                        }

                        destShortArray[complexInput_index] = destShort;
                        if (complexInput_index < destShortArray.length - 1) {
                            complexInput_index++;
                        } else {
                            sum_zero_flag=true;
                            sb.setLength(0);
                            Qiu_fft.Util.changeToComplex2(destShortArray, complexInput);
                            Qiu_fft.FFT.myFFT2(complexInput, complexInput.length, complexOutput);
                            Qiu_fft.Util.abs(complexOutput, absData);
                            Qiu_fft.Util.angle(complexOutput, angleData);
                            absData[0]=0;
                            int indexer = Qiu_byte2Short.dataMax(absData);
                            if (result_index < result.length && absData[indexer] > 5e5) {
                                result[result_index] = indexer;
                                arrayList.add(indexer);
                                jieGuoSb.append(String.valueOf(indexer).hashCode()%99);
                                jieGuoSb.append(',');
                                result_index++;
                            } else {
                                result_index = 0;
                            }
                            freq_angle_output.setText(jieGuoSb.toString());
                            complexInput_index = 0;//必须得清零
                        }
                    }
                }
            return true;
        }

        @Override
        public boolean onPlaybackFrameBeforeMixing(AudioFrame audioFrame, int uid) {
            return false;
        }

        @Override
        public boolean onMixedFrame(AudioFrame audioFrame) {
            return false;
        }

        @Override
        public boolean isMultipleChannelFrameWanted() {
            return false;
        }

        @Override
        public boolean onPlaybackFrameBeforeMixingEx(AudioFrame audioFrame, int uid, String channelId) {
            return false;
        }

        @Override
        public int getObservedAudioFramePosition() {
            return POSITION_RECORD|POSITION_PLAYBACK ;
        }

        @Override
        public AudioParams getRecordAudioParams() {
            return new AudioParams(SAMPLE_RATE, SAMPLE_NUM_OF_CHANNEL, Constants.RAW_AUDIO_FRAME_OP_MODE_READ_WRITE, 4800);
        }

        @Override
        public AudioParams getPlaybackAudioParams() {
            return new AudioParams(SAMPLE_RATE, SAMPLE_NUM_OF_CHANNEL, Constants.RAW_AUDIO_FRAME_OP_MODE_READ_WRITE, SAMPLES_PER_CALL);
        }

        @Override
        public AudioParams getMixedAudioParams() {
            return new AudioParams(SAMPLE_RATE, SAMPLE_NUM_OF_CHANNEL, Constants.RAW_AUDIO_FRAME_OP_MODE_READ_ONLY, SAMPLES_PER_CALL);
        }
    };
    private void fftReceiver(){


    }
    //获取无线网络参数
    @Override
    public void onCheckedChanged(CompoundButton compoundButton, boolean b) {
        isEnableLoopBack = b;
    }
    private String getSignalInfo(){
        int mcc = -1;
        int mnc = -1;
        int lac = -1;
        int cellId = -1;
        int rssi = -1;
        TelephonyManager tm = (TelephonyManager) getActivity().getSystemService(Context.TELEPHONY_SERVICE);
        String operator = tm.getNetworkOperator();
        mcc = Integer.parseInt(operator.substring(0, 3));
        List<String> list = new ArrayList<String>();
        if (ContextCompat.checkSelfPermission( getActivity(),android.Manifest.permission.ACCESS_COARSE_LOCATION ) != PackageManager.PERMISSION_GRANTED )
        {
            ActivityCompat.requestPermissions(
                    getActivity(),
                    new String [] { android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_NETWORK_STATE,
                    Manifest.permission.ACCESS_LOCATION_EXTRA_COMMANDS},0
                    //LocationService.MY_PERMISSION_ACCESS_COURSE_LOCATION
            );
        }
        List<CellInfo> infos = tm.getAllCellInfo();
        String towerw = null;
        int number=0;
        for (CellInfo info : infos){
            if(number<1) {
                if (info instanceof CellInfoCdma) {
                    CellInfoCdma cellInfoCdma = (CellInfoCdma) info;
                    CellIdentityCdma cellIdentityCdma = cellInfoCdma.getCellIdentity();
                    mnc = ((CellIdentityCdma) cellIdentityCdma).getSystemId();
                    lac = cellIdentityCdma.getNetworkId();
                    cellId = cellIdentityCdma.getBasestationId();
                    CellSignalStrengthCdma cellSignalStrengthCdma = cellInfoCdma.getCellSignalStrength();
                    rssi = cellSignalStrengthCdma.getCdmaDbm();

                    towerw = String.valueOf(mcc) + "_" + String.valueOf(mnc) + "_" + String.valueOf(lac)
                            + "_" + String.valueOf(cellId) + "_" + String.valueOf(rssi);

                } else if (info instanceof CellInfoGsm) {
                    CellInfoGsm cellInfoGsm = (CellInfoGsm) info;
                    CellIdentityGsm cellIdentityGsm = cellInfoGsm.getCellIdentity();
                    mnc = cellIdentityGsm.getMnc();
                    lac = cellIdentityGsm.getLac();
                    cellId = cellIdentityGsm.getCid();
                    CellSignalStrengthGsm cellSignalStrengthGsm = cellInfoGsm.getCellSignalStrength();
                    rssi = cellSignalStrengthGsm.getDbm();

                    towerw = String.valueOf(mcc) + "_" + String.valueOf(mnc) + "_" + String.valueOf(lac)
                            + "_" + String.valueOf(cellId) + "_" + String.valueOf(rssi);

                } else if (info instanceof CellInfoLte) {
                    CellInfoLte cellInfoLte = (CellInfoLte) info;
                    CellIdentityLte cellIdentityLte = cellInfoLte.getCellIdentity();
                    mnc = cellIdentityLte.getMnc();
                    lac = cellIdentityLte.getTac();
                    cellId = cellIdentityLte.getCi();
                    CellSignalStrengthLte cellSignalStrengthLte = cellInfoLte.getCellSignalStrength();
                    rssi = cellSignalStrengthLte.getDbm();

                    towerw = String.valueOf(mcc) + "_" + String.valueOf(mnc) + "_" + String.valueOf(lac)
                            + "_" + String.valueOf(cellId) + "_" + String.valueOf(rssi);

                } else if (info instanceof CellInfoWcdma) {
                    CellInfoWcdma cellInfoWcdma = (CellInfoWcdma) info;
                    CellIdentityWcdma cellIdentityWcdma = null;
                    CellSignalStrengthWcdma cellSignalStrengthWcdma = null;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR2) {
                        cellIdentityWcdma = cellInfoWcdma.getCellIdentity();
                        mnc = cellIdentityWcdma.getMnc();
                        lac = cellIdentityWcdma.getLac();
                        cellId = cellIdentityWcdma.getCid();
                        cellSignalStrengthWcdma = cellInfoWcdma.getCellSignalStrength();
                        rssi = cellSignalStrengthWcdma.getDbm();
                    }
                    towerw = String.valueOf(mcc) + "_" + String.valueOf(mnc) + "_" + String.valueOf(lac)
                            + "_" + String.valueOf(cellId) + "_" + String.valueOf(rssi);

                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && info instanceof CellInfoNr) { // 5G
                    CellSignalStrengthNr cellSignalStrengthNr = (CellSignalStrengthNr) ((CellInfoNr) info).getCellSignalStrength();
                    CellInfoNr cellInfoNr = (CellInfoNr) info;
                    CellIdentityNr cellIdentityNr = (CellIdentityNr) cellInfoNr.getCellIdentity();
                    String mccNR = "";
                    String mncNR = "";
                    mccNR = cellIdentityNr.getMccString();
                    mncNR = cellIdentityNr.getMncString();
                    int lacNR = cellIdentityNr.getTac();
                    long cellIdNR = cellIdentityNr.getNci();
                    int dbmNR=cellSignalStrengthNr.getDbm();
                    if(dbmNR==2147483647){//我真是服了小米11了，获取的信号强度全TM是错的
                        dbmNR=0;
                    }
                    towerw = String.valueOf(mccNR) + "_" + String.valueOf(mncNR) + "_" + String.valueOf(lacNR)
                            + "_" + String.valueOf(cellIdNR) + "_" + String.valueOf(dbmNR);
                } else {
                    return "";
                }
                return towerw;
            }
            number++;
            list.add(towerw);
        }
        if (list.size() > 6){
            list = list.subList(0, 5);
        }else if (list.size() < 3){
            int need = 3 - list.size();
            for (int i = 0; i < need; i++) {
                list.add("");
            }
        }
        return "";
    }

}