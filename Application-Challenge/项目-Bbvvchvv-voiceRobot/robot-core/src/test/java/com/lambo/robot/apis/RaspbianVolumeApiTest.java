package com.lambo.robot.apis;

import junit.framework.TestCase;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 测试.
 * Created by lambo on 2017/7/29.
 */
public class RaspbianVolumeApiTest extends TestCase {

    public void testGetCurrVolume() throws Exception {
        String text = "Simple mixer control 'PCM',0\n" +
                "  Capabilities: pvolume pvolume-joined pswitch pswitch-joined\n" +
                "  Playback channels: Mono\n" +
                "  Limits: Playback -10239 - 400\n" +
                "  Mono: Playback -662 [90%] [-6.62dB] [on]";
        Pattern compile = Pattern.compile("\\[([0-9]+)%\\]");
        Matcher matcher = compile.matcher(text);
        if (matcher.find()) {
            System.out.println(matcher.group(1));
        }
    }
}