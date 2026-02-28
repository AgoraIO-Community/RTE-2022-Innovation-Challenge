package com.lee.baiduvoicedemo;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Environment;
import android.os.IBinder;
import android.util.AndroidRuntimeException;
import android.util.Log;
import android.widget.Toast;

import com.baidu.speech.EventListener;
import com.baidu.speech.EventManager;
import com.baidu.speech.EventManagerFactory;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

/**
 * @类名: ${type_name}
 * @功能描述:   位置经纬度信息和极光推送设备ID
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class VoiceService extends Service {


    private EventManager mWpEventManager;

    @Override
    public void onCreate() {

        super.onCreate();
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        if (intent == null) {
            stopSelf();
            return Service.START_NOT_STICKY;
        }
        final boolean isExit = intent.getBooleanExtra("exit", false);
        if (isExit) {
            stopSelf();
        }

        wakeUp();
        
        return Service.START_NOT_STICKY;

    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }


    /**
     * <br/> 方法名称:startService
     * <br/> 方法详述:启动时间服务
     * <br/> 参数:
     * <br/>&nbsp;&nbsp;&nbsp;&nbsp;mContext:上下文依赖
     * <br/>&nbsp;&nbsp;&nbsp;&nbsp;isExit:
     * <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;true:停止当前服务
     * <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;false:启动当前服务
     */
    public static void startService(Context mContext, boolean isExit) {
        Intent gpsIntent = new Intent();
        gpsIntent.setAction("com.lee.baiduvoicedemo.voiceservice");
        gpsIntent.putExtra("exit", isExit);
        //        gpsIntent.setPackage(mContext.getPackageName());
        Intent eintent = new Intent(IntentUtils.getExplicitIntent(mContext, gpsIntent));
        mContext.startService(eintent);
        Log.e("Location", "bindGPSService");
    }



    public void wakeUp(){
        // 唤醒功能打开步骤
        // 1) 创建唤醒事件管理器
        mWpEventManager = EventManagerFactory.create(getApplicationContext(), "wp");

        // 2) 注册唤醒事件监听器
        mWpEventManager.registerListener(new EventListener() {
            @Override
            public void onEvent(String name, String params, byte[] data, int offset, int length) {
                try {
                    JSONObject json = new JSONObject(params);
                    if ("wp.data".equals(name)) { // 每次唤醒成功, 将会回调name=wp.data的时间, 被激活的唤醒词在params的word字段
                        String word = json.getString("word");
                        if ("百度一下".equals(word)){
                            Intent intent = new Intent(getApplication(), WakeSystemActivity.class);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            getApplication().startActivity(intent);
                        }
                    } else if ("wp.exit".equals(name)) {
                        
                    }
                } catch (JSONException e) {
                    throw new AndroidRuntimeException(e);
                }
            }
        });

        // 3) 通知唤醒管理器, 启动唤醒功能
        HashMap params = new HashMap();
        params.put("kws-file", Environment.getExternalStorageDirectory().getAbsolutePath()+"/voicetest/WakeUp.bin");
        // 设置唤醒资源,唤醒资源请到 http://yuyin.baidu.com/wake#m4 来评估和导出
        String s = new JSONObject(params).toString();
        mWpEventManager.send("wp.start", new JSONObject(params).toString(), null, 0, 0);


    }
}
//jhfghfh