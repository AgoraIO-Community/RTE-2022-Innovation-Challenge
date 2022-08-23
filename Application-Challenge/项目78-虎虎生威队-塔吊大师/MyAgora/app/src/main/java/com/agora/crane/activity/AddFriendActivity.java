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
import com.agora.crane.databinding.ActivityAddFriendBinding;
import com.agora.crane.utils.ToastUtil;
import com.agora.crane.utils.WindowUtil;
import com.hyphenate.EMCallBack;
import com.hyphenate.chat.EMClient;

import org.greenrobot.eventbus.EventBus;


/**
 * @Author: hyx
 * @Date: 2022/8/8
 * @introduction 添加好友
 */
public class AddFriendActivity extends BaseActivity<ActivityAddFriendBinding> implements TextView.OnEditorActionListener {

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, AddFriendActivity.class);
        mActivity.startActivity(mIntent);
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.ivAddFriendClean, mBinding.tvAddFriendAdd,mBinding.tvAddFriendCancel);
        showBackButton();
        setTitle(getString(R.string.add_friend));
    }


    /**
     * 设置监听
     */
    @Override
    protected void setListener() {
        super.setListener();
        mBinding.etAddFriend.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {

            }

            @Override
            public void afterTextChanged(Editable editable) {
                if (editable != null && editable.length() > 0) {
                    mBinding.ivAddFriendClean.setVisibility(View.VISIBLE);
                } else {
                    mBinding.ivAddFriendClean.setVisibility(View.GONE);
                }
            }
        });
        mBinding.etAddFriend.setOnEditorActionListener(this);
    }

    /**
     * 点击事件
     * @param view  点击的控件
     */
    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.iv_add_friend_clean:
                mBinding.etAddFriend.setText("");
                break;
            case R.id.tv_add_friend_add:
                addFriend();
                break;
            case R.id.tv_add_friend_cancel:
                finish();
                break;
            default:
                break;
        }
    }


    /**
     * 监听搜索按钮
     */
    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {

        if (actionId == EditorInfo.IME_ACTION_SEARCH) {
            searchFriend();
            return true;
        }
        return false;
    }

    /**
     * 搜索好友
     */
    private void searchFriend() {
        String userName = mBinding.etAddFriend.getText().toString();
        if (userName.length() == 0) {
            return;
        }
        mBinding.clAdd.setVisibility(View.VISIBLE);
        mBinding.tvAddFriendName.setText(userName);
        WindowUtil.hideBoard(mContext);
    }

    /**
     * 添加好友
     */
    private void addFriend() {
        String userId = mBinding.etAddFriend.getText().toString();
        if (userId.length() == 0) {
            ToastUtil.show(getString(R.string.input_user_id));
            return;
        }
        //参数为要添加的好友的username和添加理由
        EMClient.getInstance().contactManager().aysncAddContact(userId, "", new EMCallBack() {
            @Override
            public void onSuccess() {
                runOnUiThread(() -> {
                    ToastUtil.show(getString(R.string.send_add_friend_message_success));
                    mBinding.etAddFriend.setText("");
                    mBinding.clAdd.setVisibility(View.GONE);
                    EventBus.getDefault().post(new EventBusBean(EventBusBean.TYPE_ADD_FRIEND_SUCCESS));
                });

            }

            @Override
            public void onError(int code, String error) {
                runOnUiThread(() -> ToastUtil.show(getString(R.string.send_add_friend_message_failure) + error));
            }
        });

    }
}