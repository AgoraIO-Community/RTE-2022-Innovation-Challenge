using System.Collections;
using System.Collections.Generic;
using RenderHeads.Media.AVProVideo;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Video;
public delegate void MapWorkDetailCallback (MarkItem markItem, WorkItem workItem);

public class MapWorkDetail : MonoBehaviour {
    public GameObject parent;
    public Text workId;
    public Text eyeId;
    public Text eyePhone;
    public Text lastCall;
    public Text pilotId;
    public Text pilotPhone;
    public Text startTime;
    public Text endTime;
    public Text netInfo;
    public Text netDelays;
    public Button close;
    public MediaPlayer mediaPlayer;
    public RawImage preImg;
    public Text[] aiText;
    Texture2D tempTex;
    Texture2D nativeTexture;
    Vector3 nativeScale;
    MarkItem markItem;
    WorkItem workItem;
    public YoloDetectedCallback detectedCallback;
    bool changed = false;
    // Start is called before the first frame update
    void OnEnable () {

    }
    void Start () {
        nativeTexture = new Texture2D (1920, 1080, TextureFormat.RGB24, false);
        close.onClick.AddListener (Close);
    }
    //托管函数
    public void InitItem (MarkItem markItem, WorkItem workItem) {
        this.markItem = markItem;
        this.workItem = workItem;
        changed = true;
    }
    void SetText () {
        PilotItem pilot = SQLiteManager.Instance.FindPilotDetail (workItem.pilotId);
        UserItem user = SQLiteManager.Instance.FindUserByEyeDetail (workItem.eyeId);
        InitItem (markItem.workId, user.userPhone, user.userName, pilot.pilotPhone, pilot.pilotName, markItem.endTime,
            markItem.statTime, markItem.endTime, markItem.netInfo, markItem.netDelay, markItem.videoUrl);
    }
    public void InitItem (string wl_num, string eye_phone, string eye_name, string pilot_phone, string pilot_name, string last_call, string wd_start_time, string wl_end_time,
        string wd_net_info, string wd_net_delay, string wd_video_url) {
        workId.text = wl_num;
        eyeId.text = eye_name;
        eyePhone.text = eye_phone;
        lastCall.text = last_call;
        pilotId.text = pilot_name;
        pilotPhone.text = pilot_phone;
        startTime.text = wd_start_time;
        endTime.text = wl_end_time;
        netInfo.text = wd_net_info;
        netDelays.text = wd_net_delay;
        //   
        mediaPlayer.Control.MuteAudio (true);
        mediaPlayer.OpenVideoFromFile (MediaPlayer.FileLocation.RelativeToProjectFolder, wd_video_url, true);
    }
    public void Close () {
        mediaPlayer.Stop ();
        mediaPlayer.CloseVideo ();
        parent.SetActive (false);
    }
    // Update is called once per frame
    void Update () {
        if (changed) {
            changed = false;
            SetText ();
            parent.SetActive (true);
        }
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
                    DetectedCallback (container, nativeTexture, nativeTexture.width, nativeTexture.height);
                }
            }

            preImg.texture = nativeTexture;
        }

        preImg.transform.localScale = nativeScale;

    }
    public void DetectedCallback (YoloWrapper.BboxContainer container, Texture2D srcTex, int mWidth, int mHeight) {
        nativeTexture = srcTex;
        for (int i = 0; i < container.size; i++) {
            if (container.candidates[i].w != 0 && container.candidates[i].h != 0) {
                string name = RTCGameManager.rtcYoloManager.GetYolo ().getVOCName (container.candidates[i].obj_id);
                string aiInfo = "物体：" + name + "   起点：" + container.candidates[i].x + "  终点" + container.candidates[i].y + "    宽度：" + container.candidates[i].w + "   高度：" + container.candidates[i].h;
                aiText[i % 2].text = aiInfo;
            }
        }
    }
}