package com.lambo.robot.model;

import com.lambo.los.kits.io.IOKit;
import org.ho.yaml.Yaml;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 播放列表.
 * Created by lambo on 2017/8/5.
 */
public class MusicPlayList {

    /**
     * 歌曲列表.
     */
    private final List<Song> localPlayList = new ArrayList<>();

    /**
     * 歌曲列表.
     */
    private final List<Song> playList = new ArrayList<>();

    /**
     * 当前索引号.
     */
    private final AtomicInteger index = new AtomicInteger(0);

    private final File localCacheName = new File(".local.music.cache");

    public MusicPlayList() {
        InputStream in =null;
        try {
            in = new FileInputStream(localCacheName);
            Song[] objects = Yaml.loadStreamOfType(in, Song[].class).next();
            if (null != objects) {
                localPlayList.addAll(Arrays.asList(objects));
            }
        } catch (Exception ignored) {
        }finally {
            IOKit.closeIo(in);
        }
    }

    public void setPlayList(List<Song> playList) {
        index.set(0);
        this.playList.clear();
        if (null != playList && !playList.isEmpty()) {
            this.playList.addAll(playList);
        }
    }

    public Song save() {
        Song song = curr(0);
        if (null != song && !localPlayList.contains(song)) {
            localPlayList.add(song);
            if (!localCacheName.exists()){
                try {
                    localCacheName.createNewFile();
                } catch (IOException ignored) {
                }
            }
            try {
                Yaml.dump(localPlayList, localCacheName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return song;
    }

    public int incrementAndGet() {
        return index.incrementAndGet();
    }
    public int decrementAndGet() {
        int i = index.decrementAndGet();
        if (i < 0){
            i = 0;
            index.set(i);
        }
        return i;
    }

    public Song curr(int step) {
        return !playList.isEmpty() ? playList.get((index.get() + step)% playList.size()) : null;
    }

    public List<Song> getLocalPlayList() {
        return localPlayList;
    }

    public List<Song> getPlayList() {
        return playList;
    }

    public Song delete() {
        Song song = curr(0);
        if (null != song && localPlayList.contains(song)) {
            localPlayList.remove(song);
            if (!localCacheName.exists()){
                try {
                    localCacheName.createNewFile();
                } catch (IOException ignored) {
                }
            }
            try {
                Yaml.dump(localPlayList, localCacheName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return song;
    }
    final Random random = new Random();
    public void random() {
        if (!playList.isEmpty()) {
            int len = playList.size();
            Song[] songs = playList.toArray(new Song[len]);
            Song tmp;
            for (int i = 0; i < len; i++) {//进行自动排序.
                int idx = random.nextInt(len);
                tmp = songs[i];
                songs[i] = songs[idx];
                songs[idx] = tmp;
            }
            setPlayList(Arrays.asList(songs));
        }
    }
}
