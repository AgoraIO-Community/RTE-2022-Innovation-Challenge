package com.agora.crane.fragment;

import android.text.TextUtils;
import android.view.View;

import com.agora.crane.activity.ChatActivity;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMConversation;
import com.hyphenate.chat.EMGroup;
import com.hyphenate.easeui.EaseIM;
import com.hyphenate.easeui.constants.EaseConstant;
import com.hyphenate.easeui.domain.EaseUser;
import com.hyphenate.easeui.modules.conversation.EaseConversationListFragment;
import com.hyphenate.easeui.provider.EaseUserProfileProvider;
import com.hyphenate.easeui.utils.EaseCommonUtils;

/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction 会话列表基类
 */
public class BaseConversationFragment extends EaseConversationListFragment {

    @Override
    public void onItemClick(View view, int position) {
        super.onItemClick(view, position);
        Object item = conversationListLayout.getItem(position).getInfo();
        int chatType = EaseCommonUtils.getChatType((EMConversation) item);
        String conversationId = ((EMConversation) item).conversationId();
        String title = "";
        if (EaseConstant.CHATTYPE_GROUP == chatType) {
            title = getGroupName(conversationId);
        } else {
            title = getFriendName(conversationId);
        }
        ChatActivity.skipActivity(mContext, conversationId, chatType, title);
    }

    /**
     * 获取群名称
     *
     * @param conversationId 会话ID
     */
    private String getGroupName(String conversationId) {
        EMGroup group = EMClient.getInstance().groupManager().getGroup(conversationId);
        if (group == null) {
            return conversationId;
        }
        return TextUtils.isEmpty(group.getGroupName()) ? conversationId : group.getGroupName();
    }

    /**
     * 获取好友名
     *
     * @param conversationId 会话ID
     */
    private String getFriendName(String conversationId) {
        EaseUserProfileProvider userProvider = EaseIM.getInstance().getUserProvider();
        if (userProvider != null) {
            EaseUser user = userProvider.getUser(conversationId);
            if (user != null) {
                return user.getNickname();
            } else {
                return conversationId;
            }
        } else {
            return conversationId;
        }
    }
}
