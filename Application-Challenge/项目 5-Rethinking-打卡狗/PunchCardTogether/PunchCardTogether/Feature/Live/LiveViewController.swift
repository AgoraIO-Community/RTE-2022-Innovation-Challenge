//
//  LiveViewController.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/21.
//

import UIKit
import AgoraRtcKit
import AGEVideoLayout
import SnapKit
import AgoraRtcKit
import Toast

class LiveViewController: UIViewController {
       
    var sessionButtons: [UIButton]!
    var roomName: String?
    
    private let menuView = LiveMenuView(frame: .zero)
    
    private lazy var broadcastersView: AGEVideoContainer = {
        let container = AGEVideoContainer(frame: .zero)
        container.backgroundColor = .black
        return container
    }()

    private let beautyOptions: AgoraBeautyOptions = {
        let options = AgoraBeautyOptions()
        options.lighteningContrastLevel = .normal
        options.lighteningLevel = 0.7
        options.smoothnessLevel = 0.5
        options.rednessLevel = 0.1
        return options
    }()
    
    private lazy var agoraKit: AgoraRtcEngineKit = {
        let engine = AgoraRtcEngineKit.sharedEngine(withAppId: AgoraKeyCenter.AppId, delegate: nil)
        engine.setLogFilter(AgoraLogFilter.info.rawValue)
        engine.setLogFile(FileCenter.logFilePath())
        engine.setBeautyEffectOptions(true,
                                        options: beautyOptions)
        return engine
    }()
    
    private var settings = Settings()

    private var isMutedVideo = false {
        didSet {
            // mute local video
            agoraKit.muteLocalVideoStream(isMutedVideo)
            menuView.videoButton.isSelected = isMutedVideo
        }
    }
    
    private var isMutedAudio = false {
        didSet {
            // mute local audio
            agoraKit.muteLocalAudioStream(isMutedAudio)
            menuView.audioButton.isSelected = isMutedAudio
        }
    }
    

    private var isSwitchCamera = false {
        didSet {
            agoraKit.switchCamera()
        }
    }
    
    private var videoSessions = [VideoSession]() {
        didSet {
            // update render view layout
            updateBroadcastersView()
        }
    }
    
    private let maxVideoSession = 10
        
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //打卡群
        self.settings.roomName = self.roomName
        
        layoutUI()
        
        updateButtonsVisiablity()
        loadAgoraKit()
        
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        self.leaveChannel()
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
    
    //MARK: - ui action
    @objc func doSwitchCameraPressed(_ sender: UIButton) {
        isSwitchCamera.toggle()
    }
    
    @objc func doMuteVideoPressed(_ sender: UIButton) {
        sender.isSelected = sender.isSelected
        isMutedVideo.toggle()
    }
    
    @objc func doMuteAudioPressed(_ sender: UIButton) {
        sender.isSelected = sender.isSelected
        isMutedAudio.toggle()
    }
    
    @objc func doLeavePressed(_ sender: UIButton) {
        leaveChannel()
    }
}

private extension LiveViewController {
    
    func layoutUI() {
            
        view.backgroundColor = .black
        
        self.navigationController?.isNavigationBarHidden = true
        
        view.addSubview(broadcastersView)
        view.addSubview(menuView)
        
        sessionButtons = []
        sessionButtons.append(menuView.swichButton)
        sessionButtons.append(menuView.videoButton)
        sessionButtons.append(menuView.audioButton)
        sessionButtons.append(menuView.leaveButton)

        
        broadcastersView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.top.equalTo(view.safeAreaLayoutGuide.snp.top)
            make.bottom.equalTo(menuView.snp.top)
        }
        
        menuView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.height.equalTo(100)
//            make.top.equalTo(broadcastersView.snp.bottom)
//            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom)
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom)

        }
        
        menuView.swichButton.addTarget(self, action: #selector(self.doSwitchCameraPressed(_:)),for: UIControl.Event.touchUpInside)
        menuView.videoButton.addTarget(self, action: #selector(self.doMuteVideoPressed(_:)), for: UIControl.Event.touchUpInside)
        menuView.audioButton.addTarget(self, action: #selector(self.doMuteAudioPressed(_:)), for: UIControl.Event.touchUpInside)
        menuView.leaveButton.addTarget(self, action: #selector(self.doLeavePressed(_:)), for: UIControl.Event.touchUpInside)
    }
    
    func updateBroadcastersView() {
        // video views layout
        if videoSessions.count == maxVideoSession {
            broadcastersView.reload(level: 0, animated: true)
        } else {
            var rank: Int
            var row: Int
            
            if videoSessions.count == 0 {
                broadcastersView.removeLayout(level: 0)
                return
            } else if videoSessions.count == 1 {
                rank = 1
                row = 1
            } else if videoSessions.count == 2 {
                rank = 1
                row = 2
            } else {
                rank = 2
                row = Int(ceil(Double(videoSessions.count) / Double(rank)))
            }
            
            let itemWidth = CGFloat(1.0) / CGFloat(rank)
            let itemHeight = CGFloat(1.0) / CGFloat(row)
            let itemSize = CGSize(width: itemWidth, height: itemHeight)
            let layout = AGEVideoLayout(level: 0)
                        .itemSize(.scale(itemSize))
            
            broadcastersView
                .listCount { [unowned self] (_) -> Int in
                    return self.videoSessions.count
                }.listItem { [unowned self] (index) -> UIView in
                    return self.videoSessions[index.item].hostingView
                }
            
            broadcastersView.setLayouts([layout], animated: true)
        }
    }
    
    func updateButtonsVisiablity() {
        guard let sessionButtons = sessionButtons else {
            return
        }
        
        let isHidden = settings.role == .audience
        
        for item in sessionButtons {
            item.isHidden = isHidden
        }
    }
    
    func setIdleTimerActive(_ active: Bool) {
        UIApplication.shared.isIdleTimerDisabled = !active
    }
}

private extension LiveViewController {
    func getSession(of uid: UInt) -> VideoSession? {
        for session in videoSessions {
            if session.uid == uid {
                return session
            }
        }
        return nil
    }
    
    func videoSession(of uid: UInt) -> VideoSession {
        if let fetchedSession = getSession(of: uid) {
            return fetchedSession
        } else {
            let newSession = VideoSession(uid: uid)
            videoSessions.append(newSession)
            return newSession
        }
    }
}

//MARK: - Agora Media SDK
private extension LiveViewController {
    func loadAgoraKit() {
        guard let channelId = settings.roomName else {
            return
        }
        setIdleTimerActive(false)
        
        // Step 1, set delegate to inform the app on AgoraRtcEngineKit events
        agoraKit.delegate = self
        // Step 2, set live broadcasting mode
        // for details: https://docs.agora.io/cn/Video/API%20Reference/oc/Classes/AgoraRtcEngineKit.html#//api/name/setChannelProfile:
        agoraKit.setChannelProfile(.liveBroadcasting)
        // set client role
        agoraKit.setClientRole(settings.role)
        
        // Step 3, Warning: only enable dual stream mode if there will be more than one broadcaster in the channel
        agoraKit.enableDualStreamMode(true)
        
        // Step 4, enable the video module
        agoraKit.enableVideo()
        // set video configuration
        agoraKit.setVideoEncoderConfiguration(
            AgoraVideoEncoderConfiguration(
                size: settings.dimension,
                frameRate: settings.frameRate,
                bitrate: AgoraVideoBitrateStandard,
                orientationMode: .adaptative, mirrorMode: .auto
            )
        )
        
        // if current role is broadcaster, add local render view and start preview
        if settings.role == .broadcaster {
            addLocalSession()
            agoraKit.startPreview()
        }
        
        // Step 5, join channel and start group chat
        // If join  channel success, agoraKit triggers it's delegate function
        // 'rtcEngine(_ engine: AgoraRtcEngineKit, didJoinChannel channel: String, withUid uid: UInt, elapsed: Int)'
        agoraKit.joinChannel(byToken: AgoraKeyCenter.Token, channelId: channelId, info: nil, uid: 0, joinSuccess: nil)
        
        // Step 6, set speaker audio route
        agoraKit.setEnableSpeakerphone(true)
    }
    
    func addLocalSession() {
        let localSession = VideoSession.localSession()
        localSession.updateInfo(fps: settings.frameRate.rawValue)
        videoSessions.append(localSession)
        agoraKit.setupLocalVideo(localSession.canvas)
    }
    
    func leaveChannel() {
        // Step 1, release local AgoraRtcVideoCanvas instance
        agoraKit.setupLocalVideo(nil)
        // Step 2, leave channel and end group chat
        agoraKit.leaveChannel(nil)
        
        // Step 3, if current role is broadcaster,  stop preview after leave channel
        if settings.role == .broadcaster {
            agoraKit.stopPreview()
        }
        
        setIdleTimerActive(true)
        
        navigationController?.popViewController(animated: true)
    }
}

// MARK: - AgoraRtcEngineDelegate
extension LiveViewController: AgoraRtcEngineDelegate {
    
    /// Occurs when the first local video frame is displayed/rendered on the local video view.
    ///
    /// Same as [firstLocalVideoFrameBlock]([AgoraRtcEngineKit firstLocalVideoFrameBlock:]).
    /// @param engine  AgoraRtcEngineKit object.
    /// @param size    Size of the first local video frame (width and height).
    /// @param elapsed Time elapsed (ms) from the local user calling the [joinChannelByToken]([AgoraRtcEngineKit joinChannelByToken:channelId:info:uid:joinSuccess:]) method until the SDK calls this callback.
    ///
    /// If the [startPreview]([AgoraRtcEngineKit startPreview]) method is called before the [joinChannelByToken]([AgoraRtcEngineKit joinChannelByToken:channelId:info:uid:joinSuccess:]) method, then `elapsed` is the time elapsed from calling the [startPreview]([AgoraRtcEngineKit startPreview]) method until the SDK triggers this callback.
    func rtcEngine(_ engine: AgoraRtcEngineKit, firstLocalVideoFrameWith size: CGSize, elapsed: Int) {
        if let selfSession = videoSessions.first {
            selfSession.updateInfo(resolution: size)
        }
    }
    
    /// Reports the statistics of the current call. The SDK triggers this callback once every two seconds after the user joins the channel.
    func rtcEngine(_ engine: AgoraRtcEngineKit, reportRtcStats stats: AgoraChannelStats) {
        if let selfSession = videoSessions.first {
            selfSession.updateChannelStats(stats)
        }
    }
    
    
    /// Occurs when the first remote video frame is received and decoded.
    /// - Parameters:
    ///   - engine: AgoraRtcEngineKit object.
    ///   - uid: User ID of the remote user sending the video stream.
    ///   - size: Size of the video frame (width and height).
    ///   - elapsed: Time elapsed (ms) from the local user calling the joinChannelByToken method until the SDK triggers this callback.
    func rtcEngine(_ engine: AgoraRtcEngineKit, firstRemoteVideoDecodedOfUid uid: UInt, size: CGSize, elapsed: Int) {
        guard videoSessions.count <= maxVideoSession else {
            return
        }
        
        let userSession = videoSession(of: uid)
        userSession.updateInfo(resolution: size)
    }

    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        guard videoSessions.count <= maxVideoSession else {
            return
        }

        let userSession = videoSession(of: uid)
        agoraKit.setupRemoteVideo(userSession.canvas)
    }
    
    /// Occurs when a remote user (Communication)/host (Live Broadcast) leaves a channel. Same as [userOfflineBlock]([AgoraRtcEngineKit userOfflineBlock:]).
    ///
    /// There are two reasons for users to be offline:
    ///
    /// - Leave a channel: When the user/host leaves a channel, the user/host sends a goodbye message. When the message is received, the SDK assumes that the user/host leaves a channel.
    /// - Drop offline: When no data packet of the user or host is received for a certain period of time (20 seconds for the Communication profile, and more for the Live-broadcast profile), the SDK assumes that the user/host drops offline. Unreliable network connections may lead to false detections, so Agora recommends using a signaling system for more reliable offline detection.
    ///
    ///  @param engine AgoraRtcEngineKit object.
    ///  @param uid    ID of the user or host who leaves a channel or goes offline.
    ///  @param reason Reason why the user goes offline, see AgoraUserOfflineReason.
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOfflineOfUid uid: UInt, reason: AgoraUserOfflineReason) {
        var indexToDelete: Int?
        for (index, session) in videoSessions.enumerated() where session.uid == uid {
            indexToDelete = index
            break
        }
        
        if let indexToDelete = indexToDelete {
            let deletedSession = videoSessions.remove(at: indexToDelete)
            deletedSession.hostingView.removeFromSuperview()
            
            // release canvas's view
            deletedSession.canvas.view = nil
        }
    }
    
    /// Reports the statistics of the video stream from each remote user/host.
    func rtcEngine(_ engine: AgoraRtcEngineKit, remoteVideoStats stats: AgoraRtcRemoteVideoStats) {
        if let session = getSession(of: stats.uid) {
            session.updateVideoStats(stats)
        }
    }
    
    /// Reports the statistics of the audio stream from each remote user/host.
    func rtcEngine(_ engine: AgoraRtcEngineKit, remoteAudioStats stats: AgoraRtcRemoteAudioStats) {
        if let session = getSession(of: stats.uid) {
            session.updateAudioStats(stats)
        }
    }
    
    /// Reports a warning during SDK runtime.
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurWarning warningCode: AgoraWarningCode) {
        print("warning code: \(warningCode.description)")
    }
    
    /// Reports an error during SDK runtime.
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
        print("warning code: \(errorCode.description)")
        self.view.makeToast("Token异常，请重新进入: \(errorCode.description)", duration: 3, position: CSToastPositionCenter)
    }
}
