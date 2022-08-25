package com.lambo.robot.apis;

import com.lambo.los.kits.Strings;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.apis.impl.BaiDuVoiceApi;
import javazoom.jl.decoder.JavaLayerException;
import javazoom.jl.player.advanced.AdvancedPlayer;
import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;

/**
 * test.
 * Created by lambo on 2017/7/21.
 */
public class BaiDuVoiceApiTest {
    BaiDuVoiceApi baiDuVoice = new BaiDuVoiceApi("", "这里需要appKey", "");//这里需要写key

    @Test
    public void testAsr() throws IOException {
        byte[] data = IOKit.readToByteBuffer(IOKit.getInputStream("classpath:/test.pcm"));
        String content = baiDuVoice.asr("test", 8000, data);
        Assert.assertEquals("百度语音提供技术支持，", Strings.trimQuotes(content));
        IOKit.readToByteBuffer(IOKit.getInputStream("classpath:/test.pcm"));
        content = baiDuVoice.asr("test", 8000, data);
        Assert.assertEquals("百度语音提供技术支持，", Strings.trimQuotes(content));
    }

    @Test
    public void testTts() throws IOException {
        byte[] tts = baiDuVoice.tts("test", "百度语音提供技术支持");
        Assert.assertTrue(tts.length > 0);
    }

    //    @Test
    @Ignore
    public void testTtsPlay() throws IOException {
        byte[] tts = baiDuVoice.tts("test", "百度语音提供技术支持");
        Assert.assertTrue(tts.length > 0);
        try {
            AdvancedPlayer player = new AdvancedPlayer(new ByteArrayInputStream(tts));
            player.play();
        } catch (JavaLayerException e) {
            e.printStackTrace();
        }
    }
}