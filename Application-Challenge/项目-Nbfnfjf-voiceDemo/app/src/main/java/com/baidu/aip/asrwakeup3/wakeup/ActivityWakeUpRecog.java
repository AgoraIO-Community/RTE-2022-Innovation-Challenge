package com.baidu.aip.asrwakeup3.wakeup;

import android.os.Bundle;
import android.os.Message;
import com.baidu.aip.asrwakeup3.R;
import com.baidu.aip.asrwakeup3.core.recog.IStatus;
import com.baidu.aip.asrwakeup3.core.recog.MyRecognizer;
import com.baidu.aip.asrwakeup3.core.recog.listener.IRecogListener;
import com.baidu.aip.asrwakeup3.core.recog.listener.MessageStatusRecogListener;
import com.baidu.aip.asrwakeup3.core.wakeup.IWakeupListener;
import com.baidu.aip.asrwakeup3.core.wakeup.RecogWakeupListener;
import com.baidu.speech.asr.SpeechConstant;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 唤醒后识别 本例可与ActivityWakeUp 对比作为集成识别代码的参考
 */
public class ActivityWakeUpRecog extends ActivityWakeUp implements IStatus {


    private static final String TAG = "ActivityWakeUpRecog";

    /**
     * 识别控制器，使用MyRecognizer控制识别的流程
     */
    protected MyRecognizer myRecognizer;

    /**
     * 0: 方案1， backTrackInMs > 0,唤醒词说完后，直接接句子，中间没有停顿。
     *              开启回溯，连同唤醒词一起整句识别。推荐4个字 1500ms
     *          backTrackInMs 最大 15000，即15s
     *
     * >0 : 方案2：backTrackInMs = 0，唤醒词说完后，中间有停顿。
     *       不开启回溯。唤醒词识别回调后，正常开启识别。
     * <p>
     *
     */
    private int backTrackInMs = 1500;

    public ActivityWakeUpRecog() {
        super(R.raw.recog_wakeup);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        IRecogListener recogListener = new MessageStatusRecogListener(handler);
        // 改为 SimpleWakeupListener 后，不依赖handler，但将不会在UI界面上显示
        myRecognizer = new MyRecognizer(this, recogListener);

        IWakeupListener listener = new RecogWakeupListener(handler);
        myWakeup.setEventListener(listener); // 替换原来的 listener

    }

    @Override
    protected void handleMsg(Message msg) {
        super.handleMsg(msg);
        if (msg.what == STATUS_WAKEUP_SUCCESS) { // 唤醒词识别成功的回调，见RecogWakeupListener
            // 此处 开始正常识别流程
            Map<String, Object> params = new LinkedHashMap<String, Object>();
            params.put(SpeechConstant.ACCEPT_AUDIO_VOLUME, false);
            params.put(SpeechConstant.VAD, SpeechConstant.VAD_DNN);
            // 如识别短句，不需要需要逗号，使用1536搜索模型。其它PID参数请看文档
            params.put(SpeechConstant.PID, 1536);
            if (backTrackInMs > 0) {
                // 方案1  唤醒词说完后，直接接句子，中间没有停顿。开启回溯，连同唤醒词一起整句识别。
                // System.currentTimeMillis() - backTrackInMs ,  表示识别从backTrackInMs毫秒前开始
                params.put(SpeechConstant.AUDIO_MILLS, System.currentTimeMillis() - backTrackInMs);
            }
            myRecognizer.cancel();
            myRecognizer.start(params);
        }
    }

    @Override
    protected void stop() {
        super.stop();
        myRecognizer.stop();
    }

    @Override
    protected void onDestroy() {
        myRecognizer.release();
        super.onDestroy();
    }
}
