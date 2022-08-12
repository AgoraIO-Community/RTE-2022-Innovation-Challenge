package com.qingkouwei.handyinstruction.common.repositories;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.hyphenate.chat.EMChatManager;
import com.hyphenate.chat.EMChatRoomManager;
import com.hyphenate.chat.EMClient;
import com.hyphenate.chat.EMContactManager;
import com.hyphenate.chat.EMGroupManager;
import com.hyphenate.chat.EMPushManager;
import com.qingkouwei.handyinstruction.DemoApplication;
import com.qingkouwei.handyinstruction.DemoHelper;
import com.qingkouwei.handyinstruction.common.db.DemoDbHelper;
import com.qingkouwei.handyinstruction.common.db.dao.EmUserDao;
import com.qingkouwei.handyinstruction.common.db.dao.InviteMessageDao;
import com.qingkouwei.handyinstruction.common.db.dao.MsgTypeManageDao;
import com.hyphenate.easeui.manager.EaseThreadManager;

public class BaseEMRepository {

    /**
     * return a new liveData
     * @param item
     * @param <T>
     * @return
     */
    public <T> LiveData<T> createLiveData(T item) {
        return new MutableLiveData<>(item);
    }

    /**
     * login before
     * @return
     */
    public boolean isLoggedIn() {
        return EMClient.getInstance().isLoggedInBefore();
    }

    /**
     * 获取本地标记，是否自动登录
     * @return
     */
    public boolean isAutoLogin() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getAutoLogin();
    }

    /**
     * 获取当前用户
     * @return
     */
    public String getCurrentUser() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getCurrentUser();
    }

    /**
     * EMChatManager
     * @return
     */
    public EMChatManager getChatManager() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getEMClient().chatManager();
    }

    /**
     * EMContactManager
     * @return
     */
    public EMContactManager getContactManager() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getContactManager();
    }

    /**
     * EMGroupManager
     * @return
     */
    public EMGroupManager getGroupManager() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getEMClient().groupManager();
    }

    /**
     * EMChatRoomManager
     * @return
     */
    public EMChatRoomManager getChatRoomManager() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getChatroomManager();
    }


    /**
     * EMPushManager
     * @return
     */
    public EMPushManager getPushManager() {
        return com.qingkouwei.handyinstruction.DemoHelper.getInstance().getPushManager();
    }

    /**
     * init room
     */
    public void initDb() {
        DemoDbHelper.getInstance(DemoApplication.getInstance()).initDb(getCurrentUser());
    }

    /**
     * EmUserDao
     * @return
     */
    public EmUserDao getUserDao() {
        return DemoDbHelper.getInstance(DemoApplication.getInstance()).getUserDao();
    }

    /**
     * get MsgTypeManageDao
     * @return
     */
    public MsgTypeManageDao getMsgTypeManageDao() {
        return DemoDbHelper.getInstance(DemoApplication.getInstance()).getMsgTypeManageDao();
    }

    /**
     * get invite message dao
     * @return
     */
    public InviteMessageDao getInviteMessageDao() {
        return DemoDbHelper.getInstance(DemoApplication.getInstance()).getInviteMessageDao();
    }

    /**
     * 在主线程执行
     * @param runnable
     */
    public void runOnMainThread(Runnable runnable) {
        EaseThreadManager.getInstance().runOnMainThread(runnable);
    }

    /**
     * 在异步线程
     * @param runnable
     */
    public void runOnIOThread(Runnable runnable) {
        EaseThreadManager.getInstance().runOnIOThread(runnable);
    }

    public Context getContext() {
        return DemoApplication.getInstance().getApplicationContext();
    }

}
