package com.qingkouwei.handyinstruction.section.search;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.ViewModelProvider;
import com.hyphenate.chat.EMGroup;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.constant.DemoConstant;
import com.qingkouwei.handyinstruction.common.interfaceOrImplement.OnResourceParseCallback;
import com.qingkouwei.handyinstruction.section.chat.activity.ChatActivity;
import com.qingkouwei.handyinstruction.section.contact.viewmodels.GroupContactViewModel;
import com.qingkouwei.handyinstruction.section.contact.viewmodels.PublicGroupViewModel;
import com.qingkouwei.handyinstruction.section.group.GroupHelper;
import com.qingkouwei.handyinstruction.section.group.activity.GroupSimpleDetailActivity;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.widget.EaseImageView;
import java.util.List;

public class SearchPublicGroupActivity extends SearchActivity {

    private PublicGroupViewModel viewModel;
    private List<EMGroup> allJoinedGroups;

    public static void actionStart(Context context) {
        Intent starter = new Intent(context, SearchPublicGroupActivity.class);
        context.startActivity(starter);
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar.setTitle(getString(R.string.em_search_group_public));
        query.setHint(getString(R.string.em_search_group_public_hint));
    }

    @Override
    protected void initData() {
        super.initData();
        viewModel = new ViewModelProvider(this).get(PublicGroupViewModel.class);
        viewModel.getGroupObservable().observe(this, response -> {
            parseResource(response, new OnResourceParseCallback<EMGroup>() {
                @Override
                public void onSuccess(EMGroup data) {
                    adapter.addData(data);
                }
            });
        });

        GroupContactViewModel groupViewModel = new ViewModelProvider(mContext).get(GroupContactViewModel.class);
        groupViewModel.getAllGroupsObservable().observe(this, response -> {
            parseResource(response, new OnResourceParseCallback<List<EMGroup>>() {
                @Override
                public void onSuccess(@Nullable List<EMGroup> data) {
                    allJoinedGroups = data;
                }
            });
        });
        groupViewModel.loadAllGroups();
    }

    @Override
    protected EaseBaseRecyclerViewAdapter getAdapter() {
        return new SearchPublicGroupContactAdapter();
    }

    @Override
    public void searchMessages(String search) {
        if(!TextUtils.isEmpty(search)) {
            viewModel.getGroup(search);
        }
    }

    @Override
    protected void onChildItemClick(View view, int position) {
        EMGroup group = (EMGroup) adapter.getItem(position);
        if(GroupHelper.isJoinedGroup(allJoinedGroups, group.getGroupId())) {
            ChatActivity.actionStart(mContext, group.getGroupId(), DemoConstant.CHATTYPE_GROUP);
        }else {
            GroupSimpleDetailActivity.actionStart(mContext, group.getGroupId());
        }
    }

    private class SearchPublicGroupContactAdapter extends EaseBaseRecyclerViewAdapter<EMGroup> {
        @Override
        public int getEmptyLayoutId() {
            return R.layout.demo_layout_no_data_show_nothing;
        }

        @Override
        public ViewHolder getViewHolder(ViewGroup parent, int viewType) {
            return new GroupViewHolder(
                LayoutInflater.from(mContext).inflate(R.layout.demo_widget_contact_item, parent, false));
        }

        private class GroupViewHolder extends ViewHolder<EMGroup> {
            private TextView mHeader;
            private EaseImageView mAvatar;
            private TextView mName;
            private TextView mSignature;
            private TextView mUnreadMsgNumber;

            public GroupViewHolder(@NonNull View itemView) {
                super(itemView);
            }

            @Override
            public void initView(View itemView) {
                mHeader = findViewById(R.id.header);
                mAvatar = findViewById(R.id.avatar);
                mName = findViewById(R.id.name);
                mSignature = findViewById(R.id.signature);
                mUnreadMsgNumber = findViewById(R.id.unread_msg_number);
                mHeader.setVisibility(View.GONE);
            }

            @Override
            public void setData(EMGroup item, int position) {
                mAvatar.setImageResource(R.drawable.ease_group_icon);
                mName.setText(item.getGroupName());
                mSignature.setVisibility(View.VISIBLE);
                mSignature.setText(item.getGroupId()+"");
            }
        }
    }
}
