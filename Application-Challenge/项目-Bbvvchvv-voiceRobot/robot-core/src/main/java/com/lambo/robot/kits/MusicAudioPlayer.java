package com.lambo.robot.kits;

import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.apis.IMusicNetApi;
import com.lambo.robot.apis.music.BaiDuTingApi;
import com.lambo.robot.apis.music.Music163NetApi;
import com.lambo.robot.model.MusicPlayList;
import com.lambo.robot.model.Song;
import javazoom.jl.decoder.JavaLayerException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 百度一听的播放器.
 * Created by lambo on 2017/7/24.
 */
public class MusicAudioPlayer {
    private AudioPlayer audioPlayer = new AudioPlayer();
    private JavaLayerPlayer advancedPlayer = null;
    private int lastPosition = 0;
    private final MusicPlayList musicPlayList = new MusicPlayList();

    /**
     * 状态.0.初始。1.正在播放。2.暂停 3.停止.
     */
    private AtomicInteger state = new AtomicInteger(0);
    private final IMusicNetApi music163 = new Music163NetApi();
    private final IMusicNetApi ting = new BaiDuTingApi();


    public boolean hasMusic() {
        if (musicPlayList.getPlayList().isEmpty()){
            musicPlayList.setPlayList(musicPlayList.getLocalPlayList());
        }
        return !musicPlayList.getPlayList().isEmpty() || !musicPlayList.getLocalPlayList().isEmpty();
    }

    public int getState() {
        return state.get();
    }

    public void play() throws IOException, JavaLayerException {
        if (state.get() == 1) {
            return;
        }
        if (!hasMusic()) {
            return;
        }
        Song currSong = musicPlayList.curr(0);
        if (state.get() == 3) {
            lastPosition = 0;
        }
        if (null != advancedPlayer) {
            advancedPlayer.close();
        }
        final InputStream inputStream;
        if ("ting".equals(currSong.getType())) {
            inputStream = ting.getInputStream(getCurrSong());
        }else {
            inputStream = music163.getInputStream(getCurrSong());
        }
        if (null == inputStream){
            delete();
            next();
            return;
        }
        advancedPlayer = audioPlayer.playMP3(inputStream);
        state.set(1);
        new Thread() {
            @Override
            public void run() {
                try {
                    advancedPlayer.play(lastPosition, Integer.MAX_VALUE);
                    if (null != advancedPlayer && advancedPlayer.isComplete()) {//如果是正常播放停止的自动播放下一首。
                        lastPosition = 0;
                        MusicAudioPlayer.this.next();
                    }
                } catch (JavaLayerException | IOException ignored) {
                } finally {
                    IOKit.closeIo(inputStream);
                }
            }
        }.start();
    }

    public void pause() {
        state.set(2);
        lastPosition = 0;
        if (null != advancedPlayer) {
            advancedPlayer.close();
            lastPosition = advancedPlayer.getLastPosition();
        }
    }

    public void next() throws IOException, JavaLayerException {
        this.stop();
        if (hasMusic()) {
            musicPlayList.incrementAndGet();//执行下一页.
            this.play();
        }
    }

    public void stop() {
        state.set(3);
        if (null != advancedPlayer) {
            lastPosition = 0;
            advancedPlayer.close();
        }
        this.advancedPlayer = null;
    }

    public void setPlayList(List<Song> playList) {
        this.musicPlayList.setPlayList(playList);
    }

    public Song save() {
        return musicPlayList.save();
    }

    public Song getCurrSong() {
        return musicPlayList.curr(0);
    }

    public Song getNextSong() {
        return musicPlayList.curr(1);
    }

    public void load() {
        musicPlayList.setPlayList(musicPlayList.getLocalPlayList());
    }

    public Song delete() {
        return musicPlayList.delete();
    }

    public Song getPrevSong() {
        return musicPlayList.curr(-1);
    }

    public void prev() throws IOException, JavaLayerException {
        musicPlayList.decrementAndGet();
        musicPlayList.decrementAndGet();
        next();
    }

    public void random() {
        musicPlayList.random();
    }
}
