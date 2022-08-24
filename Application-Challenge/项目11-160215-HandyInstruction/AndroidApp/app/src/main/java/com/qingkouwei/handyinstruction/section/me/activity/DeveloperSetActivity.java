package com.qingkouwei.handyinstruction.section.me.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import androidx.annotation.Nullable;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMOptions;
import com.qingkouwei.handyinstruction.DemoApplication;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.common.manager.OptionsHelper;
import com.qingkouwei.handyinstruction.common.model.DemoModel;
import com.qingkouwei.handyinstruction.common.widget.ArrowItemView;
import com.qingkouwei.handyinstruction.common.widget.SwitchItemView;
import com.qingkouwei.handyinstruction.section.base.BaseInitActivity;
import com.hyphenate.easeui.widget.EaseTitleBar;

public class DeveloperSetActivity extends BaseInitActivity implements EaseTitleBar.OnBackPressListener, View.OnClickListener, SwitchItemView.OnCheckedChangeListener {
    private static final int APPKEY_REQUEST_CODE = 110;
    private EaseTitleBar  titleBar;
    private ArrowItemView itemVersion;
    private ArrowItemView itemAppkey;
    private SwitchItemView itemSwitchTokenLogin;
    private SwitchItemView itemSwitchMsgFromServer;
    private SwitchItemView itemSwitchUploadToHx;
    private SwitchItemView itemSwitchAutoDownloadThumbnail;
    private ArrowItemView itemMsgSort;
    private ArrowItemView itemPushNick;
    private ArrowItemView itemMsgServiceDiagnose;
    private DemoModel settingsModel;
    private EMOptions options;

    private String sortType[] = new String[]{DemoApplication.getInstance().getApplicationContext().getString(R.string.in_order_of_reception), DemoApplication.getInstance().getApplicationContext().getString(R.string.by_server_time)};

    public static void actionStart(Context context) {
        Intent starter = new Intent(context, DeveloperSetActivity.class);
        context.startActivity(starter);
    }

    @Override
    protected int getLayoutId() {
        return R.layout.demo_activity_developer_set;
    }

    @Override
    protected void initView(Bundle savedInstanceState) {
        super.initView(savedInstanceState);
        titleBar = findViewById(R.id.title_bar);
        itemVersion = findViewById(R.id.item_version);
        itemAppkey = findViewById(R.id.item_appkey);
        itemSwitchTokenLogin = findViewById(R.id.item_switch_token_login);
        itemSwitchMsgFromServer = findViewById(R.id.item_switch_msg_from_server);
        itemSwitchUploadToHx = findViewById(R.id.item_switch_upload_to_hx);
        itemSwitchAutoDownloadThumbnail = findViewById(R.id.item_switch_auto_download_thumbnail);
        itemMsgSort = findViewById(R.id.item_msg_sort);
        itemPushNick = findViewById(R.id.item_push_nick);
        itemMsgServiceDiagnose = findViewById(R.id.item_msg_service_diagnose);
    }

    @Override
    protected void initListener() {
        super.initListener();
        titleBar.setOnBackPressListener(this);
        itemAppkey.setOnClickListener(this);
        itemSwitchTokenLogin.setOnCheckedChangeListener(this);
        itemSwitchMsgFromServer.setOnCheckedChangeListener(this);
        itemSwitchUploadToHx.setOnCheckedChangeListener(this);
        itemSwitchAutoDownloadThumbnail.setOnCheckedChangeListener(this);
        itemMsgSort.setOnClickListener(this);
        itemPushNick.setOnClickListener(this);
        itemMsgServiceDiagnose.setOnClickListener(this);
    }

    @Override
    protected void initData() {
        super.initData();
        itemVersion.getTvContent().setText("V"+ EMClient.VERSION);

        settingsModel = com.qingkouwei.handyinstruction.DemoHelper.getInstance().getModel();
        options = EMClient.getInstance().getOptions();

        itemSwitchTokenLogin.getSwitch().setChecked(settingsModel.isEnableTokenLogin());
        itemSwitchMsgFromServer.getSwitch().setChecked(settingsModel.isMsgRoaming());
        itemSwitchUploadToHx.getSwitch().setChecked(settingsModel.isSetTransferFileByUser());
        itemSwitchAutoDownloadThumbnail.getSwitch().setChecked(settingsModel.isSetAutodownloadThumbnail());
        itemMsgSort.getTvContent().setText(settingsModel.isSortMessageByServerTime() ? sortType[1] : sortType[0]);

        setAppKey(options.getAppKey());
    }

    @Override
    public void onBackPress(View view) {
        onBackPressed();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.item_appkey :
                AppKeyManageActivity.actionStartForResult(mContext, APPKEY_REQUEST_CODE);
                break;
            case R.id.item_msg_sort :
                showSelectDialog();
                break;
            case R.id.item_push_nick:
                OfflinePushNickActivity.actionStart(mContext);
                break;
            case R.id.item_msg_service_diagnose :
                DiagnoseActivity.actionStart(mContext);
                break;
        }
    }

    private void showSelectDialog() {
        new AlertDialog.Builder(this)
                    .setTitle(R.string.choose)
                    .setItems(sortType, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            itemMsgSort.getTvContent().setText(sortType[which]);
                            settingsModel.setSortMessageByServerTime(which == 1);
                            options.setSortMessageByServerTime(which == 1);
                        }
                    })
                    .show();
    }

    @Override
    public void onCheckedChanged(SwitchItemView buttonView, boolean isChecked) {
        switch (buttonView.getId()) {
            case R.id.item_switch_token_login :
                settingsModel.setEnableTokenLogin(isChecked);
                break;
            case R.id.item_switch_msg_from_server :
                settingsModel.setMsgRoaming(isChecked);
                break;
            case R.id.item_switch_upload_to_hx :
                settingsModel.setTransfeFileByUser(isChecked);
                options.setAutoTransferMessageAttachments(isChecked);
                break;
            case R.id.item_switch_auto_download_thumbnail :
                settingsModel.setAutodownloadThumbnail(isChecked);
                options.setAutoDownloadThumbnail(isChecked);
                break;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == APPKEY_REQUEST_CODE && resultCode == RESULT_OK) {
            if(data != null) {
                String appkey = data.getStringExtra("appkey");
                setAppKey(appkey);
                killApp();
            }
        }
    }

    private void killApp() {
        com.qingkouwei.handyinstruction.DemoHelper.getInstance().killApp();
    }

    private void setAppKey(String appKey) {
        if(TextUtils.equals(appKey, OptionsHelper.getInstance().getDefAppkey())) {
            itemAppkey.getTvContent().setText(getString(R.string.default_appkey));
        }else {
            itemAppkey.getTvContent().setText(appKey);
        }
    }
}
