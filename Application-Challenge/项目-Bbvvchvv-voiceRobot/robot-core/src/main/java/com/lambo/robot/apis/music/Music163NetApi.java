package com.lambo.robot.apis.music;

import com.google.gson.Gson;
import com.lambo.los.http.client.HttpConnection;
import com.lambo.los.kits.Strings;
import com.lambo.los.kits.digest.DigestKit;
import com.lambo.robot.apis.IMusicNetApi;
import com.lambo.robot.model.Song;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 网易音乐api.
 * Created by lambo on 2017/7/26.
 */
public class Music163NetApi implements IMusicNetApi {
    Gson gson = new Gson();

    public static class SearchResult {
        public SearchResult result;//==
        public Integer songCount;
        public List<SearchResult> songs;//==
        public String id;
        public String name;
        public List<SearchResult> artists;//==
    }

    @Override
    public List<Song> search(String text, int limit, int offset) throws IOException {
        HttpConnection conn = HttpConnection.connect("http://music.163.com/api/search/pc");
        conn.data("s", text);
        conn.data("limit", limit + "");
        conn.data("type", 1 + "");// # 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002) *(type)*
        conn.data("offset", offset + "");
        conn.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36");
        HttpConnection.Response response = conn.method(HttpConnection.Method.POST).execute();
        if (response.statusCode() != 200) {
            return null;
        }
        SearchResult searchResult = gson.fromJson(response.body(), SearchResult.class);
        if (searchResult.result.songCount > 0) {
            return searchResult.result.songs.stream().map(song -> new Song(song.id,
                    song.name,
                    null != song.artists && !song.artists.isEmpty() ? song.artists.get(0).name : null,
                    "163")).collect(Collectors.toList());
        }
        return null;
    }

    @Override
    public InputStream getInputStream(Song song) throws IOException {
        String url = getPlayUrl(song.getSongId(), "320000");
        if ("null".equals(url)) {
            return null;
        }
        return new BufferedInputStream(new URL(url).openStream());
    }

    public String getPlayUrl(String songId, String br) throws IOException {
        String first_param = "{\"ids\":\"[" + songId + "]\",\"br\":" + br + ",\"csrf_token\":\"\"}";
        HttpConnection conn = HttpConnection.connect("http://music.163.com/weapi/song/enhance/player/url?csrf_token=");
        try {
            conn.data("params", getParams(first_param));
        } catch (Exception e) {
            throw new IOException(e);
        }
        conn.data("encSecKey", ENC_SEC_KEY);
        conn.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36");
        HttpConnection.Response response = conn.method(HttpConnection.Method.POST).execute();
        if (response.statusCode() != 200) {
            return null;
        }
        return Strings.getFromJson(response.body(), "url");
    }

    public static String ENC_SEC_KEY = "257348aecb5e556c066de214e531faadd1c55d814f9be95fd06d6bff9f4c7a41f831f6394d5a3fd2e3881736d94a02ca919d952872e7d0a50ebfa1769a7a62d512f5f1ca21aec60bc3819a9c3ffca5eca9a0dba6d6f7249b06f5965ecfff3695b54e1c28f3f624750ed39e7de08fc8493242e26dbc4484a01c76f739e135637c";

    public static String getParams(String text) throws Exception {
        String firstKey = "0CoJUm6Qyw8W8jud";
        String secondKey = "FFFFFFFFFFFFFFFF";
        String iv = "0102030405060708";
        String h_encText = DigestKit.aesEncrypt(text, firstKey, iv);
        h_encText = DigestKit.aesEncrypt(h_encText, secondKey, iv);
        return h_encText;
    }
}
