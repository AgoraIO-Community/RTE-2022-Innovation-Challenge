package com.agora.crane.activity;

import static com.agora.crane.utils.Constant.getAppVersionName;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.method.LinkMovementMethod;
import android.text.util.Linkify;
import android.view.View;

import com.agora.crane.R;
import com.agora.crane.databinding.ActivityAboutUsBinding;

public class AboutUsActivity extends BaseActivity<ActivityAboutUsBinding> {


    /**
     * 界面跳转
     *
     * @param mActivity 上个界面
     */
    public static void skipActivity(Activity mActivity) {
        Intent mIntent = new Intent(mActivity, AboutUsActivity.class);
        mActivity.startActivity(mIntent);
    }

    /**
     * 初始化数据
     *
     * @param savedInstanceState 保存的实例状态
     */
    @Override
    protected void initData(Bundle savedInstanceState) {
        String appInfo = getString(R.string.application_name) + getAppVersionName();
        mBinding.tvAboutUsAppName.setText(appInfo);
        setTitle(getString(R.string.about_us));
        showBackButton();
        setAutoLink();
    }

    /**
     * 设置自动超链
     */
    private void setAutoLink() {
        String htmlEventBus = "•EventBus：\nhttps://github.com/greenrobot/EventBus/blob/master/LICENSE";
        mBinding.tvAboutUsEventbus.setText(htmlEventBus);
        mBinding.tvAboutUsEventbus.setAutoLinkMask(Linkify.WEB_URLS);
        mBinding.tvAboutUsEventbus.setMovementMethod(LinkMovementMethod.getInstance());

        String htmlOkHttp = "•okhttp：\nhttps://github.com/square/okhttp/blob/master/LICENSE.txt";
        mBinding.tvAboutUsOkhttp.setText(htmlOkHttp);
        mBinding.tvAboutUsOkhttp.setAutoLinkMask(Linkify.WEB_URLS);
        mBinding.tvAboutUsOkhttp.setMovementMethod(LinkMovementMethod.getInstance());

        String htmlGson = "•gson：\nhttps://github.com/google/gson/blob/master/LICENSE";
        mBinding.tvAboutUsGson.setText(htmlGson);
        mBinding.tvAboutUsGson.setAutoLinkMask(Linkify.WEB_URLS);
        mBinding.tvAboutUsGson.setMovementMethod(LinkMovementMethod.getInstance());

    }


    @Override
    public void onClick(View view) {

    }
}