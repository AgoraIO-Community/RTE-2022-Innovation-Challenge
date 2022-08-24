package com.agora.crane.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.agora.crane.R;
import com.agora.crane.adapter.CreateGroupAdapter;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityCreateGroupBinding;
import com.agora.crane.utils.ToastUtil;
import com.hyphenate.chat.EMClient;
import com.hyphenate.exceptions.HyphenateException;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/8/8
 * @introduction 创建群
 */
public class CreateGroupActivity extends BaseActivity<ActivityCreateGroupBinding> {


    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, CreateGroupActivity.class);
        mActivity.startActivity(mIntent);
    }

    private CreateGroupAdapter mAdapter;
    private List<String> mListFriend;

    Handler friendHandler = new Handler(Looper.myLooper()) {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            mAdapter = new CreateGroupAdapter(mListFriend);
            mBinding.rvCreateGroup.setLayoutManager(new LinearLayoutManager(mContext));
            mBinding.rvCreateGroup.setAdapter(mAdapter);
            mAdapter.setOnItemClickListener((adapter, view, position) -> {
                mAdapter.setClick(position);
            });
        }
    };


    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        new Thread(() -> {
            getFriend();
        }).start();
        EventBus.getDefault().register(this);
        actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setCustomView(R.layout.title_text_finish);
            actionBar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
            actionBar.setDisplayShowCustomEnabled(true);
            actionBar.setHomeButtonEnabled(true);//设置左上角的图标是否可以点击
            actionBar.setDisplayHomeAsUpEnabled(true);//给左上角图标的左边加上一个返回的图标
            tvTitle = actionBar.getCustomView().findViewById(R.id.tv_title);
            tvTitle.setText(R.string.create_group);
            TextView tvFinish = actionBar.getCustomView().findViewById(R.id.tv_title_finish);
            setOnClickViewList(tvFinish);
        }

    }


    /**
     * 点击事件
     *
     * @param view 点击的控件
     */
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv_title_finish:
                ArrayList<String> mList = mAdapter.getSelected();
                if (mList == null || mList.size() == 0) {
                    ToastUtil.show(getString(R.string.no_friends_selected));
                    return;
                }
                CreateGroupInfoActivity.skipActivity(mContext, mList);
                break;
        }
    }

    /**
     * 从服务器获取好友列表。
     */
    private void getFriend() {
        try {
            mListFriend = EMClient.getInstance().contactManager().getAllContactsFromServer();
            if (mListFriend != null && mListFriend.size() > 0) {
                friendHandler.sendEmptyMessage(0);
            }
        } catch (HyphenateException e) {
            e.printStackTrace();
        }
    }

    /**
     * 监听eventBus事件
     *
     * @param bean 参数
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onMessageEvent(EventBusBean bean) {
        if (bean != null) {
            if (EventBusBean.TYPE_CREATE_GROUP_SUCCESS == bean.getType()) {
                //接收到创建群聊成功，则此界面销毁
                finish();
            }
        }
    }

    /**
     * 界面销毁
     */
    @Override
    protected void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
    }
}