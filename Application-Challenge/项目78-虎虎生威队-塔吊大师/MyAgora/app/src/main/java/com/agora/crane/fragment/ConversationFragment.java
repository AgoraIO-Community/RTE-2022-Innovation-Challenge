package com.agora.crane.fragment;

import android.os.Bundle;
import android.view.View;

import androidx.fragment.app.FragmentTransaction;

import com.agora.crane.R;
import com.agora.crane.databinding.FragmentConversationBinding;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 会话
 */
public class ConversationFragment extends BaseFragment<FragmentConversationBinding> {

    private BaseConversationFragment mBaseConversationFragment;

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        mBaseConversationFragment = new BaseConversationFragment();
        FragmentTransaction transaction = getActivity().getSupportFragmentManager().beginTransaction();
        transaction.add(R.id.fl_conversation, mBaseConversationFragment);
        transaction.commit();

    }


    /**
     * 点击事件
     *
     * @param view 点击的控件
     */
    @Override
    public void onClick(View view) {

    }


}
