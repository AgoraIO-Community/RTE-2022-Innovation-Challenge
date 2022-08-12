package com.qingkouwei.handyinstruction.section.message.delegates;

import android.view.View;
import android.widget.TextView;
import androidx.annotation.NonNull;
import com.hyphenate.chat.EMMessage;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.constant.DemoConstant;
import com.qingkouwei.handyinstruction.common.db.entity.InviteMessageStatus;
import com.qingkouwei.handyinstruction.common.manager.PushAndMessageHelper;
import com.hyphenate.easeui.adapter.EaseBaseDelegate;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.utils.EaseDateUtils;
import com.hyphenate.easeui.widget.EaseImageView;
import com.hyphenate.exceptions.HyphenateException;
import java.util.Date;

public class OtherMsgDelegate extends EaseBaseDelegate<EMMessage, OtherMsgDelegate.ViewHolder> {

    @Override
    public boolean isForViewType(EMMessage msg, int position) {
        String statusParams = null;
        try {
            statusParams = msg.getStringAttribute(DemoConstant.SYSTEM_MESSAGE_STATUS);
        } catch (HyphenateException e) {
            e.printStackTrace();
        }
        InviteMessageStatus status = InviteMessageStatus.valueOf(statusParams);
        return status != InviteMessageStatus.BEINVITEED &&
                status != InviteMessageStatus.BEAPPLYED &&
                status != InviteMessageStatus.GROUPINVITATION &&
                status != InviteMessageStatus.BEAGREED;
    }

    @Override
    protected int getLayoutId() {
        return R.layout.demo_layout_item_invite_msg_agree;
    }

    @Override
    protected ViewHolder createViewHolder(View view) {
        return new ViewHolder(view);
    }

    public class ViewHolder extends EaseBaseRecyclerViewAdapter.ViewHolder<EMMessage> {
        private TextView name;
        private TextView message;
        private EaseImageView avatar;
        private TextView time;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
        }

        @Override
        public void initView(View itemView) {
            name = findViewById(R.id.name);
            message = findViewById(R.id.message);
            avatar = findViewById(R.id.avatar);
            time = findViewById(R.id.time);
            avatar.setShapeType(
                com.qingkouwei.handyinstruction.DemoHelper.getInstance().getEaseAvatarOptions().getAvatarShape());
        }

        @Override
        public void setData(EMMessage msg, int position) {
            try {
                name.setText(msg.getStringAttribute(DemoConstant.SYSTEM_MESSAGE_FROM));
                String str = PushAndMessageHelper.getSystemMessage(msg);
                message.setText(str);
            } catch (HyphenateException e) {
                e.printStackTrace();
            }
            time.setText(EaseDateUtils.getTimestampString(itemView.getContext(), new Date(msg.getMsgTime())));

        }
    }
}
