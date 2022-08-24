package com.agora.crane.activity;

import static com.agora.crane.utils.UserManager.ROLE_CONSTRUCTION;
import static com.agora.crane.utils.UserManager.ROLE_OPERATOR;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.ImageView;

import androidx.appcompat.app.ActionBar;
import androidx.fragment.app.FragmentTransaction;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityChatBinding;
import com.agora.crane.popupwindow.PopupWindowTip;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.easeui.constants.EaseConstant;
import com.hyphenate.easeui.modules.chat.EaseChatFragment;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;


/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction 聊天界面
 */
public class ChatActivity extends BaseActivity<ActivityChatBinding> {

    /**
     * 会话ID
     */
    private String conversationId;
    /**
     * 会话类型
     */
    private int chatType;
    private String title;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String conversationId, int chatType, String title) {
        Intent mIntent = new Intent(mActivity, ChatActivity.class);
        mIntent.putExtra(EaseConstant.EXTRA_CONVERSATION_ID, conversationId);
        mIntent.putExtra(EaseConstant.EXTRA_CHAT_TYPE, chatType);
        mIntent.putExtra("title", title);
        mActivity.startActivity(mIntent);
    }

    private EaseChatFragment mEaseChatFragment;

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        Intent mIntent = getIntent();
        conversationId = mIntent.getStringExtra(EaseConstant.EXTRA_CONVERSATION_ID);
        chatType = mIntent.getIntExtra(EaseConstant.EXTRA_CHAT_TYPE, EaseConstant.CHATTYPE_SINGLE);
        title = mIntent.getStringExtra("title");
        mEaseChatFragment = new EaseChatFragment();
        Bundle bundle = new Bundle();
        bundle.putString(EaseConstant.EXTRA_CONVERSATION_ID, conversationId);
        bundle.putInt(EaseConstant.EXTRA_CHAT_TYPE, chatType);
        mEaseChatFragment.setArguments(bundle);
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.add(R.id.fl_chat, mEaseChatFragment);
        transaction.commit();
        showBackButton();
        setTitleBar();
        EventBus.getDefault().register(this);

    }

    /**
     * 设置标题栏内容
     */
    private void setTitleBar() {
        actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setCustomView(R.layout.title_text_group);
            actionBar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
            actionBar.setDisplayShowCustomEnabled(true);
            actionBar.setHomeButtonEnabled(true);//设置左上角的图标是否可以点击
            actionBar.setDisplayHomeAsUpEnabled(true);//给左上角图标的左边加上一个返回的图标
            tvTitle = actionBar.getCustomView().findViewById(R.id.tv_title);
            tvTitle.setText(title);
            if (EaseConstant.CHATTYPE_GROUP == chatType) {
                ImageView ivStartCall = actionBar.getCustomView().findViewById(R.id.iv_title_start_call);
                ImageView ivGroupMore = actionBar.getCustomView().findViewById(R.id.iv_title_group_more);
                ivStartCall.setVisibility(View.VISIBLE);
                ivGroupMore.setVisibility(View.VISIBLE);
                setOnClickViewList(ivStartCall, ivGroupMore);
            }
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
            case R.id.iv_title_start_call:
                String role = UserManager.getRole();
                if (role == null || role.length() == 0) {
                    showPopupUnsetRole();
                } else {
                    if (ROLE_OPERATOR.equals(role)) {
                        CallOperationActivity.skipActivity(mContext, conversationId);
                    } else if (ROLE_CONSTRUCTION.equals(role)) {
                        CallConstructionActivity.skipActivity(mContext, conversationId);
                    } else {
                        CallCameraActivity.skipActivity(mContext, conversationId);
                    }
                }
                break;
            case R.id.iv_title_group_more:
                GroupMoreActivity.skipActivity(mContext, conversationId);
                break;
            default:
                break;
        }
    }

    /**
     * 显示未设置角色对话框
     */
    private void showPopupUnsetRole() {
        WindowUtil.setBgAlpha(mContext, Constant.MASK_TRAN);
        PopupWindowTip mPopupWindowUnSetRole = new PopupWindowTip(mContext);
        mPopupWindowUnSetRole.setTip(getString(R.string.tip_un_set_role));
        mPopupWindowUnSetRole.showAtLocation(mContext.getWindow().getDecorView(), Gravity.CENTER, 0, 0);
        mPopupWindowUnSetRole.setClickListener(() -> {
            SettingRoleActivity.skipActivity(mContext);
        });
        mPopupWindowUnSetRole.setOnDismissListener(() -> WindowUtil.setBgAlpha(mContext, Constant.MASK_LIGHT));

    }

    /**
     * 监听eventBus事件
     *
     * @param bean 参数
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onMessageEvent(EventBusBean bean) {
        if (bean != null) {
            if (EventBusBean.TYPE_LEAVE_GROUP_SUCCESS == bean.getType()) {
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