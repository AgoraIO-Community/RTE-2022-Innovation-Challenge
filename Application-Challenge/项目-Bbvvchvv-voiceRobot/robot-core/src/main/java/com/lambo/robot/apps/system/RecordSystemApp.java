package com.lambo.robot.apps.system;

import com.lambo.robot.RobotAppContext;
import com.lambo.robot.drivers.records.IRecord;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.VoiceData;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.msgs.VoiceDataMsg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sound.sampled.LineUnavailableException;
import java.util.concurrent.TimeoutException;

/**
 * 录音的应用.
 * Created by lambo on 2017/7/24.
 */
public class RecordSystemApp extends BaseDriverApp {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final IRecord record;

    public RecordSystemApp(IRecord record) {
        super(MsgTypeEnum.listening);
        this.record = record;
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> robotMsg) throws Exception {
        VoiceDataMsg msg = recordVoiceDataMsg();
        msg.setUid("11");
        appContext.addMsg(msg);
        return true;
    }

    private VoiceDataMsg recordVoiceDataMsg() throws TimeoutException, InterruptedException {
        try {
            VoiceData voiceData = record.record();
            if (null == voiceData) {
                return new VoiceDataMsg(null).failed();
            }
            return new VoiceDataMsg(voiceData);
        } catch (LineUnavailableException e) {
            logger.error("has exception ", e);
            return new VoiceDataMsg(null).exception();
        }
    }
}
