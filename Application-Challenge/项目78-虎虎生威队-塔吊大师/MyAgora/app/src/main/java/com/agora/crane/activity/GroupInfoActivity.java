package com.agora.crane.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityGroupInfoBinding;
import com.agora.crane.utils.ToastUtil;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.easeui.constants.EaseConstant;

import org.greenrobot.eventbus.EventBus;

/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction 群详情
 */
public class GroupInfoActivity extends BaseActivity<ActivityGroupInfoBinding> {

    private String groupId;
    private String title;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String groupId) {
        Intent mIntent = new Intent(mActivity, GroupInfoActivity.class);
        mIntent.putExtra("groupId", groupId);
        mActivity.startActivity(mIntent);
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.tvGroupInfoJoin);
        groupId = getIntent().getStringExtra("groupId");
        EMClient.getInstance().groupManager().asyncGetGroupFromServer(groupId, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                runOnUiThread(() -> {
                    title = value.getGroupName();
                    mBinding.tvGroupInfoName.setText(title);
                    mBinding.tvGroupInfoOwner.setText(value.getOwner());
                    mBinding.tvGroupInfoIntroduction.setText(value.getDescription());
                });
            }

            @Override
            public void onError(int error, String errorMsg) {
                runOnUiThread(() -> ToastUtil.show(getString(R.string.get_group_info_failure)));
            }
        });
        showBackButton();
        setTitle(getString(R.string.group_info));
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
            case R.id.tv_group_info_join:
                joinGroup();
                break;
            default:
                break;
        }
    }

    /**
     * 加入群聊
     */
    private void joinGroup() {
        showLoading("");
        EMClient.getInstance().groupManager().asyncApplyJoinToGroup(groupId, "", new EMCallBack() {
            @Override
            public void onSuccess() {
                runOnUiThread(() -> {
                    hideLoading();
                    ToastUtil.show(getString(R.string.join_group_success));
                });
                EventBus.getDefault().post(new EventBusBean(EventBusBean.TYPE_JOIN_GROUP_SUCCESS));
                ChatActivity.skipActivity(mContext, groupId, EaseConstant.CHATTYPE_GROUP, title);
                finish();
            }

            @Override
            public void onError(int code, String error) {
                runOnUiThread(() -> {
                    hideLoading();
                    ToastUtil.show(getString(R.string.join_group_failure) + error);
                });
            }
        });
    }

}