package com.qingkouwei.handyinstruction.section.chat.delegates;

import android.view.View;
import android.view.ViewGroup;
import com.hyphenate.chat.EMMessage;
import com.qingkouwei.handyinstruction.common.constant.DemoConstant;
import com.qingkouwei.handyinstruction.section.chat.viewholder.ChatRecallViewHolder;
import com.qingkouwei.handyinstruction.section.chat.views.ChatRowRecall;
import com.hyphenate.easeui.delegate.EaseMessageAdapterDelegate;
import com.hyphenate.easeui.interfaces.MessageListItemClickListener;
import com.hyphenate.easeui.viewholder.EaseChatRowViewHolder;
import com.hyphenate.easeui.widget.chatrow.EaseChatRow;

import static com.hyphenate.chat.EMMessage.Type.TXT;

public class ChatRecallAdapterDelegate extends EaseMessageAdapterDelegate<EMMessage, EaseChatRowViewHolder> {

    @Override
    public boolean isForViewType(EMMessage item, int position) {
        return item.getType() == TXT && item.getBooleanAttribute(DemoConstant.MESSAGE_TYPE_RECALL, false);
    }

    @Override
    protected EaseChatRow getEaseChatRow(ViewGroup parent, boolean isSender) {
        return new ChatRowRecall(parent.getContext(), isSender);
    }

    @Override
    protected EaseChatRowViewHolder createViewHolder(View view, MessageListItemClickListener itemClickListener) {
        return new ChatRecallViewHolder(view, itemClickListener);
    }
}
