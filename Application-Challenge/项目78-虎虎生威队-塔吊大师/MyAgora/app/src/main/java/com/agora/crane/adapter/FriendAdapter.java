package com.agora.crane.adapter;

import com.agora.crane.R;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.viewholder.BaseViewHolder;


import java.util.List;

/**
 * @Author: hyx
 * @Date: 2022/8/7
 * @introduction  好友列表适配器
 */
public class FriendAdapter extends BaseQuickAdapter<String, BaseViewHolder> {


    /**
     * 构造方法
     * @param data 数据列表
     */
    public FriendAdapter(List<String> data) {
        super(R.layout.item_friend,data);
    }

    /**
     * 数据绑定
     * @param holder  控件持有者
     * @param s       数据
     */
    @Override
    protected void convert(BaseViewHolder holder, String s) {
        holder.setText(R.id.tv_item_friend_name,s);
    }
}
