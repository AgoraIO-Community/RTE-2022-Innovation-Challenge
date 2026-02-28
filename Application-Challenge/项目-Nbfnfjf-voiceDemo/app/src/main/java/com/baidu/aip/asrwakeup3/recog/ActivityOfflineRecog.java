package com.baidu.aip.asrwakeup3.recog;

import com.baidu.aip.asrwakeup3.R;

/**
 * 在线识别，用于展示在线情况下的识别参数和效果。
 * <p>
 * 本类可以忽略 看下ActivityAbstractRecog
 */
public class ActivityOfflineRecog extends ActivityAbstractRecog {

    public ActivityOfflineRecog() {
        super(R.raw.offline_recog, true);
        // uiasr\src\main\res\raw\offline_recog.txt 本Activity使用的说明文件
        // true 表示activity支持离线
    }


}