package com.agora.crane.adapter;

import android.util.ArrayMap;
import android.widget.CheckBox;

import androidx.annotation.NonNull;

import com.agora.crane.R;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.viewholder.BaseViewHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @Author: hyx
 * @Date: 2022/8/13
 * @introduction 创建群界面好友列表适配器
 */
public class CreateGroupAdapter extends BaseQuickAdapter<String, BaseViewHolder> {

    /**
     * 选中的好友
     */
    private Map<String, Boolean> mMapSelected;
    private List<String>mList;

    /**
     * 构造方法
     *
     * @param mList 数据列表
     */
    public CreateGroupAdapter(List<String> mList) {
        super(R.layout.item_create_group, mList);
        mMapSelected = new ArrayMap<>(32);
        this.mList = mList;
    }

    /**
     * 点击处理
     * @param position  点击位置
     */
    public void setClick(int position){
        String name = mList.get(position);
        if(mMapSelected.containsKey(name)&&mMapSelected.get(name)!=null){
            mMapSelected.put(name,!mMapSelected.get(name));
        }else {
            mMapSelected.put(name,true);
        }
        notifyItemChanged(position,"h");
    }

    /**
     * 获取选中的好友
     * @return  返回选中的好友
     */
    public ArrayList<String>getSelected(){
        ArrayList<String>mList = new ArrayList<>(32);
        if(mMapSelected!=null){
            for(Map.Entry<String,Boolean> entry: mMapSelected.entrySet()){
                if(entry==null){
                    continue;
                }
                if(entry.getValue()){
                    mList.add(entry.getKey());
                }
            }
        }
        return mList;
    }

    /**
     * 数据绑定
     *
     * @param holder 控件持有者
     * @param s      数据
     */
    @Override
    protected void convert(@NonNull BaseViewHolder holder, String s) {
        holder.setText(R.id.tv_item_create_group_name, s);
        boolean selected = mMapSelected.containsKey(s) && mMapSelected.get(s) != null && Boolean.TRUE.equals(mMapSelected.get(s));
        ((CheckBox)(holder.getView(R.id.cb_item_create_group))).setChecked(selected);
    }

    /**
     * 局部刷新数据
     * @param holder     控件持有者
     * @param position   刷新的位置
     * @param payloads   有效载荷
     */
    @Override
    public void onBindViewHolder(@NonNull BaseViewHolder holder, int position, @NonNull List<Object> payloads) {
        super.onBindViewHolder(holder, position, payloads);
        if(payloads.isEmpty()){
            onBindViewHolder(holder, position);
        }else {
            String name = mList.get(position);
            boolean selected = mMapSelected.containsKey(name) && mMapSelected.get(name) != null && Boolean.TRUE.equals(mMapSelected.get(name));
            ((CheckBox)(holder.getView(R.id.cb_item_create_group))).setChecked(selected);
        }
    }
}
