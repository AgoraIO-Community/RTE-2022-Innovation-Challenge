package com.agora.crane.fragment;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.activity.AboutUsActivity;
import com.agora.crane.activity.SettingActivity;
import com.agora.crane.databinding.FragmentMineBinding;
import com.agora.crane.utils.UserManager;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction 我的
 */
public class MineFragment extends BaseFragment<FragmentMineBinding> {


    @Override
    protected void initData(Bundle savedInstanceState) {
        setOnClickViewList(mBinding.layoutItemSetting, mBinding.layoutItemAboutUs);
    }

    @Override
    protected void setListener() {
        super.setListener();
        mBinding.layoutItemSetting.setOnClickListener(view -> SettingActivity.skipActivity(mContext));
    }

    @SuppressLint("NonConstantResourceId")
    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.layout_item_setting:
                SettingActivity.skipActivity(mContext);
                break;
            case R.id.layout_item_about_us:
                AboutUsActivity.skipActivity(mContext);
                break;
            default:
                break;
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        String userName = String.format(getString(R.string.user_name), UserManager.getUserName());
        String userRole = String.format(getString(R.string.user_role), UserManager.getRoleName());
        mBinding.tvUserName.setText(userName);
        mBinding.tvUserRole.setText(userRole);
    }

}
