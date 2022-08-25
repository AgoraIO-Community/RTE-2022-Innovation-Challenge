package com.lee.baiduvoicedemo;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.baidu.tts.client.SpeechSynthesizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SynthesisActivity extends Activity{

    private EditText content;
    // 语音合成客户端
    private SpeechSynthesizer mSpeechSynthesizer;
    private SysnthUtils utils;
    
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.synthesis);
        
        utils=new SysnthUtils();
        
        OnLoadData loadData = new OnLoadData();
        loadData.execute();
        
        content = (EditText) findViewById(R.id.edt_content);
        
        findViewById(R.id.setting).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(SynthesisActivity.this, SynthSetting.class));
            }
        });
        findViewById(R.id.hecheng).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                utils.setParams(SynthesisActivity.this, Constant.speaker, Constant.volume, Constant.speed, Constant.pitch);
                mSpeechSynthesizer=utils.getSpeechSynthesizer();
                String text = SynthesisActivity.this.content.getText().toString();
                //需要合成的文本text的长度不能超过1024个GBK字节。
                if (TextUtils.isEmpty(content.getText())) {
                    text = "你想让我读什么呢";
                    content.setText(text);
                }
                SynthesisActivity.this.mSpeechSynthesizer.speak(text);
            }
        });
    }
   
    @Override
    protected void onDestroy() {
        this.mSpeechSynthesizer.release();//释放资源
        super.onDestroy();
    }

    /**
     * @author xxy
     */
    class OnLoadData extends AsyncTask<String, Integer, Integer> {

        ProgressDialog p_dialog;

        @Override
        protected void onPreExecute() {
            if (p_dialog == null) {
                p_dialog = ProgressDialog.show(SynthesisActivity.this, "请等待",
                        "正在准备数据...", true);
            }
        }

        // 后台执行获取数据操作
        @Override
        protected Integer doInBackground(String... params) {

            utils.init(SynthesisActivity.this);
            return 0;

        }

        @Override
        protected void onPostExecute(Integer i) {
            // 线程执行完毕 绑定数据
            super.onPostExecute(i);

            p_dialog.dismiss();

        }
    }
}

