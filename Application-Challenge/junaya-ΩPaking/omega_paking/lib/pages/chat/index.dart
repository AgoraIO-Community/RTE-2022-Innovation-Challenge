import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:agora_rtc_engine/rtc_local_view.dart' as RtcLocalView;
import 'package:agora_rtc_engine/rtc_remote_view.dart' as RtcRemoteView;
import 'package:omega_paking/config/agora.config.dart' as config;
import 'package:flutter_svg/flutter_svg.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';

const channel = "aya";

class ChatPage extends StatefulWidget {
  const ChatPage({Key? key}) : super(key: key);

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final RtcEngine _engine;
  
  int? _remoteUid;
  bool _localUserJoined = false;
  bool _enableAudio = true;
  bool _enableVideo = true;
  bool isJoined = false;
  bool switchCamera = true;
  bool switchRender = true;
  List<int> remoteUid = [];

  late TextEditingController _controller;
  bool _isRenderSurfaceView = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: config.channelId);
    _initEngine();
  }

  @override
  void dispose() {
    super.dispose();
    _engine.destroy();
  }

  Future<void> _initEngine() async {
    _engine = await RtcEngine.createWithContext(RtcEngineContext(config.appId));
    _addListeners();

    await _engine.enableVideo();
    await _engine.startPreview();
    await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    await _engine.setClientRole(ClientRole.Broadcaster);
  }
  
  void _addListeners() {
    _engine.setEventHandler(RtcEngineEventHandler(
      warning: (warningCode) {
        print('warning $warningCode');
      },
      error: (errorCode) {
        print('error $errorCode');
      },
      joinChannelSuccess: (channel, uid, elapsed) {
        print('joinChannelSuccess $channel $uid $elapsed');
        setState(() {
          isJoined = true;
        });
      },
      userJoined: (uid, elapsed) {
        print('userJoined  $uid $elapsed');
        setState(() {
          remoteUid.add(uid);
        });
      },
      userOffline: (uid, reason) {
        print('userOffline  $uid $reason');
        setState(() {
          remoteUid.removeWhere((element) => element == uid);
        });
      },
      leaveChannel: (stats) {
        print('leaveChannel ${stats.toJson()}');
        setState(() {
          isJoined = false;
          remoteUid.clear();
        });
      },
    ));
  }
  
  _joinChannel() async {
    if (Platform.isAndroid && Platform.isIOS) {
      await [Permission.microphone, Permission.camera].request();
    }

    await _engine.joinChannel(config.token, _controller.text, null, config.uid);
  }

  _leaveChannel() async {
    await _engine.leaveChannel();
  }

  _switchCamera() {
    _engine.switchCamera().then((value) {
      setState(() {
        switchCamera = !switchCamera;
      });
    }).catchError((err) {
      print('switchCamera $err');
    });
  }

  _switchRender() {
    setState(() {
      switchRender = !switchRender;
      remoteUid = List.of(remoteUid.reversed);
    });
  }

  _toggleEnableAudio() {
    print('############### _toggleEnableAudio :::');
    setState(() {
      _enableAudio = !_enableAudio;
    });
    _engine.muteLocalAudioStream(_enableAudio);
  }

  _toggleEnableVideo() {
    print('############### _toggleEnableVideo :::');
    _engine.muteLocalVideoStream(!_enableVideo);
  }

  @override
  Widget build(BuildContext context) {
    return Provider.value(
      value: this,
      child: Scaffold(
        body: Stack(
          children: [
            _renderVideo(context),
            _renderControls(context),
          ],
        ),
      )
    );
  }

  /// button group control
  Widget _renderControls(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 10),
      padding: const EdgeInsets.all(0),
      maximumSize: const Size.square(48),
      minimumSize: const Size.square(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(60)),
    );
    return Positioned(
      top: 0,
      left: 0,
      bottom: 0,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
            onPressed: _joinChannel,
            style: style,
            child: Text("Join"),
          ),
          ElevatedButton(
            onPressed: _leaveChannel,
            style: style,
            child: Text("Leave"),
          ),
          ElevatedButton(
            onPressed: _toggleEnableAudio,
            style: style,
            child: _enableAudio ? SvgPicture.asset("assets/icons/mic_off.svg", width: 24, height: 24, color: Colors.white): SvgPicture.asset("assets/icons/mic_off.svg", width: 24, height: 24, color: Colors.white),
          ),
          ElevatedButton(
            onPressed: _toggleEnableVideo,
            style: style,
            child: SvgPicture.asset(_enableVideo ? "assets/icons/video_camera_on.svg" : "assets/icons/video_camera_off.svg", width: 24, height: 24, color: Colors.white),
          ),
          if (Platform.isIOS || Platform.isAndroid)
            ElevatedButton(
              onPressed: _switchCamera,
              style: style,
              child: SvgPicture.asset("assets/icons/video_switch.svg", width: 24, height: 24, color: Colors.white),
            ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: style,
            child: const Text("Pop")
          ),
        ],
      ),
    );
  }

  Widget _renderVideo(BuildContext context) {
    return Expanded(
      child: Stack(
        children: [
          Container(
            child: (kIsWeb || _isRenderSurfaceView)
                ? const RtcLocalView.SurfaceView(
                    zOrderMediaOverlay: true,
                    zOrderOnTop: true,
                  )
                : const RtcLocalView.TextureView(),
          ),
          Align(
            alignment: Alignment.topLeft,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.of(remoteUid.map(
                  (e) => GestureDetector(
                    onTap: _switchRender,
                    child: SizedBox(
                      width: 120,
                      height: 120,
                      child: (kIsWeb || _isRenderSurfaceView)
                          ? RtcRemoteView.SurfaceView(
                              uid: e,
                              channelId: _controller.text,
                            )
                          : RtcRemoteView.TextureView(
                              uid: e,
                              channelId: _controller.text,
                            ),
                    ),
                  ),
                )),
              ),
            ),
          )
        ],
      ),
    );
  }
  
  // Display remote user's video
  Widget _remoteVideo() {
    if (_remoteUid != null) {
      return RtcRemoteView.SurfaceView(
        uid: _remoteUid!,
        channelId: channel,
      );
    } else {
      return Text(
        'Please wait for remote user to join',
        textAlign: TextAlign.center,
      );
    }
  }
}
