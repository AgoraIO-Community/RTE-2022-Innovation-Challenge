package com.qingkouwei.handyinstruction.section.base;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import com.hyphenate.easecallkit.EaseCallKit;
import com.hyphenate.easecallkit.base.EaseCallFloatWindow;
import com.hyphenate.easecallkit.base.EaseCallType;
import com.hyphenate.easecallkit.utils.EaseCallState;
import com.qingkouwei.handyinstruction.section.av.MultipleVideoActivity;
import com.qingkouwei.handyinstruction.section.av.VideoCallActivity;

import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

public abstract class BaseInitActivity extends BaseActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(getLayoutId());
        initSystemFit();
        initIntent(getIntent());
        initView(savedInstanceState);
        initListener();
        initData();
    }

    protected void initSystemFit() {
        setFitSystemForTheme(true);
    }

    /**
     * get layout id
     * @return
     */
    protected abstract int getLayoutId();

    /**
     * init intent
     * @param intent
     */
    protected void initIntent(Intent intent) { }

    /**
     * init view
     * @param savedInstanceState
     */
    protected void initView(Bundle savedInstanceState) {

    }

    /**
     * init listener
     */
    protected void initListener() { }

    /**
     * init data
     */
    protected void initData() { }


    @Override
    protected void onRestart(){
        super.onRestart();
        if(EaseCallKit.getInstance().getCallState() != EaseCallState.CALL_IDLE && !EaseCallFloatWindow.getInstance(mContext).isShowing()){
            if(EaseCallKit.getInstance().getCallType() == EaseCallType.CONFERENCE_CALL){
                Intent intent = new Intent(mContext, MultipleVideoActivity.class).addFlags(FLAG_ACTIVITY_NEW_TASK);
                mContext.startActivity(intent);
            }else{
                Intent intent = new Intent(mContext, VideoCallActivity.class).addFlags(FLAG_ACTIVITY_NEW_TASK);
                mContext.startActivity(intent);
            }
        }
    }
}
