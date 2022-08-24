package com.agora.crane.utils;

import static com.agora.crane.bean.EventBusBean.TYPE_ORDER;

import android.app.Activity;
import android.app.Application;

import com.agora.crane.bean.EventBusBean;
import com.hyphenate.EMMessageListener;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMMessage;
import com.hyphenate.chat.EMOptions;
import com.hyphenate.easeui.EaseIM;
import com.tencent.bugly.crashreport.CrashReport;

import org.greenrobot.eventbus.EventBus;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/7/22
 * @introduction
 */
public class MyApplication extends Application {

    private static MyApplication application;

    private static List<Activity> mListActivity;


    public static MyApplication getApplication() {
        return application;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        application = this;
        //bugly
        CrashReport.initCrashReport(this, "d648364cf7", Constant.DEBUG);
        //环信
        EMOptions options = new EMOptions();
        options.setAppKey("1194220730099712#agora");
        // 其他 EMOptions 配置。
        // EMClient.getInstance().init(this, options);
        EaseIM.getInstance().init(this, options);
        mListActivity = new ArrayList<>(16);
        addMessageListener();
    }

    /**
     * 把activity添加进列表，方便退出登录的时候退出
     *
     * @param mActivity 当前activity
     */
    public static void addActivity(Activity mActivity) {
        mListActivity.add(mActivity);
    }

    /**
     * 退出activity
     */
    public static void removeAllActivity() {
        for (Activity mActivity : mListActivity) {
            if (mActivity != null && !mActivity.isFinishing()) {
                mActivity.finish();
            }
        }
    }

    /**
     * 添加环信新消息监听
     */
    private void addMessageListener() {
        EMMessageListener msgListener = new EMMessageListener() {

            @Override
            public void onMessageReceived(List<EMMessage> messages) {
                //收到消息

                if (messages != null) {
                    for (EMMessage message : messages) {
                        HLog.e("收到消息：" + GsonUtil.toJson(message.getBody()));
                    }
                }
            }

            @Override
            public void onCmdMessageReceived(List<EMMessage> messages) {
                //收到透传消息
                if(messages!=null){
                    for(EMMessage message:messages){
                        HLog.e("收到透传消息：" + message.toString());
                        EventBusBean bean = new EventBusBean(TYPE_ORDER);
                        bean.setContent(message.toString());
                        EventBus.getDefault().post(bean);
                    }
                }

            }

            @Override
            public void onMessageRead(List<EMMessage> messages) {
                //收到已读回执
                HLog.e("收到已读回执：" + GsonUtil.toJson(messages));
            }

            @Override
            public void onMessageDelivered(List<EMMessage> messages) {
                //收到已送达回执
                HLog.e("收到已送达回执：" + GsonUtil.toJson(messages));
            }

            @Override
            public void onMessageRecalled(List<EMMessage> messages) {
                //消息被撤回
                HLog.e("消息被撤回：" + GsonUtil.toJson(messages));
            }

            @Override
            public void onMessageChanged(EMMessage message, Object change) {
                //消息状态变动
                HLog.e("消息状态变动：" + GsonUtil.toJson(message));
            }
        };
        EMClient.getInstance().chatManager().addMessageListener(msgListener);


    }


}
