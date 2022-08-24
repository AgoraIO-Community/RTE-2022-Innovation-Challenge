package com.qingkouwei.handyinstruction.section.search;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.lifecycle.ViewModelProvider;
import com.hyphenate.chat.EMChatRoom;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMGroup;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.db.entity.MsgTypeManageEntity;
import com.qingkouwei.handyinstruction.common.interfaceOrImplement.OnResourceParseCallback;
import com.qingkouwei.handyinstruction.section.chat.activity.ChatActivity;
import com.qingkouwei.handyinstruction.section.conversation.adapter.HomeAdapter;
import com.qingkouwei.handyinstruction.section.conversation.viewmodel.ConversationListViewModel;
import com.qingkouwei.handyinstruction.section.message.SystemMsgsActivity;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.manager.EaseThreadManager;
import com.hyphenate.easeui.utils.EaseCommonUtils;
import java.util.ArrayList;
import java.util.List;

public class SearchConversationActivity extends SearchActivity {
    private List<Object> mData;
    private List<Object> result;

    public static void actionStart(Context context) {
        Intent intent = new Intent(context, SearchConversationActivity.class);
        context.startActivity(intent);
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar.setTitle(getString(R.string.em_search_conversation));
    }

    @Override
    protected EaseBaseRecyclerViewAdapter getAdapter() {
        return new HomeAdapter();
    }

    @Override
    protected void initData() {
        super.initData();
        result = new ArrayList<>();
        ConversationListViewModel viewModel = new ViewModelProvider(this).get(ConversationListViewModel.class);
        viewModel.getConversationObservable().observe(this, response -> {
            parseResource(response, new OnResourceParseCallback<List<Object>>() {
                @Override
                public void onSuccess(List<Object> data) {
                    mData = data;
                }
            });
        });
        viewModel.loadConversationList();
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
            for (Object obj : mData) {
                if(obj instanceof EMConversation) {
                    EMConversation item = (EMConversation) obj;
                    String username = item.conversationId();
                    if(item.getType() == EMConversation.EMConversationType.GroupChat) {
                        EMGroup group = com.qingkouwei.handyinstruction.DemoHelper.getInstance().getGroupManager().getGroup(username);
                        if(group != null) {
                            if(group.getGroupName().contains(search)) {
                                result.add(obj);
                            }
                        }else {
                            if(username.contains(search)) {
                                result.add(obj);
                            }
                        }
                    }else if(item.getType() == EMConversation.EMConversationType.ChatRoom) {
                        EMChatRoom chatRoom = com.qingkouwei.handyinstruction.DemoHelper.getInstance().getChatroomManager().getChatRoom(username);
                        if(chatRoom != null) {
                            if(chatRoom.getName().contains(search)) {
                                result.add(obj);
                            }
                        }else {
                            if(username.contains(search)) {
                                result.add(obj);
                            }
                        }
                    }else {
                        if(username.contains(search)) {
                            result.add(obj);
                        }
                    }
                }
            }
            runOnUiThread(()-> adapter.setData(result));
        });
    }

    @Override
    protected void onChildItemClick(View view, int position) {
        Object item = adapter.getItem(position);
        if(item instanceof EMConversation) {
            ChatActivity.actionStart(mContext, ((EMConversation)item).conversationId(), EaseCommonUtils.getChatType((EMConversation) item));
        }else if(item instanceof MsgTypeManageEntity) {
            SystemMsgsActivity.actionStart(mContext);
        }
    }
}
