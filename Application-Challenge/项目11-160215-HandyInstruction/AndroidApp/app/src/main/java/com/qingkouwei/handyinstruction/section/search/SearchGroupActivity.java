package com.qingkouwei.handyinstruction.section.search;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMGroup;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.constant.DemoConstant;
import com.qingkouwei.handyinstruction.section.chat.activity.ChatActivity;
import com.qingkouwei.handyinstruction.section.contact.adapter.GroupContactAdapter;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.manager.EaseThreadManager;
import java.util.ArrayList;
import java.util.List;

public class SearchGroupActivity extends SearchActivity {
    private List<EMGroup> mData;
    private List<EMGroup> result;

    public static void actionStart(Context context) {
        Intent intent = new Intent(context, SearchGroupActivity.class);
        context.startActivity(intent);
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar.setTitle(getString(R.string.em_search_group));
    }

    @Override
    protected EaseBaseRecyclerViewAdapter getAdapter() {
        return new SearchGroupContactAdapter();
    }

    @Override
    protected void initData() {
        super.initData();
        result = new ArrayList<>();
        mData = EMClient.getInstance().groupManager().getAllGroups();
    }

    @Override
    public void searchMessages(String search) {
        searchResult(search);
    }


    private void searchResult(String search) {
        if(mData == null || mData.isEmpty()) {
            return;
        }

        EaseThreadManager.getInstance().runOnIOThread(()-> {
            result.clear();
            for (EMGroup group : mData) {
                if(group.getGroupName().contains(search) || group.getGroupId().contains(search)) {
                    result.add(group);
                }
            }
            runOnUiThread(()-> adapter.setData(result));
        });
    }

    @Override
    protected void onChildItemClick(View view, int position) {
        //跳转到群聊页面
        EMGroup group = ((GroupContactAdapter)adapter).getItem(position);
        ChatActivity.actionStart(mContext, group.getGroupId(), DemoConstant.CHATTYPE_GROUP);
    }

    private class SearchGroupContactAdapter extends GroupContactAdapter {
        @Override
        public int getEmptyLayoutId() {
            return R.layout.demo_layout_no_data_show_nothing;
        }
    }
}
