package com.agora.crane.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.TextView;

import com.agora.crane.R;
import com.agora.crane.bean.EventBusBean;
import com.agora.crane.databinding.ActivityJoinGroupBinding;
import com.agora.crane.fragment.ContactFragment;
import com.agora.crane.utils.ToastUtil;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.EMValueCallBack;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.easeui.constants.EaseConstant;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;


/**
 * @Author: hyx
 * @Date: 2022/8/8
 * @introduction 加入群聊
 */
public class JoinGroupActivity extends BaseActivity<ActivityJoinGroupBinding> implements TextView.OnEditorActionListener {

    /**
     * 群ID
     */
    private String groupId;

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, JoinGroupActivity.class);
        mActivity.startActivity(mIntent);
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.ivJoinGroupClean, mBinding.tvJoinGroupCancel, mBinding.clJoinGroup);
        EventBus.getDefault().register(this);
        showBackButton();
        setTitle(getString(R.string.join_group));
    }

    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.etJoinGroup.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable != null && editable.length() > 0) {
                    mBinding.ivJoinGroupClean.setVisibility(View.VISIBLE);
                } else {
                    mBinding.ivJoinGroupClean.setVisibility(View.GONE);
                }
            }
        });
        mBinding.etJoinGroup.setOnEditorActionListener(this);

    }


    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.iv_add_friend_clean:
                mBinding.etJoinGroup.setText("");
                break;
            case R.id.tv_join_group_cancel:
                finish();
                break;
            case R.id.cl_join_group:
                clickGroup();
                break;
            default:
                break;
        }
    }

    /**
     * 点击群组
     */
    private void clickGroup() {
        if (ContactFragment.mListEMGroup != null && ContactFragment.mListEMGroup.size() > 0) {
            boolean join = false;
            for (EMGroup group : ContactFragment.mListEMGroup) {
                if (group.getGroupId().equals(groupId)) {
                    ChatActivity.skipActivity(mContext, groupId, EaseConstant.CHATTYPE_GROUP, group.getGroupName());
                    join = true;
                    break;
                }
            }
            if (!join) {
                GroupInfoActivity.skipActivity(mContext, groupId);
            }
        } else {
            GroupInfoActivity.skipActivity(mContext, groupId);
        }
    }

    /**
     * 监听搜索按钮
     */
    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
        if (actionId == EditorInfo.IME_ACTION_SEARCH) {
            searchGroup();
            return true;
        }
        return false;
    }

    /**
     * 监听eventBus事件
     *
     * @param bean 参数
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onMessageEvent(EventBusBean bean) {
        if (bean != null) {
            if (EventBusBean.TYPE_JOIN_GROUP_SUCCESS == bean.getType()) {
                //接收到加入群聊成功，则退出此界面
                finish();
            }
        }
    }

    /**
     * 搜索群
     */
    private void searchGroup() {
        groupId = mBinding.etJoinGroup.getText().toString();
        if (groupId.length() == 0) {
            return;
        }
        EMClient.getInstance().groupManager().asyncGetGroupFromServer(groupId, new EMValueCallBack<EMGroup>() {
            @Override
            public void onSuccess(EMGroup value) {
                runOnUiThread(() -> {
                    mBinding.clJoinGroup.setVisibility(View.VISIBLE);
                    mBinding.tvJoinGroupName.setText(value.getGroupName());
                    WindowUtil.hideBoard(mContext);
                });
            }

            @Override
            public void onError(int error, String errorMsg) {
                runOnUiThread(() -> {
                    ToastUtil.show(errorMsg);
                    mBinding.clJoinGroup.setVisibility(View.GONE);
                });
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
    }
}