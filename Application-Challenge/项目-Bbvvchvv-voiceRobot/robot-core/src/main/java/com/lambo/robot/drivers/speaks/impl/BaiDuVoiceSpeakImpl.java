package com.lambo.robot.drivers.speaks.impl;

import com.lambo.robot.apis.IVoiceApi;
import com.lambo.robot.drivers.speaks.ISpeak;
import com.lambo.robot.kits.AudioPlayer;
import com.lambo.robot.kits.JavaLayerPlayer;
import com.lambo.robot.model.msgs.SpeakMsg;
import javazoom.jl.player.advanced.PlaybackListener;

import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * 百度
 * Created by lambo on 2017/7/23.
 */
public class BaiDuVoiceSpeakImpl implements ISpeak {
    private final ConcurrentLinkedQueue<JavaLayerPlayer> players = new ConcurrentLinkedQueue<>();
    private final IVoiceApi voiceApi;

    public BaiDuVoiceSpeakImpl(IVoiceApi voiceApi) {
        this.voiceApi = voiceApi;
    }

    @Override
    public void interrupt() {
        if (!players.isEmpty()) {
            players.forEach(JavaLayerPlayer::stop);
        }
    }

    @Override
    public void say(SpeakMsg speakMsg) throws Exception {
        byte[] tts = voiceApi.tts(speakMsg.getUid(), speakMsg.getContent());
        JavaLayerPlayer player = new AudioPlayer().playMP3(tts);
        players.add(player);
        player.play();
        players.remove(player);
    }
}
