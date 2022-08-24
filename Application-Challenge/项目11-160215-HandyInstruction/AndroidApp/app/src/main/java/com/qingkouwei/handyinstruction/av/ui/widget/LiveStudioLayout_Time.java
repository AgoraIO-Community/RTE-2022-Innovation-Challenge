package com.qingkouwei.handyinstruction.av.ui.widget;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.Message;
import android.util.AttributeSet;
import android.view.Gravity;
import android.widget.FrameLayout;
import android.widget.TextView;
import com.hyphenate.util.DensityUtil;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.av.util.TimeUtils;

public class LiveStudioLayout_Time extends FrameLayout {

  private static final int WHAT_UPDATE_TIME = 1;
  private static final int DELAY_UPDATE_TIME = 500;

  private long startTime;
  private TextView mTimeView;
  private long lastSendHeartbeatTime = 0;

  public LiveStudioLayout_Time(Context context) {
    super(context);
    init(context);
  }

  public LiveStudioLayout_Time(Context context, AttributeSet attrs) {
    super(context, attrs);
    init(context);
  }

  public LiveStudioLayout_Time(Context context, AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    init(context);
  }

  @SuppressLint("SimpleDateFormat")
  private void init(Context context) {
    mTimeView = new TextView(context);
    mTimeView.setMinHeight(DensityUtil.dip2px(context, 24));
    mTimeView.setMinWidth(DensityUtil.dip2px(context, 72));
    mTimeView.setGravity(Gravity.CENTER);
    mTimeView.setTextColor(Color.BLACK);
    mTimeView.setTextSize(12);
    mTimeView.setIncludeFontPadding(false);
    mTimeView.setBackgroundResource(R.drawable.bg_live_time_bg);

    addView(mTimeView);
    setPadding(0, 0, DensityUtil.dip2px(context, 8), 0);
  }

  public void start() {
    startTime = System.currentTimeMillis();
    handler.sendEmptyMessage(WHAT_UPDATE_TIME);
  }

  private void updateTimeView(long time) {
    mTimeView.setText(TimeUtils.formatSecond(time / 1000));
  }

  private void sendHeartbeat() {
    //TODO
  }

  private Handler handler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      if (msg.what == WHAT_UPDATE_TIME) {
        long currentTime = System.currentTimeMillis();
        long time = currentTime - startTime;
        if (lastSendHeartbeatTime == 0) {
          sendHeartbeat();
          lastSendHeartbeatTime = currentTime;
        }
        if (currentTime - lastSendHeartbeatTime >= 60000) {
          sendHeartbeat();
          lastSendHeartbeatTime = currentTime;
        }
        updateTimeView(time);
        handler.sendEmptyMessageDelayed(WHAT_UPDATE_TIME, DELAY_UPDATE_TIME);
      }
    }
  };

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    if (startTime > 0) {
      handler.sendEmptyMessage(WHAT_UPDATE_TIME);
    }
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    handler.removeMessages(WHAT_UPDATE_TIME);
  }
}
