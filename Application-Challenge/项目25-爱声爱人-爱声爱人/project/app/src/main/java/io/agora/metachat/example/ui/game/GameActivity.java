package io.agora.metachat.example.ui.game;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.core.content.res.ResourcesCompat;
import androidx.databinding.Observable;
import androidx.databinding.ObservableBoolean;

import com.zhy.http.okhttp.OkHttpUtils;
import com.zhy.http.okhttp.callback.StringCallback;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.Locale;

import coil.ImageLoaders;
import coil.request.ImageRequest;

import io.agora.meta.AgoraMetaActivity;
import io.agora.meta.AgoraMetaView;
import io.agora.metachat.IMetachatSceneEventHandler;
import io.agora.metachat.MetachatUserPositionInfo;
import io.agora.metachat.example.MainActivity;
import io.agora.metachat.example.MetaChatContext;
import io.agora.metachat.example.R;
import io.agora.metachat.example.databinding.GameActivityBinding;
import io.agora.metachat.example.dialog.CustomDialog;
import io.agora.metachat.example.ui.main.GroupItem;
import io.agora.metachat.example.ui.main.MessageItem;
import io.agora.rtc2.Constants;
import okhttp3.Call;

public class GameActivity extends AgoraMetaActivity implements View.OnClickListener, IMetachatSceneEventHandler {

    private final static String TAG = GameActivity.class.getName();
    private GameActivityBinding binding;
    private final ObservableBoolean isEnterScene = new ObservableBoolean(false);
    private final ObservableBoolean enableMic = new ObservableBoolean(true);
    private final ObservableBoolean enableSpeaker = new ObservableBoolean(true);
    private final ObservableBoolean isBroadcaster = new ObservableBoolean(true);
    public Handler mHandler;
    private int realLength = 0;
    private int cntShow = 0;
   // private MaterialDialog mAnimatedDialog;
    private GroupItem[]  gpitems = new GroupItem[20];
    private final Observable.OnPropertyChangedCallback callback =
            new Observable.OnPropertyChangedCallback() {
                @Override
                public void onPropertyChanged(Observable sender, int propertyId) {
                    if (sender == isEnterScene) {
                        binding.back.setVisibility(isEnterScene.get() ? View.VISIBLE : View.GONE);
                        binding.card.getRoot().setVisibility(isEnterScene.get() ? View.VISIBLE : View.GONE);
                        binding.users.setVisibility(isEnterScene.get() ? View.VISIBLE : View.GONE);
                        binding.mic.setVisibility(isEnterScene.get() ? View.VISIBLE : View.GONE);
                        binding.speaker.setVisibility(isEnterScene.get() ? View.VISIBLE : View.GONE);
                    } else if (sender == enableMic) {
                        if (!MetaChatContext.getInstance().enableLocalAudio(enableMic.get())) {
                            return;
                        }
                        binding.mic.setImageDrawable(
                                ResourcesCompat.getDrawable(
                                        getResources(),
                                        enableMic.get() ? R.mipmap.microphone_on : R.mipmap.microphone_off,
                                        getTheme()
                                )
                        );
                    } else if (sender == enableSpeaker) {
                        if (!MetaChatContext.getInstance().muteAllRemoteAudioStreams(!enableSpeaker.get())) {
                            return;
                        }
                        binding.speaker.setImageDrawable(
                                ResourcesCompat.getDrawable(
                                        getResources(),
                                        enableSpeaker.get() ? R.mipmap.voice_on : R.mipmap.voice_off,
                                        getTheme()
                                )
                        );
                    } else if (sender == isBroadcaster) {
                        if (!MetaChatContext.getInstance().updateRole(isBroadcaster.get() ?
                                Constants.CLIENT_ROLE_BROADCASTER : Constants.CLIENT_ROLE_AUDIENCE)) {
                            return;
                        }
                        binding.card.mode.setText(isBroadcaster.get() ? "语聊模式" : "游客模式");
                        binding.card.tips.setVisibility(isBroadcaster.get() ? View.GONE : View.VISIBLE);
                        binding.card.role.setImageDrawable(
                                ResourcesCompat.getDrawable(
                                        getResources(),
                                        isBroadcaster.get() ? R.mipmap.offbtn : R.mipmap.onbtn,
                                        getTheme()
                                )
                        );
                        binding.mic.setVisibility(isBroadcaster.get() ? View.VISIBLE : View.GONE);
                        if (isBroadcaster.get()) enableMic.set(true);
                    }
                }
            };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = GameActivityBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        isEnterScene.addOnPropertyChangedCallback(callback);
        enableMic.addOnPropertyChangedCallback(callback);
        enableSpeaker.addOnPropertyChangedCallback(callback);
        isBroadcaster.addOnPropertyChangedCallback(callback);
        MetaChatContext.getInstance().registerMetaChatSceneEventHandler(this);

        initUnity();

        refreshByIntent(getIntent());
        mHandler = new Handler() {
            public void handleMessage(Message msg) {
                //打印发送者发来的消息
                System.out.println("main what:"+msg.what);
                System.out.println("main obj:"+msg.obj.toString());
                System.out.println("main arg1:"+msg.arg1);
                Log.e(TAG,String.format("gpitems realLength  %d $$$$$$$$$$$$$ ",realLength));
                getList();
                /*if(gpitems.length>0  && gpitems[0] != null){

                    CustomDialog.showGItem(GameActivity.this,gpitems[0].groupImgurl,gpitems[0].groupTxt,null,
                            null,
                            null);

                }*/


                //CustomDialog.showTips(GameActivity.this);
              //  mAnimatedDialog.show();

            };
        };
        CustomDialog.showUsage(GameActivity.this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        refreshByIntent(intent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        isEnterScene.removeOnPropertyChangedCallback(callback);
        enableMic.removeOnPropertyChangedCallback(callback);
        enableSpeaker.removeOnPropertyChangedCallback(callback);
        isBroadcaster.removeOnPropertyChangedCallback(callback);
        MetaChatContext.getInstance().registerMetaChatSceneEventHandler(this);
    }

    private void refreshByIntent(Intent intent) {
        String nickname = intent.getStringExtra("nickname");
        if (nickname != null) {
            binding.card.nickname.setText(nickname);
        }

        String avatar = intent.getStringExtra("avatar");
        if (avatar != null) {
            ImageRequest request = new ImageRequest.Builder(this)
                    .data(avatar)
                    .target(binding.card.avatar)
                    .build();
            ImageLoaders.create(this)
                    .enqueue(request);
        }

        String roomName = intent.getStringExtra("roomName");
        if (roomName != null) {
            MetaChatContext.getInstance().createAndEnterScene(roomName);
        }
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.back:
                MetaChatContext.getInstance().leaveScene();
                break;
            case R.id.mode:
            case R.id.tips:
                if (!isBroadcaster.get()) {
                    CustomDialog.showTips(this);
                }
                break;
            case R.id.role:
                isBroadcaster.set(!isBroadcaster.get());
                break;
            case R.id.users:
                Toast.makeText(this, "暂不支持", Toast.LENGTH_LONG)
                        .show();
               // CustomDialog.showTips(this);
                break;
            case R.id.mic:
                enableMic.set(!enableMic.get());
                break;
            case R.id.speaker:
                enableSpeaker.set(!enableSpeaker.get());
                break;
        }
    }

    @Override
    public void onUnityPlayerLoaded(AgoraMetaView view) {
        binding.unity.addView(view);

        Log.e(TAG, "onUnityPlayerLoaded : ");
     //   getList();
    }

    @Override
    public void onUnityPlayerUnloaded() {
        // 必须在onUnityPlayerUnloaded里调用
        MetaChatContext.getInstance().destroy();

        isEnterScene.set(false);

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        startActivity(intent);
    }

    @Override
    public void onUnityPlayerQuitted() {
    }

    @Override
    public void onEnterSceneResult(int errorCode) {

        Log.e(TAG, "onEnterSceneResult : ");
        runOnUiThread(() -> {
            if (errorCode != 0) {
                Toast.makeText(this, String.format(Locale.getDefault(), "EnterSceneFailed %d", errorCode), Toast.LENGTH_LONG).show();
                return;
            }
            isEnterScene.set(true);
            enableMic.set(true);
            enableSpeaker.set(true);
            isBroadcaster.set(true);
        });
    }

    @Override
    public void onLeaveSceneResult(int errorCode) {
        if (errorCode == 0) {
            unloadUnity();
        }
    }

    @Override
    public void onRecvMessageFromScene(byte[] message) {
        Log.e(TAG, "onRecvMessageFromScene : ");
    }

    @Override
    public void onUserPositionChanged(String uid, MetachatUserPositionInfo posInfo) {
       /* Log.e(TAG, String.format("onUserPositionChanged %s %s %s %s %s", uid,
                Arrays.toString(posInfo.mPosition),
                Arrays.toString(posInfo.mForward),
                Arrays.toString(posInfo.mRight),
                Arrays.toString(posInfo.mUp)
        ));*/
        cntShow++;

      //  if(posInfo.mPosition[0] >16.01282 &&  posInfo.mPosition[0] <16.04106)
          if(cntShow>100){
            Message msg = mHandler.obtainMessage();
            //设置发送的内容
            msg.arg1 = 1;
            msg.what = 3;
            msg.obj = "this is MyThread";
            mHandler.sendMessage(msg);
            cntShow = 0;
        }

    }



//////////////////////////////////////////
public void getList(){
        String url = "https://www.tingwx.com/index/?tp=list&id=0&tst=0&ur=0";
        OkHttpUtils
                .get()
                .url(url)
                .build()
                .execute(new StringCallback()
                {
                    @Override
                    public void onError(Call call, Exception e, int id) {

                    }

                    @Override
                    public void onResponse(String response, int id) {

                        try {
                            JSONArray jsonArray = new JSONArray(response);
                            int ll = jsonArray.length()>20?20:jsonArray.length();
                            realLength = ll;
                            for(int i=0;i<ll;i++){
                                Log.e(TAG, "getList :$$$$$$$$$$$$$$$$$$$   ");
                                //Log.e(TAG, "onResponse okhttp : " + response);
                                JSONObject jsonobj = jsonArray.getJSONObject(i);
                                GroupItem gi = new GroupItem();
                                gi.groupid = jsonobj.get("groupid").toString();
                                gi.name = jsonobj.get("name").toString();
                                gi.content = jsonobj.get("content").toString();;
                                gi.gptype = jsonobj.get("gptype").toString();;
                                gi.pktype = jsonobj.get("pktype").toString();;
                             //   gi.owavatarurl = jsonobj.get("avatarurl").toString();;


                              //  gi.groupImgurl = jsonobj.get("groupurl").toString();;
                              //  gi.groupTxt = jsonobj.get("name").toString();;
                                JSONArray jDetail = jsonobj.getJSONArray("gpdetail");
                                gi.groupImgurl = "";
                                gi.groupTxt = "";
                                for(int j=0;j<jDetail.length();j++){
                                    JSONObject jsj = jDetail.getJSONObject(j);
                                    if(jsj.get("type").toString().equals("img")){
                                        gi.groupImgurl = jsj.get("groupurl").toString();;
                                    }
                                    if(jsj.get("type").toString().equals("txt")){
                                        gi.groupTxt = jsj.get("content").toString();;
                                    }
                                    gi.owavatarurl = jsj.get("avatarurl").toString();;
                                    gi.user_nickname = jsj.get("user_nickname").toString();;
                                    gi.user_id = jsj.get("user_id").toString();;

                                }
                                MessageItem hotMsg = new MessageItem();
                              //  JSONObject jsmsg = jsonobj.getJSONObject("gphotmsg");
                                JSONArray jsmsgarr = jsonobj.getJSONArray("gphotmsg");
                                if(jsmsgarr.length()>0){
                                    JSONObject jsmsg =jsmsgarr.getJSONObject(0);
                                    if(jsmsg.has("msg_id")){
                                        Log.e(TAG, "jsmsg okhttp ^^^^^^^  : " + jsmsg.toString());
                                        hotMsg.avatarurl = jsmsg.get("avatarurl").toString();
                                        hotMsg.user_nickname = jsmsg.get("user_nickname").toString();;
                                        hotMsg.chatfrom = jsmsg.get("chatfrom").toString();;
                                        hotMsg.msg_id = jsmsg.get("msg_id").toString();;
                                        hotMsg.tstamp = jsmsg.get("tstamp").toString();;
                                        hotMsg.weburl = jsmsg.get("weburl").toString();;
                                        hotMsg.listencount = jsmsg.getInt("listencount");
                                        hotMsg.likecount = jsmsg.getInt("likecount");
                                        hotMsg.sharecount = jsmsg.getInt("sharecount");
                                        gi.hotMsg = hotMsg;
                                    }

                                }




                                gpitems[i] = gi;
                                Log.e(TAG, String.format("gpitems&&&&&&&&&&&&&&&   %d  %s  %s  : " ,i,gi.name,gpitems[i].groupid));
                            }
                            if(ll>0){
                             //
                                for(int h =0;h<ll;h++){
                                    Log.e(TAG, String.format("gpitems ll>0 ###############   %d  , %s , %s   : " ,h,gpitems[h].name,gpitems[h].groupTxt));
                                    Log.e(TAG, String.format("gpitems ll>0 groupImgurl    %s   : " ,gpitems[h].groupImgurl));
                                    if(gpitems[h].groupTxt.length()>1 || gpitems[h].groupImgurl.length()>1){
                                        Log.e(TAG, String.format("gpitems ll>0 @@@@@@@@@@@     %s : " ,gpitems[h].groupImgurl));
                                        CustomDialog.showGItem(GameActivity.this,gpitems[h].groupImgurl,gpitems[h].groupTxt,null,
                                                null,
                                                null);

                                        break;

                                    }

                                }



                            }


                        //    JSONObject jsonobj = new JSONObject(response);
                            //JSONObject  jsonObject = jsonArray.getJSONObject(i) ;
                         //   Log.e(TAG, "onResponse okhttp : " + jsonobj.get("rtctoken").toString());
                        //    Log.e(TAG, "onResponse okhttp : " + jsonobj.get("rtmtoken").toString());
                       //     mViewModel.getScenes(jsonobj.get("rtctoken").toString(),jsonobj.get("rtmtoken").toString());

                        }
                        catch (Exception e) {
                            Log.e(TAG, "exception&&&&&&&&&&&&&&&");
                            Log.e(TAG, e.toString());
                            e.printStackTrace();
                        }
                    }


                });

    }

//////////////////////////////////////////


}
