package com.lambo.robot.kits;

import com.lambo.robot.apis.music.Music163NetApi;
import com.lambo.robot.model.Song;
import javazoom.jl.decoder.JavaLayerException;

import java.io.IOException;
import java.util.List;
import java.util.Scanner;

/**
 * test.
 * Created by lambo on 2017/7/29.
 */
public class MusicAudioPlayerTest {

    public static void main(String[] args) throws IOException, JavaLayerException {
        Music163NetApi music163NetApi = new Music163NetApi();
        MusicAudioPlayer audioPlayer = new MusicAudioPlayer();
        Scanner scanner = new Scanner(System.in);
        System.out.println("please write command hear.");
        List<Song> search = music163NetApi.search("徐菲", 10, 0);
        for (Song song : search) {
            System.out.println("list = " + song.getArtists() + " == " + song.getTitle());
        }
        search.remove(0);
        System.out.println("search size = " + search.size());
        audioPlayer.setPlayList(search);
        audioPlayer.play();

        while (scanner.hasNextLine()) {
            String text = scanner.nextLine();
            System.out.println("text = " + text);

            if (text.startsWith("next")) {
                audioPlayer.next();
            }
            if (text.startsWith("stop")) {
                audioPlayer.stop();
            }
            if (text.startsWith("play")) {
                audioPlayer.play();
            }
            if (text.startsWith("pause")) {
                audioPlayer.pause();
            }
        }
    }
}