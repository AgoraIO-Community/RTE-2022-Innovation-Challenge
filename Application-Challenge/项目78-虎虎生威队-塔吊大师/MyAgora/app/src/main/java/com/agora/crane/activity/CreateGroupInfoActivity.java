package com.agora.crane.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.ActionBar;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityCreateGroupInfoBinding;
import com.agora.crane.utils.ToastUtil;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.chat.EMGroupManager;
import com.hyphenate.chat.EMGroupOptions;

import org.greenrobot.eventbus.EventBus;

import java.util.ArrayList;
import java.util.List;


/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction 创建群完善信息
 */

public class CreateGroupInfoActivity extends BaseActivity<ActivityCreateGroupInfoBinding> {

    private List<String> mList;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, ArrayList<String> mList) {
        Intent mIntent = new Intent(mActivity, CreateGroupInfoActivity.class);
        mIntent.putStringArrayListExtra("list", mList);
        mActivity.startActivity(mIntent);
    }


    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        mList = getIntent().getStringArrayListExtra("list");
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
                createGroup();
                break;
        }
    }


    /**
     * 创建群聊
     */
    private void createGroup() {
        String groupName = mBinding.etCreateGroupInfoName.getText().toString();
        String introduction = mBinding.etCreateGroupInfoIntroduction.getText().toString();
        if (groupName.length() == 0) {
            ToastUtil.show(getString(R.string.input_group_name));
            return;
        }
        EMGroupOptions option = new EMGroupOptions();
        option.maxUsers = 200;
        option.style = EMGroupManager.EMGroupStyle.EMGroupStylePublicOpenJoin;
        option.inviteNeedConfirm = false;
        String[] arrUser = mList.toArray(new String[mList.size()]);
        showLoading("");
        EMClient.getInstance().groupManager().asyncCreateGroup(groupName, introduction, arrUser, "", option, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                hideLoading();
                EventBus.getDefault().post(new EventBusBean(EventBusBean.TYPE_CREATE_GROUP_SUCCESS));
                runOnUiThread(() -> {
                    ToastUtil.show(getString(R.string.create_group_success));
                });
                finish();
            }

            @Override
            public void onError(int error, String errorMsg) {
                hideLoading();
                runOnUiThread(() -> ToastUtil.show(getString(R.string.create_group_failure) + errorMsg));
            }
        });
    }

}