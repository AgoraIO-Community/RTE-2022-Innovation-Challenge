package com.lambo.robot.kits;

import com.lambo.los.kits.ThreadKit;
import com.lambo.los.kits.io.IOKit;
import javazoom.jl.decoder.JavaLayerException;
import org.junit.Test;

import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.IOException;
import java.io.InputStream;

/**
 * test.
 * Created by lambo on 2017/7/21.
 */
public class AudioPlayerTest {
    AudioPlayer player = new AudioPlayer();

    @Test
    public void testPlayMP3() throws IOException, JavaLayerException {
        InputStream inputStream = IOKit.getInputStream("classpath:/canon.mp3");
        byte[] bytes = IOKit.readToByteBuffer(inputStream);
        player.playMP3(bytes).play();
        IOKit.closeIo(inputStream);
    }

    @Test
    public void testPlayWAV() throws IOException, JavaLayerException, LineUnavailableException, UnsupportedAudioFileException {
        InputStream inputStream = IOKit.getInputStream("classpath:/beep_hi.wav");
        byte[] bytes = IOKit.readToByteBuffer(inputStream);
        player.playWAV(bytes);
        IOKit.closeIo(inputStream);
        ThreadKit.sleep(3000);
        inputStream = IOKit.getInputStream("classpath:/beep_lo.wav");
        bytes = IOKit.readToByteBuffer(inputStream);
        player.playWAV(bytes);
        IOKit.closeIo(inputStream);
    }

    @Test
    public void testPlayPCM() throws IOException, LineUnavailableException, UnsupportedAudioFileException {
//        AudioFormat audioFormat = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, 8000, 16, 1, 2, 8000, false);
        InputStream inputStream = IOKit.getInputStream("classpath:/test.pcm");
        byte[] bytes = IOKit.readToByteBuffer(inputStream);
        player.playWAV(bytes);
        IOKit.closeIo(inputStream);
    }
}