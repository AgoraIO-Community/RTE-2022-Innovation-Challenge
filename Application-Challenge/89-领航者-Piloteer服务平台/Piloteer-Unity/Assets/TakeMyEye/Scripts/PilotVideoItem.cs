using System.Collections;
using System.Collections.Generic;
using agora_gaming_rtc;
using UnityEngine;
using UnityEngine.UI;

public class PilotVideoItem : MonoBehaviour {
    public GameObject pilotNavi;
    public GameObject pilotGoSurface;
    public ShowDetectVideo showDetect;
    public GameObject rtmMsg;
    public IconCtrl[] ctrls;
    // instance of agora engine
    private IRtcEngine mRtcEngine;
    private Text MessageText;
    uint currId = 0;
    WorkItem workItem;
    MarkItem markItem;
    // Start is called before the first frame update
    void Start () {
        mRtcEngine = IRtcEngine.QueryEngine ();
        if (mRtcEngine == null) {
            Debug.LogError ("请初始化引擎");
        }
        for (int i = 0; i < ctrls.Length; i++) {
            ctrls[i].SetListener (CommCtrls);
        }
    }
    void CommCtrls (IconType type, bool enable) {
        switch (type) {
            case IconType.TypeAudio:
                mRtcEngine.MuteLocalAudioStream (enable);
                break;
            case IconType.TypeClose:
                mRtcEngine.LeaveChannel ();
                pilotGoSurface.SetActive (false);
                break;
            case IconType.TypeHangup:
                mRtcEngine.LeaveChannel ();
                break;
            case IconType.TypeMessage:
                rtmMsg.SetActive (enable);
                break;
            case IconType.TypePlayaudio:
                mRtcEngine.MuteRemoteAudioStream (pilotGoSurface.GetComponent<VideoPilotSurface> ().getUid (), enable);
                break;
            case IconType.TypeVideo:
                mRtcEngine.MuteLocalVideoStream (enable);
                break;

        }
    }
    // Update is called once per frame
    void Update () {

    }
    void OnEnable () {

    }
    public void InitItem (MarkItem markItem, WorkItem workItem) {
        this.markItem = markItem;
        this.workItem = workItem;

        join (workItem.chartRoom);
        pilotNavi.SetActive (true);
    }
    public void JoinChanel () {
        join ("qq");
    }
    public void join (string channel) {
        Debug.Log ("calling join (channel = " + channel + ")");

        if (mRtcEngine == null)
            return;
        // set callbacks (optional)
        mRtcEngine.OnJoinChannelSuccess = onJoinChannelSuccess;
        mRtcEngine.OnUserJoined = onUserJoined;
        mRtcEngine.OnUserOffline = onUserOffline;
        mRtcEngine.OnWarning = (int warn, string msg) => {
            Debug.LogWarningFormat ("Warning code:{0} msg:{1}", warn, IRtcEngine.GetErrorDescription (warn));
        };
        mRtcEngine.OnError = HandleError;

        // enable video
        mRtcEngine.EnableVideo ();
        // allow camera output callback
        mRtcEngine.EnableVideoObserver ();

        // join channel
        mRtcEngine.JoinChannel (channel, null, 0);
    }
    private void OnDisable () {
        Debug.Log ("Leave");
        //  Leave();
    }
    public void Leave () {
        Debug.Log ("calling leave");

        if (mRtcEngine == null || currId == 0)
            return;
        // leave channel
        mRtcEngine.LeaveChannel ();
        // deregister video frame observers in native-c code
        mRtcEngine.DisableVideoObserver ();
    }
    public void Cancel () {

        Leave ();
    }
    public void EnableVideo (bool pauseVideo) {
        if (mRtcEngine != null) {
            if (!pauseVideo) {
                mRtcEngine.EnableVideo ();
            } else {
                mRtcEngine.DisableVideo ();
            }
        }
    }
    // implement engine callbacks
    private void onJoinChannelSuccess (string channelName, uint uid, int elapsed) {
        Debug.Log ("JoinChannelSuccessHandler: uid = " + uid);
    }
    // When a remote user joined, this delegate will be called. Typically
    // create a GameObject to render video on it
    private void onUserJoined (uint uid, int elapsed) {
        Debug.Log ("onUserJoined: uid = " + uid + " elapsed = " + elapsed);
        currId = uid;
        // this is called in main thread
        //    observer.AddObserver (c);
        CreateUser (uid);
    }
    void CreateUser (uint uid) {
        //   go.name = uid.ToString ();
        // set up transform
        VideoPilotSurface videoSurface; //= 
        // configure videoSurface
        if (!pilotGoSurface.GetComponent<VideoPilotSurface> ()) {
            pilotGoSurface.AddComponent<VideoPilotSurface> ();
        }
        videoSurface = pilotGoSurface.GetComponent<VideoPilotSurface> ();
        videoSurface.detectedCallback = showDetect.DetectedCallback;
        videoSurface.SetForUser (uid);
        videoSurface.SetEnable (true);
        videoSurface.SetVideoSurfaceType (AgoraVideoSurfaceType.RawImage);
        videoSurface.SetGameFps (30);
    }
    private const float Offset = 100;

    // When remote user is offline, this delegate will be called. Typically
    // delete the GameObject for this user
    private void onUserOffline (uint uid, USER_OFFLINE_REASON reason) {
        // remove video stream
        Debug.Log ("onUserOffline: uid = " + uid + " reason = " + reason);
        // this is called in main thread
        /* GameObject go = GameObject.Find (uid.ToString ());
         if (!ReferenceEquals (go, null)) {
             Object.Destroy (go);
         }*/
    }
    #region Error Handling
    private int LastError { get; set; }
    private void HandleError (int error, string msg) {
        if (error == LastError) {
            return;
        }

        msg = string.Format ("Error code:{0} msg:{1}", error, IRtcEngine.GetErrorDescription (error));

        switch (error) {
            case 101:
                msg += "\nPlease make sure your AppId is valid and it does not require a certificate for this demo.";
                break;
        }

        Debug.LogError (msg);
        if (MessageText != null) {
            if (MessageText.text.Length > 0) {
                msg = "\n" + msg;
            }
            MessageText.text += msg;
        }

        LastError = error;
    }

    #endregion
}