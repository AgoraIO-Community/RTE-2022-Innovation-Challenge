package com.qingkouwei.handyinstruction.common.db.dao;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import com.qingkouwei.handyinstruction.common.db.entity.AppKeyEntity;
import java.util.List;

@Dao
public interface AppKeyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    List<Long> insert(AppKeyEntity... keys);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    List<Long> insert(List<AppKeyEntity> keys);

    @Query("select * from app_key  order by timestamp asc")
    List<AppKeyEntity> loadAllAppKeys();

    @Query("delete from app_key where appKey = :arg0")
    void deleteAppKey(String arg0);

    @Query("select * from app_key where appKey = :arg0")
    List<AppKeyEntity> queryKey(String arg0);
}
