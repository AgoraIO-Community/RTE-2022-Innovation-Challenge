using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;
using agora_gaming_rtc;
using RenderHeads.Media.AVProVideo;
using UnityEngine;
using UnityEngine.UI;
public class PilotDetail : MonoBehaviour {

    public RawImage preImg;
    public Texture2D tempTex;
    VideoType videoType = VideoType.VideoFile;
    DeviceItem device;

    public Texture2D nativeTexture;
    public Vector3 nativeScale;
    //  Thread workThread;
    bool start = false;

    public MediaPlayer mediaPlayer;
    Image selfBkg;
    public YoloDetectedCallback detectedCallback;
    // Start is called before the first frame update
    void Start () {
        selfBkg = GetComponent<Image> ();
        nativeTexture = new Texture2D (1920, 1080, TextureFormat.RGB24, false);

    }
    public void InitDeviceOther (string player) {
        mediaPlayer.m_VideoPath = player;
        mediaPlayer.Control.MuteAudio (true);
        mediaPlayer.OpenVideoFromFile (MediaPlayer.FileLocation.RelativeToProjectFolder, player, true);
    }
    public Texture2D GetSelfImage () {
        return tempTex;
    }
    // Update is called once per frame
    void Update () {
        int w = 0, h = 0;

        nativeScale = new Vector3 (1, 1, 1);
        if (mediaPlayer != null && mediaPlayer.Control.IsPlaying ()) {
            if (mediaPlayer.Info.GetVideoWidth () != nativeTexture.width || mediaPlayer.Info.GetVideoHeight () != nativeTexture.height) {
                nativeTexture = new Texture2D (mediaPlayer.Info.GetVideoWidth (), mediaPlayer.Info.GetVideoHeight (), TextureFormat.RGB24, false);
            }
            mediaPlayer.ExtractFrame (nativeTexture);
            if (nativeTexture != null) {
                byte[] imageBytes = nativeTexture.EncodeToJPG ();
                if (imageBytes != null) {
                    var container = RTCGameManager.rtcYoloManager.GetYolo ().Detect (imageBytes);
                    if (detectedCallback != null)
                        detectedCallback.Invoke (device, container, nativeTexture, nativeTexture.width, nativeTexture.height);
                }
            }

            preImg.texture = nativeTexture;
        }

        preImg.transform.localScale = nativeScale;

    }
    public void DetectedCallback (DeviceItem device, YoloWrapper.BboxContainer container, Texture2D srcTex, int mWidth, int mHeight) {
        nativeTexture = srcTex;
        if (detectedCallback != null)
            detectedCallback.Invoke (device, container, srcTex, mWidth, mHeight);
        for (int i = 0; i < container.size; i++) {
            Debug.Log (container.candidates[i].ToString () + "\r\n");
        }
    }
    private void OnDestroy () {
        //  if (workThread != null && workThread.IsAlive)
        //      workThread.Abort();
        //关闭
        //  if(yoloWrapper!=null)
        //   yoloWrapper.Dispose();
    }
}