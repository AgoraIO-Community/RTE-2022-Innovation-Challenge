package com.lambo.robot.apps.user;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.apis.IMusicNetApi;
import com.lambo.robot.apps.MsgTypeBaseApp;
import com.lambo.robot.kits.MusicAudioPlayer;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.Song;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.SpeakMsg;
import com.lambo.robot.model.msgs.SystemMsg;
import javazoom.jl.decoder.JavaLayerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;

/**
 * 网络音乐播放应用..
 * Created by lambo on 2017/7/24.
 */
public class MusicNetPlayApp extends MsgTypeBaseApp {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final MusicAudioPlayer player;
    private final IMusicNetApi musicNetApi;

    public MusicNetPlayApp(IMusicNetApi musicNetApi) {
        super(MsgTypeEnum.hear);
        this.musicNetApi = musicNetApi;
        this.player = new MusicAudioPlayer();
    }

    @Override
    public void interrupt() {
        if (this.player.getState() == 1) { //播放时进行暂停.
            this.player.pause();
        }
    }

    @Override
    public void handleSystemMsg(RobotSystemContext systemContext, SystemMsg msg) {
        super.handleSystemMsg(systemContext, msg);
        if (msg.getContent() == SystemMsgContentEnum.interruptReset && this.player.getState() == 2) {
            try {
                this.player.play();
            } catch (IOException | JavaLayerException ignored) {
            }
        }
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> msg) throws Exception {
        String content = (String) msg.getContent();
        if (content.contains("保存")) {
            Song save = this.player.save();
            if (null != save) {
                appContext.say(new SpeakMsg("保存歌曲"+save.getArtists() + "的"+ save.getTitle()+ "成功"));
                return true;
            }
            return false;
        }
        if (content.contains("删除")) {
            Song song = this.player.delete();
            if (null != song) {
                appContext.say(new SpeakMsg("删除歌曲"+song.getArtists() + "的"+ song.getTitle()+ "成功"));
                return true;
            }
            return false;
        }

        if (content.contains("什么歌")) {
            Song song = this.player.getCurrSong();
            if (null != song) {
                appContext.say(new SpeakMsg("当前播放的歌曲是："+song.getArtists() + "的"+ song.getTitle()));
                return true;
            }
            appContext.say(new SpeakMsg("当前没有歌曲在播放"));
            return true;
        }

        if (content.contains("播放本地")) {
            this.player.stop();
            this.player.load();
            content = "播放音乐";
        }

        if (content.contains("随机播放") || content.contains("打乱歌单")) {
            this.player.stop();
            this.player.random();
            content = "播放音乐";
        }

        if (content.contains("播放音乐") || content.startsWith("音乐")) {
            if (!this.player.hasMusic()) {
                appContext.addMsg(new SpeakMsg("播放器歌单暂时没有音乐"));
                return true;
            }
            Song song = player.getCurrSong();
            appContext.say(new SpeakMsg("即将播放音乐：" + song.getArtists() + " 的 " + song.getTitle()));
            this.player.play();
            return true;
        }

        if (content.contains("停止播放")) {
            this.player.stop();
            appContext.say(new SpeakMsg("停止音乐成功"));
            return true;
        }
        if (content.contains("上一首歌") || content.contains("上首歌")) {
            if (!this.player.hasMusic()) {
                appContext.say(new SpeakMsg("播放器歌单暂时没有音乐"));
                return true;
            }
            Song song = player.getPrevSong();
            appContext.say(new SpeakMsg("即将播放音乐：" + song.getArtists() + " 的 " + song.getTitle()));
            this.player.prev();
            return true;
        }

        if (content.contains("下一首歌") || content.contains("下首歌") || content.contains("切歌")) {
            if (!this.player.hasMusic()) {
                appContext.say(new SpeakMsg("播放器歌单暂时没有音乐"));
                return true;
            }
            Song next = player.getNextSong();
            appContext.say(new SpeakMsg("即将播放音乐：" + next.getArtists() + " 的 " + next.getTitle()));
            this.player.next();
            return true;
        }
        if (content.startsWith("播放") && content.length() > 3) {
            String musicName = content.substring(content.indexOf("播放") + 2);
            return search(appContext, musicName);
        }

        if (content.contains("我要听") && content.length() >= (content.indexOf("我要听") + 4)) {
            String musicName = content.substring(content.indexOf("我要听") + 3);
            return search(appContext, musicName);
        }

        if (content.contains("搜索") && (content.contains("音乐") || content.contains("歌曲"))) {
            appContext.say(new SpeakMsg("请在叮的一声后说出您的关键字."));
            HearMsg hearEvent;
            try {
                hearEvent = appContext.listening();
                if (!hearEvent.isSuccess()) {
                    logger.info("search listening failed, hearEvent = {}", hearEvent);
                    appContext.say(new SpeakMsg("没有听清你的关键字，搜索失败！"));
                    return true;
                }
            } catch (Exception e) {
                logger.error("listening search key failed, ", e);
                appContext.addMsg(new SpeakMsg("没有听到内容, 搜索失败"));
                return true;
            }
            return search(appContext, hearEvent.getContent());
        }
        return false;
    }

    private boolean search(RobotAppContext appContext, String content) throws Exception {
        appContext.say(new SpeakMsg("正在为您搜索：" + content));
        List<Song> search = this.musicNetApi.search(content, 50, 0);
        if (null == search || search.isEmpty()) {
            appContext.say(new SpeakMsg("没有搜索结果，搜索失败！"));
            return true;
        }
        for (Song song : search) {
            logger.debug(song.getArtists() + " == " + song.getTitle());
        }
        appContext.say(new SpeakMsg("总共搜索到 " + search.size() + " 首歌曲。"));
        this.player.setPlayList(search);
        appContext.say(new SpeakMsg("即将播放音乐：" + search.get(0).getArtists() + " 的 " + search.get(0).getTitle()));
        this.player.stop();
        this.player.play();
        return true;
    }
}
