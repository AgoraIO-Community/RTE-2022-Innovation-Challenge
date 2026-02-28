package com.lambo.robot.apis;

import com.lambo.robot.model.Song;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.util.List;

/**
 * 网络api.
 * Created by lambo on 2017/7/26.
 */
public interface IMusicNetApi {

    /**
     * 搜索歌曲.
     *
     * @param text 关键字.
     * @return
     */
    List<Song> search(String text, int limit, int offset) throws IOException;

    /**
     * 获取播放地址。
     * @return 地址流.
     */
    InputStream getInputStream(Song song) throws IOException;
}
