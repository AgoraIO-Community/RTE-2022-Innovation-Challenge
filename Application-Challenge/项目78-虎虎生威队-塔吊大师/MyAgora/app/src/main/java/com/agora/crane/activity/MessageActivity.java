package com.agora.crane.activity;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.agora.crane.R;

import java.util.List;
import java.util.Map;

import io.agora.rtm.ErrorInfo;
import io.agora.rtm.ResultCallback;
import io.agora.rtm.RtmChannel;
import io.agora.rtm.RtmChannelAttribute;
import io.agora.rtm.RtmChannelListener;
import io.agora.rtm.RtmChannelMember;
import io.agora.rtm.RtmClient;
import io.agora.rtm.RtmClientListener;
import io.agora.rtm.RtmFileMessage;
import io.agora.rtm.RtmImageMessage;
import io.agora.rtm.RtmMediaOperationProgress;
import io.agora.rtm.RtmMessage;
import io.agora.rtm.SendMessageOptions;


public class MessageActivity extends AppCompatActivity {


    // 定义全局变量

    // EditText 对象，用于 UI
    private EditText et_uid;
    private EditText et_channel_name;
    private EditText et_message_content;
    private EditText et_peer_id;

    // 消息发送方的 RTM 用户 ID
    private String uid;
    // RTM channel name
    private String channel_name;

    // Agora App ID
    private String AppID;

    // RTM 客户端实例
    private RtmClient mRtmClient;
    // RTM 频道实例
    private RtmChannel mRtmChannel;

    // TextView，在界面显示消息记录
    private TextView message_history;

    // 消息接收方的 RTM 用户 ID
    private String peer_id;
    // 消息文本内容
    private String message_content;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_message);
        // 初始化 RTM 实例
        try {
            AppID = getBaseContext().getString(R.string.app_id);
            // 初始化 RTM 客户端
            mRtmClient = RtmClient.createInstance(getBaseContext(), AppID,
                    new RtmClientListener() {
                        @Override
                        public void onConnectionStateChanged(int state, int reason) {
                            String text = "Connection state changed to " + state + "Reason: " + reason + "\n";
                            writeToMessageHistory(text);
                        }

                        @Override
                        public void onImageMessageReceivedFromPeer(RtmImageMessage rtmImageMessage, String s) {
                        }

                        @Override
                        public void onFileMessageReceivedFromPeer(RtmFileMessage rtmFileMessage, String s) {
                        }

                        @Override
                        public void onMediaUploadingProgress(RtmMediaOperationProgress rtmMediaOperationProgress, long l) {
                        }

                        @Override
                        public void onMediaDownloadingProgress(RtmMediaOperationProgress rtmMediaOperationProgress, long l) {
                        }

                        @Override
                        public void onTokenExpired() {
                        }

                        @Override
                        public void onPeersOnlineStatusChanged(Map<String, Integer> map) {
                        }

                        @Override
                        public void onMessageReceived(RtmMessage rtmMessage, String peerId) {
                            String text = "Message received from " + peerId + " Message: " + rtmMessage.getText() + "\n";
                            writeToMessageHistory(text);
                        }
                    });


        } catch (Exception e) {
            throw new RuntimeException("RTM initialization failed!");
        }

    }
    // 登录按钮
    public void onClickLogin(View v)
    {
        et_uid = (EditText) findViewById(R.id.uid);
        uid = et_uid.getText().toString();

        String token =getBaseContext().getString(R.string.token);

        // 登录 RTM 系统
        mRtmClient.login(token, uid, new ResultCallback<Void>() {
            @Override
            public void onSuccess(Void responseInfo) {
            }

            @Override
            public void onFailure(ErrorInfo errorInfo) {
                CharSequence text = "User: " + uid + " failed to log in to the RTM system!" + errorInfo.toString();
                int duration = Toast.LENGTH_SHORT;
                runOnUiThread(new Runnable() {
                    public void run() {
                        Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                        toast.show();
                    }
                });

            }
        });
    }

    // 加入频道按钮
    public void onClickJoin(View v)
    {
        et_channel_name = (EditText) findViewById(R.id.channel_name);
        channel_name = et_channel_name.getText().toString();
        // 创建频道监听器
        RtmChannelListener mRtmChannelListener = new RtmChannelListener() {
            @Override
            public void onMemberCountUpdated(int i) {

            }

            @Override
            public void onAttributesUpdated(List<RtmChannelAttribute> list) {

            }

            @Override
            public void onMessageReceived(RtmMessage message, RtmChannelMember fromMember) {
                String text = message.getText();
                String fromUser = fromMember.getUserId();

                String message_text = "Message received from " + fromUser + " : " + text + "\n";
                writeToMessageHistory(message_text);

            }

            @Override
            public void onImageMessageReceived(RtmImageMessage rtmImageMessage, RtmChannelMember rtmChannelMember) {

            }

            @Override
            public void onFileMessageReceived(RtmFileMessage rtmFileMessage, RtmChannelMember rtmChannelMember) {

            }

            @Override
            public void onMemberJoined(RtmChannelMember member) {

            }

            @Override
            public void onMemberLeft(RtmChannelMember member) {

            }
        };

        try {
            // 创建 RTM 频道
            mRtmChannel = mRtmClient.createChannel(channel_name, mRtmChannelListener);
        } catch (RuntimeException e) {
        }
        // 加入 RTM 频道
        mRtmChannel.join(new ResultCallback<Void>() {
            @Override
            public void onSuccess(Void responseInfo) {
            }

            @Override
            public void onFailure(ErrorInfo errorInfo) {
                CharSequence text = "User: " + uid + " failed to join the channel!" + errorInfo.toString();
                int duration = Toast.LENGTH_SHORT;
                runOnUiThread(new Runnable() {
                    public void run() {
                        Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                        toast.show();
                    }
                });

            }
        });

    }


    // 登出按钮
    public void onClickLogout(View v)
    {
        // 登出 RTM 系统
        mRtmClient.logout(null);
    }

    // 离开频道按钮
    public void onClickLeave(View v)
    {
        // 离开 RTM 频道
        mRtmChannel.leave(null);
    }
    // 发送点对点消息按钮
    public void onClickSendPeerMsg(View v)
    {
        et_message_content = findViewById(R.id.msg_box);
        message_content = et_message_content.getText().toString();

        et_peer_id = findViewById(R.id.peer_name);
        peer_id = et_peer_id.getText().toString();

        // 创建消息实例
        final RtmMessage message = mRtmClient.createMessage();
        message.setText(message_content);

        SendMessageOptions option = new SendMessageOptions();
        option.enableOfflineMessaging = true;

        // 发送点对点消息
        mRtmClient.sendMessageToPeer(peer_id, message, option, new ResultCallback<Void>() {

            @Override
            public void onSuccess(Void aVoid) {
                String text = "Message sent from " + uid + " To " + peer_id + " ： " + message.getText() + "\n";
                writeToMessageHistory(text);
            }

            @Override
            public void onFailure(ErrorInfo errorInfo) {
                String text = "Message fails to send from " + uid + " To " + peer_id + " Error ： " + errorInfo + "\n";
                writeToMessageHistory(text);

            }
        });

    }

    // 发送频道消息按钮
    public void onClickSendChannelMsg(View v)
    {
        et_message_content = findViewById(R.id.msg_box);
        message_content = et_message_content.getText().toString();

        // 创建消息实例
        RtmMessage message = mRtmClient.createMessage();
        message.setText(message_content);

        // 发送频道消息
        mRtmChannel.sendMessage(message, new ResultCallback<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                String text = "Message sent to channel " + mRtmChannel.getId() + " : " + message.getText() + "\n";
                writeToMessageHistory(text);
            }

            @Override
            public void onFailure(ErrorInfo errorInfo) {
                String text = "Message fails to send to channel " + mRtmChannel.getId() + " Error: " + errorInfo + "\n";
                writeToMessageHistory(text);
            }
        });


    }

    // 将消息记录写入 TextView
    public void writeToMessageHistory(String record)
    {
        message_history = findViewById(R.id.message_history);
        message_history.append(record);
    }

}