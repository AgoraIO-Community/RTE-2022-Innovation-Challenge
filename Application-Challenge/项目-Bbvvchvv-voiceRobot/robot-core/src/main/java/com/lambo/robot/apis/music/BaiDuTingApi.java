package com.lambo.robot.apis.music;

import com.google.gson.Gson;
import com.lambo.los.http.client.HttpConnection;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.apis.IMusicNetApi;
import com.lambo.robot.kits.AudioPlayer;
import com.lambo.robot.model.Song;
import javazoom.jl.decoder.JavaLayerException;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 百度一听api.http://www.fddcn.cn/music-api-wang-yi-bai-du.html
 * Created by lambo on 2017/7/21.
 */
public class BaiDuTingApi implements IMusicNetApi {
    private final Gson json = new Gson();

    private String request(String method, String... args) throws IOException {
        String URL_REST_API = "http://tingapi.ting.baidu.com/v1/restserver/ting";
        HttpConnection connect = HttpConnection.connect(URL_REST_API);
        connect.ignoreContentType(true);
        connect.data("format", "json");//json|xml
        connect.data("from", "webapp_music");
        connect.data("version", "2.1.0");
        connect.data("method", method);
        for (int i = 0; i < args.length - 1; i++) {
            connect.data(args[i], args[++i]);
        }
        return connect.execute().body();
    }

    public static class SearchResult {
        public List<SearchResult> song;
        public String songid;
        public String songname;
        public String artistname;
    }

    @Override
    public List<Song> search(String text, int limit, int offset) {
        try {
            String jsonString = request("baidu.ting.search.catalogSug", "size", limit + "", "offset", offset + "", "query", text);
            List<SearchResult> songList = json.fromJson(jsonString, SearchResult.class).song;
            if (null == songList || songList.isEmpty()) {
                return null;
            }
            return songList.stream().map(song -> new Song(song.songid, song.songname, song.artistname, "ting")).collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public InputStream getInputStream(Song song) throws IOException {
        if (null == song){
            return null;
        }
        InputStream fin = new URL(getSong(song.getSongId()).songLink).openStream();
        return new BufferedInputStream(fin);
    }

    public static class BillListResult {
        public List<BillListResult> song_list;
        public String album_title;
        public String author;
        public String lrclink;
        public String song_id;
        public String title;
    }

    public List<Song> billList(int type, int size, int offset) {
        try {
            String jsonString = request("baidu.ting.billboard.billList ", "size", size + "", "offset", offset + "", "type", type + "");
            List<BillListResult> song_list = json.fromJson(jsonString, BillListResult.class).song_list;
            return song_list.stream().map(song -> new Song(song.song_id, song.title, song.album_title, "ting")).collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static class GetSongResult {
        private GetSongResult data;//==
        public List<GetSongResult> songList;//==
        public String artistName;
        public String format;
        public String lrcLink;
        public String songLink;
        public String songName;
    }

    private GetSongResult getSong(String songId) throws IOException {
            HttpConnection connection = HttpConnection.connect("http://music.baidu.com/data/music/links");
            connection.data("songIds", songId);
            String body = connection.ignoreContentType(true).execute().body();
            return json.fromJson(body, GetSongResult.class).data.songList.get(0);
    }

    public static void main(String[] args) throws IOException, JavaLayerException {
        BaiDuTingApi api = new BaiDuTingApi();
        AudioPlayer audioPlayer = new AudioPlayer();
        List<Song> songList = api.billList(2, 100, 0);
        for (Song song : songList) {
            System.out.println(song.getArtists() + "  ==  " + song.getTitle());
        }
        System.out.println("==========================================");
        for (Song song : songList) {
            System.out.println(song.getArtists() + "  ==  " + song.getTitle());
            InputStream inputStream = api.getInputStream(song);
            audioPlayer.playMP3(inputStream).play();
            IOKit.closeIo(inputStream);
        }
    }
}
