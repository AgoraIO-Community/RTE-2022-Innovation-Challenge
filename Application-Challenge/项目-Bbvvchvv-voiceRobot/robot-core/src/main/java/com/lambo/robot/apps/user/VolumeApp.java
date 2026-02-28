package com.lambo.robot.apps.user;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.apis.IVolumeApi;
import com.lambo.robot.apis.impl.LinuxVolumeApi;
import com.lambo.robot.apps.MsgTypeBaseApp;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.SpeakMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * web应用服务器.
 * Created by Administrator on 2017/7/25.
 */
public class VolumeApp extends MsgTypeBaseApp {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final IVolumeApi volumeApi;

    public VolumeApp() {
        super(MsgTypeEnum.hear);
        logger.info("init VolumeApp osName = {}", System.getProperty("os.name"));
        if (System.getProperty("os.name").trim().equalsIgnoreCase("linux")) {
            this.volumeApi = new LinuxVolumeApi();
        } else {
            this.volumeApi = null;
        }
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> msg) {
        if (null == volumeApi) {
            return false;
        }
        int setVolume = -1;
        String content = (String) msg.getContent();
        if (content.startsWith("音量")) {
            String volume = content.substring(2).trim();
            setVolume = chineseNumber2Int(volume);
            if (setVolume > 100) {
                setVolume = 100;
            }
            if (setVolume < 0) {
                setVolume = 0;
            }
        }
        if (content.equals("大声") || content.equals("大点声") || content.equals("大声点")) {
            int volume = volumeApi.getVolume();
            setVolume = 3 + volume;
            if (setVolume > 100) {
                appContext.addMsg(new SpeakMsg("已经最大声了"));
                return true;
            }
        }
        if (content.equals("小声") || content.equals("小点声") || content.equals("小声点")) {
            int volume = volumeApi.getVolume();
            setVolume = volume - 3;
            if (setVolume < 10) {
                appContext.addMsg(new SpeakMsg("已经只有10%的音量了"));
                return true;
            }
        }
        if (setVolume > 0) {
            boolean state = volumeApi.setVolume(setVolume);
            if (state) {
                appContext.addMsg(new SpeakMsg("已经为您调整音量到：" + setVolume));
            }
            return state;
        }
        return false;
    }

    @Override
    public void interrupt() {
    }

    /**
     * 中文數字转阿拉伯数组【十万九千零六十  --> 109060】
     *
     * @param chineseNumber
     * @return
     * @author 雪见烟寒
     */
    private int chineseNumber2Int(String chineseNumber) {
        int result = 0;
        int temp = 1;//存放一个单位的数字如：十万
        int count = 0;//判断是否有chArr
        char[] cnArr = new char[]{'一', '二', '三', '四', '五', '六', '七', '八', '九'};
        char[] chArr = new char[]{'十', '百', '千', '万', '亿'};
        for (int i = 0; i < chineseNumber.length(); i++) {
            boolean b = true;//判断是否是chArr
            char c = chineseNumber.charAt(i);
            for (int j = 0; j < cnArr.length; j++) {//非单位，即数字
                if (c == cnArr[j]) {
                    if (0 != count) {//添加下一个单位之前，先把上一个单位值添加到结果中
                        result += temp;
                        temp = 1;
                        count = 0;
                    }
                    // 下标+1，就是对应的值
                    temp = j + 1;
                    b = false;
                    break;
                }
            }
            if (b) {//单位{'十','百','千','万','亿'}
                for (int j = 0; j < chArr.length; j++) {
                    if (c == chArr[j]) {
                        switch (j) {
                            case 0:
                                temp *= 10;
                                break;
                            case 1:
                                temp *= 100;
                                break;
                            case 2:
                                temp *= 1000;
                                break;
                            case 3:
                                temp *= 10000;
                                break;
                            case 4:
                                temp *= 100000000;
                                break;
                            default:
                                break;
                        }
                        count++;
                    }
                }
            }
            if (i == chineseNumber.length() - 1) {//遍历到最后一个字符
                result += temp;
            }
        }
        return result;
    }
}
