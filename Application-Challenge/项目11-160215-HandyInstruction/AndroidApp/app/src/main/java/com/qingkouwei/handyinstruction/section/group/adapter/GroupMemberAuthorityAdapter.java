package com.qingkouwei.handyinstruction.section.group.adapter;

import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.section.contact.adapter.ContactListAdapter;

public class GroupMemberAuthorityAdapter extends ContactListAdapter {

    @Override
    public int getEmptyLayoutId() {
        return R.layout.ease_layout_default_no_data;
    }
}
