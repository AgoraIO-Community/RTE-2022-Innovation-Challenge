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

  bool isJoined = false, switchCamera = true, switchRender = true;
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

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
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
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ElevatedButton(
          onPressed: isJoined ? _leaveChannel : _joinChannel,
          child: Text('${isJoined ? 'Leave' : 'Join'} channel'),
        ),
        if (Platform.isAndroid || Platform.isIOS)
          ElevatedButton(
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
