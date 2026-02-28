package com.baidu.aip.asrwakeup3.recog;

import com.baidu.aip.asrwakeup3.R;

/**
 * 展示语义功能
 * 本类可以忽略
 */

public class ActivityNlu extends ActivityAbstractRecog {


    public ActivityNlu() {
        super(R.raw.offline_recog, true);
        // uiasr\src\main\res\raw\nlu_recog.txt 本Activity使用的说明文件
        // true 表示activity支持离线
    }


}
