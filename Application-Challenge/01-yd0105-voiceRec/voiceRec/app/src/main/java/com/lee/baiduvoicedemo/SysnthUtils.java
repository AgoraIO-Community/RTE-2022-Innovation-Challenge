package com.lee.baiduvoicedemo;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import com.baidu.tts.auth.AuthInfo;
import com.baidu.tts.client.SpeechError;
import com.baidu.tts.client.SpeechSynthesizer;
import com.baidu.tts.client.SpeechSynthesizerListener;
import com.baidu.tts.client.TtsMode;

/**
 * @类名: ${type_name}
 * @功能描述:
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class SysnthUtils {
    
    // 语音合成客户端
    private SpeechSynthesizer mSpeechSynthesizer;
    private String mSampleDirPath = Environment.getExternalStorageDirectory().getAbsolutePath();
    private static final String SPEECH_FEMALE_MODEL_NAME = "bd_etts_speech_female.dat";
    private static final String SPEECH_MALE_MODEL_NAME = "bd_etts_speech_male.dat";
    private static final String TEXT_MODEL_NAME = "bd_etts_text.dat";
    private static final String LICENSE_FILE_NAME = "temp_license.txt";
    private static final String ENGLISH_SPEECH_FEMALE_MODEL_NAME = "bd_etts_speech_female_en.dat";
    private static final String ENGLISH_SPEECH_MALE_MODEL_NAME = "bd_etts_speech_male_en.dat";
    private static final String ENGLISH_TEXT_MODEL_NAME = "bd_etts_text_en.dat";

    public SpeechSynthesizer getSpeechSynthesizer() {
        return mSpeechSynthesizer;
    }
    
    public void init(Context context){
        initialEnv(context);
    }
    
    public void setParams(Context context, int speaker, int volume, int speed, int pitch){
        startTTS(context, speaker, volume, speed, pitch);
    }


    /**
     * 初始化语音合成
     */
    private void startTTS(Context context, int speaker, int volume, int speed, int pitch) {
        
        //发音人（在线引擎），可用参数为0,1,2,3,4
        //（服务器端会动态增加，各值含义参考文档，以文档说明为准。0--普通女声，1--普通男声，2--特别男声，3--情感男声，4--情感儿童女声）
        this.mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEAKER, String.valueOf(speaker));
        this.mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_VOLUME, String.valueOf(volume));
        this.mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_SPEED, String.valueOf(speed));
        this.mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_PITCH, String.valueOf(pitch));
    }
    
    /**
     * 初始化assets中需要用到的文件
     */
    private void initialEnv(Context context) {

        CopyAssetsFile copyAssetsFile = new CopyAssetsFile();
        copyAssetsFile.copyFilesFassets(context, "assets/" + SPEECH_FEMALE_MODEL_NAME,  "voicetest/" + SPEECH_FEMALE_MODEL_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/" + SPEECH_MALE_MODEL_NAME, "voicetest/" + SPEECH_MALE_MODEL_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/" + TEXT_MODEL_NAME, "voicetest/" + TEXT_MODEL_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/" + LICENSE_FILE_NAME, "voicetest/" + LICENSE_FILE_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/english/" + ENGLISH_SPEECH_FEMALE_MODEL_NAME, "voicetest/"
                + ENGLISH_SPEECH_FEMALE_MODEL_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/english/" + ENGLISH_SPEECH_MALE_MODEL_NAME, "voicetest/"
                + ENGLISH_SPEECH_MALE_MODEL_NAME);
        copyAssetsFile.copyFilesFassets(context, "assets/english/" + ENGLISH_TEXT_MODEL_NAME, "voicetest/"
                + ENGLISH_TEXT_MODEL_NAME);

        // 获取语音合成对象实例
        mSpeechSynthesizer = SpeechSynthesizer.getInstance();
        // 设置context
        mSpeechSynthesizer.setContext(context);
        // 设置语音合成状态监听器
        mSpeechSynthesizer.setSpeechSynthesizerListener(new MyListener());
        // 设置在线语音合成授权，需要填入从百度语音官网申请的api_key和secret_key
        mSpeechSynthesizer.setApiKey("Cj0jf48NHHTD4uQpEGYVluI0", "gL7Zf4GIg2i58xLnTnAr8bXGxye9hqYs");
        // 设置离线语音合成授权，需要填入从百度语音官网申请的app_id
        mSpeechSynthesizer.setAppId("10068368");
        // 设置语音合成文本模型文件
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_TTS_TEXT_MODEL_FILE,  mSampleDirPath + "/voicetest/"
                + TEXT_MODEL_NAME);
        // 设置语音合成声音模型文件
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_TTS_SPEECH_MODEL_FILE, mSampleDirPath + "/voicetest/"  + SPEECH_FEMALE_MODEL_NAME);
        // 设置语音合成声音授权文件
        mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_TTS_LICENCE_FILE, mSampleDirPath + "/voicetest/"  + LICENSE_FILE_NAME);

        // 设置Mix模式的合成策略
        this.mSpeechSynthesizer.setParam(SpeechSynthesizer.PARAM_MIX_MODE, SpeechSynthesizer.MIX_MODE_DEFAULT);
        // 获取语音合成授权信息
        AuthInfo authInfo = mSpeechSynthesizer.auth(TtsMode.MIX);
        // 判断授权信息是否正确，如果正确则初始化语音合成器并开始语音合成，如果失败则做错误处理
        if (authInfo.isSuccess()) {
            // 引擎初始化tts接口
            mSpeechSynthesizer.initTts(TtsMode.MIX);
            //加载离线英文资源（提供离线英文合成功能）
            int result = mSpeechSynthesizer.loadEnglishModel(
                    Environment.getExternalStorageDirectory().getAbsolutePath() + "/voicetest/" + ENGLISH_TEXT_MODEL_NAME,
                    Environment.getExternalStorageDirectory().getAbsolutePath() + "/voicetest/" + ENGLISH_SPEECH_FEMALE_MODEL_NAME);
            Log.i("SynthesisActivity", ">>>loadEnglishModel result: " + result);
        } else {
            // 授权失败
            String errorMsg = authInfo.getTtsError().getDetailMessage();
            Log.i("SynthesisActivity", ">>>auth failed errorMsg: " + errorMsg);
        }
        
    }
    
    
    class MyListener implements SpeechSynthesizerListener {

        @Override
        public void onSynthesizeStart(String s) {
            
        }

        @Override
        public void onSynthesizeDataArrived(String s, byte[] bytes, int i) {

        }

        @Override
        public void onSynthesizeFinish(String s) {

        }

        @Override
        public void onSpeechStart(String s) {

        }

        @Override
        public void onSpeechProgressChanged(String s, int i) {

        }

        @Override
        public void onSpeechFinish(String s) {

        }

        @Override
        public void onError(String s, SpeechError speechError) {

        }
    }
}
//jhfghfh