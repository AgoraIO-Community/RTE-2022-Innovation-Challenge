package com.agora.crane.fragment;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.viewbinding.ViewBinding;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

/**
 * @Author: hyx
 * @Date: 2022/7/31
 * @introduction fragment基类
 */
public abstract class BaseFragment<W extends ViewBinding> extends Fragment implements View.OnClickListener {

    public Activity mContext;
    protected W mBinding;

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        mContext = (Activity) context;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        FragmentManager fm = getChildFragmentManager();
        if (fm.getFragments() != null && fm.getFragments().size() > 0) {
            FragmentTransaction ft = fm.beginTransaction();
            for (Fragment fragment : fm.getFragments()) {
                ft.remove(fragment);
            }
            ft.commit();
        }
        Type type = this.getClass().getGenericSuperclass();
        if (type instanceof ParameterizedType) {
            try {
                Class<W> clazz = (Class<W>) ((ParameterizedType) type).getActualTypeArguments()[0];
                Method method = clazz.getDeclaredMethod("inflate", LayoutInflater.class, ViewGroup.class, boolean.class);
                mBinding = (W) method.invoke(null, getLayoutInflater(), container, false);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        setListener();
        initData(savedInstanceState);
        return mBinding.getRoot();
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    protected abstract void initData(Bundle savedInstanceState);

    /**
     * 设置监听
     */
    protected void setListener() {
    }

    /**
     * 设置点击控件
     *
     * @param views 添加的控件
     */
    protected void setOnClickViewList(View... views) {
        if (views == null || views.length == 0) {
            return;
        }

        for (View view : views) {
            view.setOnClickListener(this);
        }
    }


}
