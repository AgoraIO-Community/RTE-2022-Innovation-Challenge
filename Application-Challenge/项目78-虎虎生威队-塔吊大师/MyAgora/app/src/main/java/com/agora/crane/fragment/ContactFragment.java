package com.agora.crane.fragment;


import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.agora.crane.R;
import com.agora.crane.activity.ChatActivity;
import com.agora.crane.adapter.FriendAdapter;
import com.agora.crane.adapter.GroupAdapter;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.FragmentContactBinding;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.easeui.constants.EaseConstant;
import com.hyphenate.exceptions.HyphenateException;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 通讯录
 */
public class ContactFragment extends BaseFragment<FragmentContactBinding> {


    private FriendAdapter mFriendAdapter;
    private GroupAdapter mGroupAdapter;
    private List<String> mListFriend;
    public static List<EMGroup> mListEMGroup;

    Handler friendHandler = new Handler(Looper.myLooper()) {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            mFriendAdapter = new FriendAdapter(mListFriend);
            mBinding.rvFriend.setLayoutManager(new LinearLayoutManager(mContext));
            mBinding.rvFriend.setAdapter(mFriendAdapter);
            mFriendAdapter.setOnItemClickListener((adapter, view, position) -> {
                ChatActivity.skipActivity(mContext, mListFriend.get(position), EaseConstant.CHATTYPE_SINGLE, mListFriend.get(position));
            });
        }
    };

    Handler groupHandler = new Handler(Looper.myLooper()) {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            mGroupAdapter = new GroupAdapter(mListEMGroup);
            mBinding.rvGroup.setLayoutManager(new LinearLayoutManager(mContext));
            mBinding.rvGroup.setAdapter(mGroupAdapter);
            mGroupAdapter.setOnItemClickListener((adapter, view, position) -> {
                ChatActivity.skipActivity(mContext, mListEMGroup.get(position).getGroupId(), EaseConstant.CHATTYPE_GROUP, mListEMGroup.get(position).getGroupName());
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
        setOnClickViewList(mBinding.tvFriend, mBinding.tvGroup);
        new Thread(() -> {
            getFriend();
            getGroup();
        }).start();
        EventBus.getDefault().register(this);
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
     * 从服务器获取群组列表。
     */
    private void getGroup() {
        try {
            mListEMGroup = EMClient.getInstance().groupManager().getJoinedGroupsFromServer();
            if (mListEMGroup != null) {
                groupHandler.sendEmptyMessage(0);
            }
        } catch (HyphenateException e) {
            e.printStackTrace();
        }
    }

    /**
     * 点击事件
     *
     * @param view 点击的控件
     */
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.tv_group:
                onClickGroup();
                break;
            case R.id.tv_friend:
                onClickFriend();
                break;
            default:
                break;
        }
    }

    /**
     * 展开/关闭群列表
     */
    private void onClickGroup() {
        if (View.VISIBLE == mBinding.rvGroup.getVisibility()) {
            mBinding.rvGroup.setVisibility(View.GONE);
            ObjectAnimator animator = ObjectAnimator.ofFloat(mBinding.ivGroupRight, "rotation", 90f, 0f);
            animator.setDuration(300);
            animator.start();
        } else {
            mBinding.rvGroup.setVisibility(View.VISIBLE);
            ObjectAnimator animator = ObjectAnimator.ofFloat(mBinding.ivGroupRight, "rotation", 0f, 90f);
            animator.setDuration(300);
            animator.start();
        }
    }

    /**
     * 展开/关闭好友列表
     */
    private void onClickFriend() {
        if (View.VISIBLE == mBinding.rvFriend.getVisibility()) {
            mBinding.rvFriend.setVisibility(View.GONE);
            ObjectAnimator animator = ObjectAnimator.ofFloat(mBinding.ivFriendRight, "rotation", 90f, 0f);
            animator.setDuration(300);
            animator.start();
        } else {
            mBinding.rvFriend.setVisibility(View.VISIBLE);
            ObjectAnimator animator = ObjectAnimator.ofFloat(mBinding.ivFriendRight, "rotation", 0f, 90f);
            animator.setDuration(300);
            animator.start();
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
            switch (bean.getType()) {
                //接收到创建群聊成功，则此刷新群组列表
                case EventBusBean.TYPE_CREATE_GROUP_SUCCESS:
                    //接收到加入群聊成功，则此刷新群组列表
                case EventBusBean.TYPE_JOIN_GROUP_SUCCESS:
                    //接收到退出/解散群聊成功，则此刷新群组列表
                case EventBusBean.TYPE_LEAVE_GROUP_SUCCESS:
                    new Thread(() -> {
                        getGroup();
                    }).start();
                    break;
                case EventBusBean.TYPE_ADD_FRIEND_SUCCESS:
                    new Thread(() -> {
                        getFriend();
                    }).start();
                    break;
            }
        }
    }

    /**
     * 界面销毁
     */
    @Override
    public void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
    }
}
