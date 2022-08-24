package com.qingkouwei.handyinstruction.section.search;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import com.hyphenate.chat.EMChatRoom;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.constant.DemoConstant;
import com.qingkouwei.handyinstruction.section.chat.activity.ChatActivity;
import com.qingkouwei.handyinstruction.section.contact.adapter.ChatRoomContactAdapter;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.manager.EaseThreadManager;
import java.util.ArrayList;
import java.util.List;

public class SearchChatRoomActivity extends SearchActivity {
    private List<EMChatRoom> mData;
    private List<EMChatRoom> result;

    public static void actionStart(Context context) {
        Intent intent = new Intent(context, SearchChatRoomActivity.class);
        context.startActivity(intent);
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar.setTitle(getString(R.string.em_search_chat_room));
    }

    @Override
    protected EaseBaseRecyclerViewAdapter getAdapter() {
        return new SearchChatRoomContactAdapter();
    }

    @Override
    protected void initData() {
        super.initData();
        result = new ArrayList<>();
        mData = com.qingkouwei.handyinstruction.DemoHelper.getInstance().getModel().chatRooms;
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
            for (EMChatRoom room : mData) {
                if(room.getName().contains(search) || room.getId().contains(search)) {
                    result.add(room);
                }
            }
            runOnUiThread(()-> adapter.setData(result));
        });
    }

    @Override
    protected void onChildItemClick(View view, int position) {
        EMChatRoom item = ((ChatRoomContactAdapter) adapter).getItem(position);
        ChatActivity.actionStart(mContext, item.getId(), DemoConstant.CHATTYPE_CHATROOM);
    }

    private class SearchChatRoomContactAdapter extends ChatRoomContactAdapter {
        @Override
        public int getEmptyLayoutId() {
            return R.layout.demo_layout_no_data_show_nothing;
        }
    }
}
