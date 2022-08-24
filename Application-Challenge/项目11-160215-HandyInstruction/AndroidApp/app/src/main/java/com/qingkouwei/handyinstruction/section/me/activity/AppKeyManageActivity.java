package com.qingkouwei.handyinstruction.section.me.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.hyphenate.chat.EMClient;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.db.entity.AppKeyEntity;
import com.qingkouwei.handyinstruction.common.interfaceOrImplement.OnResourceParseCallback;
import com.qingkouwei.handyinstruction.common.manager.OptionsHelper;
import com.qingkouwei.handyinstruction.common.model.DemoModel;
import com.qingkouwei.handyinstruction.section.base.BaseInitActivity;
import com.qingkouwei.handyinstruction.section.dialog.DemoDialogFragment;
import com.qingkouwei.handyinstruction.section.dialog.SimpleDialogFragment;
import com.qingkouwei.handyinstruction.section.me.viewmodels.AppKeyManagerViewModel;
import com.hyphenate.easeui.adapter.EaseBaseRecyclerViewAdapter;
import com.hyphenate.easeui.interfaces.OnItemClickListener;
import com.hyphenate.easeui.interfaces.OnItemLongClickListener;
import com.hyphenate.easeui.widget.EaseRecyclerView;
import com.hyphenate.easeui.widget.EaseTitleBar;
import com.scwang.smartrefresh.layout.SmartRefreshLayout;
import com.scwang.smartrefresh.layout.api.RefreshLayout;
import com.scwang.smartrefresh.layout.listener.OnRefreshListener;
import java.util.List;

public class AppKeyManageActivity extends BaseInitActivity implements EaseTitleBar.OnBackPressListener, OnRefreshListener, EaseTitleBar.OnRightClickListener {
    private EaseTitleBar titleBar;
    private SmartRefreshLayout srlRefresh;
    private EaseRecyclerView rvList;
    private RvAdapter adapter;

    private int selectedPosition;
    private DemoModel settingsModel;
    private AppKeyManagerViewModel viewModel;

    public static void actionStartForResult(Activity activity, int requestCode) {
        Intent starter = new Intent(activity, AppKeyManageActivity.class);
        activity.startActivityForResult(starter, requestCode);
    }

    @Override
    protected int getLayoutId() {
        return R.layout.demo_activity_appkey_manage;
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar = findViewById(R.id.title_bar);
        srlRefresh = findViewById(R.id.srl_refresh);
        rvList = findViewById(R.id.rv_list);
    }

    @Override
    protected void initListener() {
        super.initListener();
        titleBar.setOnBackPressListener(this);
        srlRefresh.setOnRefreshListener(this);
        titleBar.setOnRightClickListener(this);
    }

    @Override
    protected void initData() {
        super.initData();
        viewModel = new ViewModelProvider(this).get(AppKeyManagerViewModel.class);
        viewModel.getLogoutObservable().observe(this, response -> {
            parseResource(response, new OnResourceParseCallback<Boolean>() {
                @Override
                public void onSuccess(Boolean data) {
                    finish();
                    DemoHelper.getInstance().killApp();
                }
            });
        });

        settingsModel = DemoHelper.getInstance().getModel();

        rvList.setLayoutManager(new LinearLayoutManager(mContext));
        adapter = new RvAdapter();
        rvList.setAdapter(adapter);

        View bottom = LayoutInflater.from(mContext).inflate(R.layout.demo_layout_appkey_add, null);
        rvList.addFooterView(bottom);

        bottom.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AppKeyAddActivity.actionStartForResult(mContext, 100);
            }
        });

        adapter.setOnItemClickListener(new OnItemClickListener() {
            @Override
            public void onItemClick(View view, int position) {
                RadioButton radio = view.findViewById(R.id.iv_arrow);
                boolean checked = radio.isChecked();
                radio.setChecked(!checked);
                showConfirmDialog(view, position);
            }
        });

        adapter.setOnItemLongClickListener(new OnItemLongClickListener() {
            @Override
            public boolean onItemLongClick(View view, int position) {
                AppKeyEntity item = adapter.getItem(position);
                String appKey = item.getAppKey();
                if(!TextUtils.equals(appKey, OptionsHelper.getInstance().getDefAppkey())
                        && !TextUtils.equals(appKey, EMClient.getInstance().getOptions().getAppKey())) {
                    showDeleteDialog(position);
                }
                return true;
            }
        });

        getData();
    }

    private void showConfirmDialog(View itemView, int position) {
        new SimpleDialogFragment.Builder(mContext)
                .setTitle(R.string.em_developer_appkey_warning)
                .setTitleSize(14)
                .setOnConfirmClickListener(R.string.em_developer_appkey_confirm, new DemoDialogFragment.OnConfirmClickListener() {
                    @Override
                    public void onConfirmClick(View view) {
                        selectedPosition = position;
                        adapter.notifyDataSetChanged();
                        String appKey = adapter.getItem(position).getAppKey();
                        DemoHelper.getInstance().getModel().enableCustomAppkey(!TextUtils.isEmpty(appKey));
                        settingsModel.setCustomAppkey(appKey);
                        viewModel.logout(true);
                    }
                })
                .setOnCancelClickListener(new DemoDialogFragment.onCancelClickListener() {
                    @Override
                    public void onCancelClick(View view) {
                        RadioButton radio = itemView.findViewById(R.id.iv_arrow);
                        boolean checked = radio.isChecked();
                        radio.setChecked(!checked);
                    }
                })
                .showCancelButton(true)
                .show();
    }

    private void showSetDefaultDialog() {
        new SimpleDialogFragment.Builder(mContext)
                .setTitle(R.string.em_developer_appkey_warning)
                .setTitleSize(14)
                .setOnConfirmClickListener(R.string.em_developer_appkey_confirm, new DemoDialogFragment.OnConfirmClickListener() {
                    @Override
                    public void onConfirmClick(View view) {
                        DemoHelper.getInstance().getModel().enableCustomAppkey(false);
                        viewModel.logout(true);
                    }
                })
                .showCancelButton(true)
                .show();
    }

    private void showDeleteDialog(int position) {
        new AlertDialog.Builder(this)
                    .setMessage(R.string.em_developer_appkey_delete)
                    .setPositiveButton(mContext.getString(R.string.confirm), new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            DemoHelper.getInstance().getModel().deleteAppKey(adapter.mData.get(position).getAppKey());
                            getData();
                        }
                    })
                    .setNegativeButton(mContext.getString(R.string.cancel), null)
                    .show();
    }

    private void getData() {
        List<AppKeyEntity> appKeys = DemoHelper.getInstance().getModel().getAppKeys();
        String appkey = "";
        selectedPosition = -1;
        if(settingsModel.isCustomAppkeyEnabled()) {
            appkey = settingsModel.getCutomAppkey();
        }
        if(appKeys != null && !appKeys.isEmpty()) {
            for(int i = 0; i < appKeys.size(); i++) {
                AppKeyEntity entity = appKeys.get(i);
                if(TextUtils.equals(entity.getAppKey(), appkey)) {
                    selectedPosition = i;
                }
            }
        }
        adapter.setData(appKeys);
        if(srlRefresh != null) {
            srlRefresh.finishRefresh();
        }
    }

    @Override
    public void onBackPress(View view) {
        onBackPressed();
    }

    @Override
    public void onRefresh(RefreshLayout refreshLayout) {
        getData();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == 100 && resultCode == RESULT_OK) {
            getData();
        }
    }

    @Override
    public void onRightClick(View view) {
        showSetDefaultDialog();
    }

    private class RvAdapter extends EaseBaseRecyclerViewAdapter<AppKeyEntity> {

        @Override
        public ViewHolder getViewHolder(ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(mContext).inflate(R.layout.demo_item_appkey_manage, parent, false);
            return new MyViewHolder(view);
        }

        @Override
        public int getEmptyLayoutId() {
            return R.layout.ease_layout_no_data_show_nothing;
        }

        private class MyViewHolder extends ViewHolder<AppKeyEntity> {
            private RadioButton ivArrow;
            private TextView tvContent;

            public MyViewHolder(@NonNull View itemView) {
                super(itemView);
            }

            @Override
            public void initView(View itemView) {
                ivArrow = findViewById(R.id.iv_arrow);
                tvContent = findViewById(R.id.tv_content);
            }

            @Override
            public void setData(AppKeyEntity item, int position) {
                tvContent.setText(item.getAppKey());
                if(selectedPosition == position) {
                    //ivArrow.setVisibility(View.VISIBLE);
                    ivArrow.setChecked(true);
                }else {
                    //ivArrow.setVisibility(View.INVISIBLE);
                    ivArrow.setChecked(false);
                }
            }
        }

    }
}
