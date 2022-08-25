package com.lambo.robot;

import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.apis.impl.BaiDuVoiceApi;
import com.lambo.robot.apis.IVoiceApi;
import com.lambo.robot.apis.impl.TuLingRobotApi;
import com.lambo.robot.apis.IMusicNetApi;
import com.lambo.robot.apis.music.Music163NetApi;
import com.lambo.robot.kits.BeepPlayer;
import org.ho.yaml.Yaml;

import javax.sound.sampled.AudioFormat;
import java.io.FileNotFoundException;
import java.io.InputStream;

/**
 * 配置.
 * Created by lambo on 2017/7/23.
 */
public class RobotConfig {
    public BaseConfig robot;
    public SnowBoyUser[] snowBoyUsers;
    public BaiDuYuYin baiDuYuYin;
    public TuLing tuLing;
    public Integer webPort = 8080;

    public static class SnowBoyUser {
        public String uid;
        public String name;
        public float sensitivity = 0.5f;
        public String voiceModel;

        @Override
        public String toString() {
            return "SnowBoyUser{" +
                    "uid='" + uid + '\'' +
                    ", name='" + name + '\'' +
                    '}';
        }
    }

    public static class TuLing {
        public String appKey;
    }

    public static class BaiDuYuYin {
        public String appId;
        public String appKey;
        public String secretKey;
        public int per = 0;
    }

    public static class BaseConfig {
        public String name = "小宝小宝";
        public String welcome = "使用‘%s’唤醒我吧.";
        public String robot;
        public int sampleRate = 16000;
        public int listeningTimeOut = 1000;
        public double voiceNoiseFloat = 0.8;
        public Integer voiceOptimization = 0;
        public Integer recordPlay = 0;
    }

    private BeepPlayer beepPlayer = new BeepPlayer();
    private BaiDuVoiceApi baiDuVoiceApi;
    private TuLingRobotApi tuLingRobotApi;
    private AudioFormat recordAudioFormat;

    public void init() {
        if (null != baiDuYuYin) {
            baiDuVoiceApi = new BaiDuVoiceApi(baiDuYuYin.appId, baiDuYuYin.appKey, baiDuYuYin.secretKey);
        }

        if (null != tuLing && null != tuLing.appKey) {
            tuLingRobotApi = new TuLingRobotApi(tuLing.appKey);
        }

        if (null == robot) {
            robot = new BaseConfig();
        }
        recordAudioFormat = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, robot.sampleRate, 16, 1, 2, robot.sampleRate, false);
    }

    public int getBaiDuYuYinPer() {
        return baiDuYuYin.per;
    }

    public String getWelcomeMsg() {
        return String.format(robot.welcome, robot.name);
    }

    public IVoiceApi getVoiceApi() {
        return baiDuVoiceApi;
    }

    public AudioFormat getRecordAudioFormat() {
        return recordAudioFormat;
    }

    public TuLingRobotApi getTuLingRobotApi() {
        return tuLingRobotApi;
    }

    /**
     * 未说话的时长多久为采集录音结束. 使用1.5s作为结束.
     *
     * @return 毫秒.
     */
    public int getListeningTimeOut() {
        return robot.listeningTimeOut;
    }

    public int getUnSpeakTimes(float sampleRate, int readLength) {
        return (int) (sampleRate * 2 / readLength + 1) * getListeningTimeOut() / 1000;
    }

    /**
     * 周围环境的杂音幅度值.在获取到最大声音后再加上此值作为新的声音.
     *
     * @return
     */
    public double getVoiceNoiseFloat() {
        return robot.voiceNoiseFloat;
    }

    public IMusicNetApi getMusicNetApi() {
        return new Music163NetApi();
    }

    public BeepPlayer getBeepPlayer() {
        return beepPlayer;
    }

    public static RobotConfig getRobotConfig(InputStream inputStream) throws FileNotFoundException {
        RobotConfig config = Yaml.loadStreamOfType(inputStream, RobotConfig.class).next();
        config.init();
        return config;
    }

    public static RobotConfig getRobotConfig(String path) throws FileNotFoundException {
        InputStream inputStream = IOKit.getInputStream(path);
        RobotConfig robotConfig = RobotConfig.getRobotConfig(inputStream);
        IOKit.closeIo(inputStream);
        return robotConfig;
    }
}
