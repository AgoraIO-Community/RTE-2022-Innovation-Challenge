package com.lambo.robot.kits;

import javazoom.jl.decoder.JavaLayerException;

import javax.sound.sampled.*;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * 音频播放器.
 * Created by lambo on 2017/7/21.
 */
public class AudioPlayer {

    public JavaLayerPlayer playMP3(String songUrl) throws JavaLayerException, IOException {
        InputStream fin = new URL(songUrl).openStream();
        return playMP3(new BufferedInputStream(fin));
    }

    public JavaLayerPlayer playMP3(byte[] data) throws JavaLayerException {
        return playMP3(new ByteArrayInputStream(data));
    }

    public JavaLayerPlayer playMP3(InputStream inputStream) throws JavaLayerException {
        return new JavaLayerPlayer(inputStream);
    }

    public void playWAV(byte[] data) throws IOException, UnsupportedAudioFileException, LineUnavailableException {
        AudioInputStream ais = AudioSystem.getAudioInputStream(new ByteArrayInputStream(data));
        AudioFormat baseFormat = ais.getFormat();// 指定声音流中特定数据安排
        DataLine.Info info = new DataLine.Info(SourceDataLine.class, baseFormat);
        SourceDataLine line = (SourceDataLine) AudioSystem.getLine(info);
        // 从混频器获得源数据行
        line.open(baseFormat);// 打开具有指定格式的行，这样可使行获得所有所需的系统资源并变得可操作。
        line.start();// 允许数据行执行数据 I/O
        int BUFFER_SIZE = 4000 * 4;
        int intBytes = 0;
        byte[] audioData = new byte[BUFFER_SIZE];
        while (intBytes != -1) {
            intBytes = ais.read(audioData, 0, BUFFER_SIZE);// 从音频流读取指定的最大数量的数据字节，并将其放入给定的字节数组中。
            if (intBytes >= 0) {
                line.write(audioData, 0, intBytes);// 通过此源数据行将音频数据写入混频器。
            }
        }
        line.drain();
        line.close();
        ais.close();
    }

    public void playPCM(AudioFormat audioFormat, byte[] data) throws LineUnavailableException {
        DataLine.Info info = new DataLine.Info(SourceDataLine.class, audioFormat);
        SourceDataLine line = (SourceDataLine) AudioSystem.getLine(info);
        line.open();
        line.start();
        int nBytesRead;
        byte[] buffer = new byte[512];
        ByteArrayInputStream in = new ByteArrayInputStream(data);
        while (true) {
            nBytesRead = in.read(buffer, 0, buffer.length);
            if (nBytesRead <= 0)
                break;
            line.write(buffer, 0, nBytesRead);
        }
        line.drain();
        line.close();
    }
}
