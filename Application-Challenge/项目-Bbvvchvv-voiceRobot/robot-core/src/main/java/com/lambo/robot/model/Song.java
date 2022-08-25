package com.lambo.robot.model;

/**
 * 歌曲.
 * Created by lambo on 2017/8/5.
 */
public class Song {

    /**
     * 歌曲id.
     */
    private String songId;

    /**
     * 曲名.
     */
    private String title;

    /**
     * 艺术家.
     */
    private String artists;

    /**
     * 类型. 163.网易，ting 百度一听.
     */
    private String type;

    public Song() {
    }

    public Song(String songId, String title, String artists, String type) {
        this.songId = songId;
        this.title = title;
        this.artists = artists;
        this.type = type;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtists() {
        return artists;
    }

    public void setArtists(String artists) {
        this.artists = artists;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Song song = (Song) o;

        return !(songId != null ? !songId.equals(song.songId) : song.songId != null);

    }

    @Override
    public int hashCode() {
        return songId != null ? songId.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Song{" +
                "songId='" + songId + '\'' +
                ", title='" + title + '\'' +
                ", artists='" + artists + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
