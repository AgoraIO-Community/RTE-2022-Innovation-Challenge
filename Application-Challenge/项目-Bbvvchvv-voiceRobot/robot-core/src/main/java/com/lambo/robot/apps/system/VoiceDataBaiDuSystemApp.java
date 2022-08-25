package com.lambo.robot.apps.system;

import com.lambo.los.kits.Strings;
import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotConfig;
import com.lambo.robot.apis.IVoiceApi;
import com.lambo.robot.kits.AudioPlayer;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.VoiceData;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.SpeakMsg;
import com.lambo.robot.model.msgs.VoiceDataMsg;

import javax.sound.sampled.LineUnavailableException;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;

/**
 * 语音转换应用.
 * Created by lambo on 2017/7/25.
 */
public class VoiceDataBaiDuSystemApp extends BaseDriverApp {

    private final IVoiceApi voiceApi;

    public VoiceDataBaiDuSystemApp(IVoiceApi voiceApi) {
        super(MsgTypeEnum.voiceData);
        this.voiceApi = voiceApi;
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        VoiceDataMsg voiceDataMsg = (VoiceDataMsg) robotMsg;
        VoiceData voiceData = voiceDataMsg.getContent();
        processVoiceData(voiceData, appContext.getRobotConfig());
        String asr = voiceApi.asr(voiceDataMsg.getUid(), voiceData.getAudioFormat().getSampleRate(), "pcm", voiceData.getData());
        asr = Strings.trimQuotes(asr);
        if (Strings.isBlank(asr) || Strings.isBlank(asr.replace("，", ""))) {
            appContext.addMsg(new SpeakMsg("我没有听到什么，语音识别失败。"));
            return true;
        }
        if (asr.endsWith("，")) {
            asr = asr.substring(0, asr.length() - 1);
        }
        appContext.addMsg(new HearMsg(asr));
        return true;
    }

    private final AudioPlayer audioPlayer = new AudioPlayer();

    private void processVoiceData(VoiceData voiceData, RobotConfig robotConfig) {
        if (robotConfig.robot.voiceOptimization > 1) {
            byte[] bytes = voiceData.getData();
            ShortBuffer shortBuffer = ByteBuffer.wrap(bytes).asShortBuffer();
            short[] array = new short[bytes.length / 2];
            shortBuffer.get(array);
            ByteBuffer dst = ByteBuffer.allocate(bytes.length);
            for (short src : array) {
                dst.putShort((short) (src * robotConfig.robot.voiceOptimization));
            }
            voiceData.setData(dst.array());
        }
        if (robotConfig.robot.recordPlay > 0) {
            try {
                audioPlayer.playPCM(voiceData.getAudioFormat(), voiceData.getData());
            } catch (LineUnavailableException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void interrupt() {
    }
}
