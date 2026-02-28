package com.baidu.aip.asrwakeup3.recog;


import com.baidu.aip.asrwakeup3.R;

public class ActivityAllRecog extends ActivityAbstractRecog {

    public ActivityAllRecog() {
        super(R.raw.all_recog, true);
        // uiasr\src\main\res\raw\all_recog.txt 本Activity使用的说明文件
        // true 表示activity支持离线
    }


}
