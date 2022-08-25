package com.lee.baiduvoicedemo;

import android.Manifest;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.view.View;
import android.widget.TextView;

import com.baidu.tts.client.SpeechSynthesizer;

import java.util.ArrayList;

/**
 * @类名: ${type_name}
 * @功能描述:
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class WakeSystemActivity extends Activity {

    // 语音合成客户端
    private SpeechSynthesizer mSpeechSynthesizer;
    private SysnthUtils utils;

    private TextView content;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.a);

        content = (TextView) findViewById(R.id.content);

        utils = new SysnthUtils();

        OnLoadData loadData = new OnLoadData();
        loadData.execute();

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
                p_dialog = ProgressDialog.show(WakeSystemActivity.this, "请等待", "正在准备数据...", true);
            }
        }

        // 后台执行获取数据操作
        @Override
        protected Integer doInBackground(String... params) {

            utils.init(WakeSystemActivity.this);
            utils.setParams(WakeSystemActivity.this, 0, 5, 5, 5);
            mSpeechSynthesizer = utils.getSpeechSynthesizer();
            WakeSystemActivity.this.mSpeechSynthesizer.speak("有什么能为你服务的吗");
            return 0;

        }

        @Override
        protected void onPostExecute(Integer i) {
            // 线程执行完毕 绑定数据
            super.onPostExecute(i);

            p_dialog.dismiss();


            Intent intent = new Intent("com.baidu.action.RECOGNIZE_SPEECH");
            intent.putExtra("grammar", "asset:///baidu_speech_grammar.bsg"); // 设置离线的授权文件(离线模块需要授权), 该语法可以用自定义语义工具生成, 链接http://yuyin.baidu.com/asr#m5
            //intent.putExtra("slot-data", your slots); // 设置grammar中需要覆盖的词条,如联系人名
            startActivityForResult(intent, 1);
        }
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            Bundle results = data.getExtras();
            ArrayList<String> results_recognition = results.getStringArrayList("results_recognition");
            content.append(results_recognition + "");
            String string = content.getText().toString().trim();
            
        }
    }
    
}
//jhfghfh