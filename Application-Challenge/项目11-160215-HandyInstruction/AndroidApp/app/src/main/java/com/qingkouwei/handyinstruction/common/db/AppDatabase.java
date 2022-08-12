package com.qingkouwei.handyinstruction.common.db;

import androidx.room.Database;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;
import com.qingkouwei.handyinstruction.common.db.converter.DateConverter;
import com.qingkouwei.handyinstruction.common.db.dao.AppKeyDao;
import com.qingkouwei.handyinstruction.common.db.dao.EmUserDao;
import com.qingkouwei.handyinstruction.common.db.dao.InviteMessageDao;
import com.qingkouwei.handyinstruction.common.db.dao.MsgTypeManageDao;
import com.qingkouwei.handyinstruction.common.db.entity.AppKeyEntity;
import com.qingkouwei.handyinstruction.common.db.entity.EmUserEntity;
import com.qingkouwei.handyinstruction.common.db.entity.InviteMessage;
import com.qingkouwei.handyinstruction.common.db.entity.MsgTypeManageEntity;

@Database(entities = {EmUserEntity.class,
        InviteMessage.class,
        MsgTypeManageEntity.class,
        AppKeyEntity.class},
        version = 17)
@TypeConverters(DateConverter.class)
public abstract class AppDatabase extends RoomDatabase {

    public abstract EmUserDao userDao();

    public abstract InviteMessageDao inviteMessageDao();

    public abstract MsgTypeManageDao msgTypeManageDao();

    public abstract AppKeyDao appKeyDao();
}
