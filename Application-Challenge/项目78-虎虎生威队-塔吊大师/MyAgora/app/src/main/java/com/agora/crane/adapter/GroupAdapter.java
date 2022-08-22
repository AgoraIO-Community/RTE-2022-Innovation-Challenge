package com.agora.crane.adapter;

import com.agora.crane.R;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.viewholder.BaseViewHolder;
import com.hyphenate.chat.EMGroup;

import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/8/7
 * @introduction 塔吊列表适配器
 */
public class GroupAdapter extends BaseQuickAdapter<EMGroup, BaseViewHolder> {


    /**
     * 构造方法
     * @param data 数据列表
     */
    public GroupAdapter(List<EMGroup> data) {
        super(R.layout.item_group,data);
    }

    /**
     * 数据绑定
     * @param holder  控件持有者
     * @param group   数据
     */
    @Override
    protected void convert(BaseViewHolder holder, EMGroup group) {
        holder.setText(R.id.tv_item_group_name,group.getGroupName());
        holder.setText(R.id.tv_item_group_id,group.getGroupId());
    }
}
