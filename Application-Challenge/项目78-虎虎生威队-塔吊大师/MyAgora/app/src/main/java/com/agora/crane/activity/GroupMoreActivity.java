package com.agora.crane.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityGroupMoreBinding;
import com.agora.crane.popupwindow.PopupWindowTip;
import com.agora.crane.utils.Constant;
import com.agora.crane.utils.HLog;
import com.agora.crane.utils.ToastUtil;
import com.agora.crane.utils.UserManager;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.EMCallBack;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;

import org.greenrobot.eventbus.EventBus;

/**
 * @Author: hyx
 * @Date: 2022/8/20
 * @introduction 群信息
 */

public class GroupMoreActivity extends BaseActivity<ActivityGroupMoreBinding> {

    private String groupId;
    /**
     * true:我是群主  false:我是群成员
     */
    private boolean isOwner;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity, String groupId) {
        Intent mIntent = new Intent(mActivity, GroupMoreActivity.class);
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
        setOnClickViewList(mBinding.tvGroupMoreExitGroup, mBinding.tvGroupMoreIdCopy);
        groupId = getIntent().getStringExtra("groupId");
        EMClient.getInstance().groupManager().asyncGetGroupFromServer(groupId, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                runOnUiThread(() -> {
                    setGroupInfo(value);
                });
            }

            @Override
            public void onError(int error, String errorMsg) {
                runOnUiThread(() -> ToastUtil.show(getString(R.string.get_group_info_failure)));
            }
        });
        showBackButton();
        setTitle(getString(R.string.group_more));
    }


    /**
     * 设置群信息
     *
     * @param value 信息实体
     */
    private void setGroupInfo(EMGroup value) {
        String groupName = value.getGroupName();
        String owner = value.getOwner();
        isOwner = UserManager.getUserName().equals(owner);
        mBinding.tvGroupMoreOwner.setText(owner);
        mBinding.tvGroupMoreIntroduction.setText(value.getDescription());
        mBinding.tvGroupMoreName.setText(groupName);
        mBinding.tvGroupMoreId.setText(groupId);
        if (isOwner) {
            mBinding.tvGroupMoreExitGroup.setText(getString(R.string.destroy_group));
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
            case R.id.tv_group_more_exit_group:
                showPopupExitGroup();
                break;
            case R.id.tv_group_more_id_copy:
                ClipboardManager manager = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData mClipData = ClipData.newPlainText("Label", groupId);
                manager.setPrimaryClip(mClipData);
                break;
            default:
                break;
        }
    }

    /**
     * 显示退出群组
     */
    private void showPopupExitGroup() {
        String tipContent = isOwner ? getString(R.string.tip_destroy_group) : getString(R.string.tip_exit_group);
        WindowUtil.setBgAlpha(mContext, Constant.MASK_TRAN);
        PopupWindowTip mPopupWindowTip = new PopupWindowTip(mContext);
        mPopupWindowTip.setTip(tipContent);
        mPopupWindowTip.showAtLocation(mContext.getWindow().getDecorView(), Gravity.CENTER, 0, 0);
        mPopupWindowTip.setClickListener(() -> exitGroup());
        mPopupWindowTip.setOnDismissListener(() -> WindowUtil.setBgAlpha(mContext, Constant.MASK_LIGHT));
    }

    /**
     * 退出群聊
     */
    private void exitGroup() {
        showLoading("");
        if (isOwner) {
            EMClient.getInstance().groupManager().asyncDestroyGroup(groupId, new EMCallBack() {
                @Override
                public void onSuccess() {
                    leaveGroupSuccess(getString(R.string.destroy_group_success));
                }

                @Override
                public void onError(int code, String error) {
                    leaveGroupFailure(getString(R.string.destroy_group_failure));
                }
            });
        } else {
            EMClient.getInstance().groupManager().asyncLeaveGroup(groupId, new EMCallBack() {
                @Override
                public void onSuccess() {
                    HLog.e("退出群聊成功");
                    leaveGroupSuccess(getString(R.string.exit_group_success));
                }

                @Override
                public void onError(int code, String error) {
                    leaveGroupFailure(getString(R.string.exit_group_failure));
                }
            });
        }
    }

    /**
     * 退出/解散群聊成功
     */
    private void leaveGroupSuccess(String tip) {
        runOnUiThread(() -> {
            hideLoading();
            EventBus.getDefault().post(new EventBusBean(EventBusBean.TYPE_LEAVE_GROUP_SUCCESS));
            ToastUtil.show(tip);
            finish();
        });
    }

    /**
     * 退出/解散群聊失败
     */
    private void leaveGroupFailure(String tip) {
        runOnUiThread(() -> {
            hideLoading();
            ToastUtil.show(tip);
        });
    }
}