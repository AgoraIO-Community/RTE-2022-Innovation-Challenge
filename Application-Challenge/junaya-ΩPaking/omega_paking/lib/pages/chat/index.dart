import 'dart:io';

import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:agora_rtc_engine/rtc_local_view.dart' as rtc_local_view;
import 'package:agora_rtc_engine/rtc_remote_view.dart' as rtc_remote_view;
import 'package:flutter_svg/svg.dart';
import 'package:omega_paking/config/agora.config.dart' as config;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

/// MultiChannel Example
class ChatPage extends StatefulWidget {
  /// Construct the [ChatPage]
  const ChatPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _State();
}

class _State extends State<ChatPage> {
  late final RtcEngine _engine;

  bool isJoined = false;
  bool switchCamera = true;
  bool switchRender = true;
  bool isMuteVideo = false;
  bool isMuteAudio = false;
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
      userMuteVideo: (uid, muted) {
        print('_toggleMuteVideoLocal  $uid $muted');
      }
    ));
  }

  _joinChannel() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
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

  _toggleMuteVideoLocal() {
    _engine.muteLocalVideoStream(!isMuteVideo);
    setState(() {
      isMuteVideo = !isMuteVideo;
    });
  }

  _toggleMuteAudioLocal() {
    _engine.muteLocalAudioStream(!isMuteAudio);
    setState(() {
      isMuteAudio = !isMuteAudio;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          child: _renderVideo(),
        ),
        Positioned(
          top: 0,
          right: 0,
          bottom: 0,
          child: _groupButtons(),
        ),
      ],
    );
  }

  Widget _groupButtons() {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
      padding: const EdgeInsets.all(0),
      maximumSize: const Size.square(48),
      minimumSize: const Size.square(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(60)),
    );
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ElevatedButton(
          onPressed: isJoined ? _leaveChannel : _joinChannel,
          style: style,
          child: Text(isJoined ? 'Leave' : 'Join'),
        ),
        ElevatedButton(
          style: style,
          onPressed: _toggleMuteVideoLocal,
          child: isMuteVideo 
            ? SvgPicture.asset('assets/icons/video_camera_off.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'UnmutedVideo')
            : SvgPicture.asset('assets/icons/video_camera_on.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'MutedVideo')
        ),
        ElevatedButton(
          style: style,
          onPressed: _toggleMuteAudioLocal,
          child: isMuteAudio
            ? SvgPicture.asset('assets/icons/mic_off.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'UnmutedAudio')
            : SvgPicture.asset('assets/icons/mic.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'MutedAudio')
        ),
        if (Platform.isAndroid || Platform.isIOS)
          ElevatedButton(
            style: style,
            onPressed: _switchCamera,
            child: SvgPicture.asset('assets/icons/video_switch.svg', color: switchCamera ? Colors.white : Colors.black),
          ),
       
      ]
    );
  }

  Widget _localVideo() {
    return (kIsWeb || _isRenderSurfaceView)
      ? const rtc_local_view.SurfaceView(
          zOrderMediaOverlay: true,
          zOrderOnTop: true,
        )
      : const rtc_local_view.TextureView();
  }

  Widget _remoteVideo(int uid, String channelId) {
    return (kIsWeb || _isRenderSurfaceView)
      ? rtc_remote_view.SurfaceView(
          uid: uid,
          channelId: channelId,
        )
      : rtc_remote_view.TextureView(
          uid: uid,
          channelId: channelId,
        );
  }

  Widget _renderVideo() {
    return Expanded(
      child: Stack(
        children: [
          Container(
            child: _localVideo(),
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
                      child: _remoteVideo(e, _controller.text),
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
}
