package com.lee.baiduvoicedemo;

import android.app.Application;
import android.content.Intent;

/**
 * @类名: ${type_name}
 * @功能描述:
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class MyApplication extends Application {
    
    public static MyApplication mMyApplication;

    @Override
    public void onCreate() {
        super.onCreate();
        mMyApplication = this;
        
        
        VoiceService.startService(this, false);
    }
}
//jhfghfh