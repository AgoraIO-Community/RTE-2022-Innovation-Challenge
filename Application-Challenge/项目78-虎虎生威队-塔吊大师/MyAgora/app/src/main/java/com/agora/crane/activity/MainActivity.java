package com.agora.crane.activity;


import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.FragmentTransaction;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivityMainBinding;
import com.agora.crane.fragment.ContactFragment;
import com.agora.crane.fragment.ConversationFragment;
import com.agora.crane.fragment.MineFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

/**
 * @Author: hyx
 * @Date: 2022/7/21
 * @introduction 主界面
 */
public class MainActivity extends BaseActivity<ActivityMainBinding> {

    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(AppCompatActivity mActivity) {
        Intent mIntent = new Intent(mActivity, MainActivity.class);
        mActivity.startActivity(mIntent);
    }

    private ConversationFragment mConversationFragment;
    private ContactFragment mContactFragment;
    private MineFragment mMineFragment;

    /**
     * 初始化
     *
     * @param savedInstanceState 保存的实例状态
     */
    @SuppressLint("RestrictedApi")
    @Override
    protected void initData(Bundle savedInstanceState) {

        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        mConversationFragment = new ConversationFragment();
        mContactFragment = new ContactFragment();
        mMineFragment = new MineFragment();
        transaction.add(R.id.fl_main, mConversationFragment);
        transaction.add(R.id.fl_main, mContactFragment);
        transaction.add(R.id.fl_main, mMineFragment);
        hideAllFragment(transaction);
        transaction.show(mConversationFragment);
        transaction.commit();
        setTitle(getString(R.string.conversation));
        mBinding.navViewMain.setOnNavigationItemSelectedListener(listener);
    }

    /**
     * BottomNavigationView 点击监听
     */
    @SuppressLint("NonConstantResourceId")
    private BottomNavigationView.OnNavigationItemSelectedListener listener = item -> {
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        switch (item.getItemId()) {
            case R.id.fragment_conversation:
                setTitle(getString(R.string.conversation));
                hideAllFragment(transaction);
                transaction.show(mConversationFragment);
                transaction.commit();
                break;
            case R.id.fragment_contact:
                setTitle(getString(R.string.contact));
                hideAllFragment(transaction);
                transaction.show(mContactFragment);
                transaction.commit();
                break;
            case R.id.fragment_mine:
                setTitle(getString(R.string.mine));
                hideAllFragment(transaction);
                transaction.show(mMineFragment);
                transaction.commit();
                break;
            default:
                break;
        }
        return true;
    };


    /**
     * 隐藏全部fragment
     */
    private void hideAllFragment(FragmentTransaction transaction) {
        transaction.hide(mConversationFragment);
        transaction.hide(mMineFragment);
        transaction.hide(mContactFragment);
    }

    /**
     * 设置右上角按钮
     *
     * @param menu 菜单
     * @return
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.contact_right_menu, menu);
        return true;
    }

    /**
     * 点击右上角菜单
     *
     * @param item 菜单
     */
    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        switch (item.getItemId()) {
            case R.id.item_add_friend:
                AddFriendActivity.skipActivity(mContext);
                break;
            case R.id.item_create_group:
                CreateGroupActivity.skipActivity(mContext);
                break;
            case R.id.item_join_group:
                JoinGroupActivity.skipActivity(mContext);
                break;
            default:
                break;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onClick(View view) {

    }

}