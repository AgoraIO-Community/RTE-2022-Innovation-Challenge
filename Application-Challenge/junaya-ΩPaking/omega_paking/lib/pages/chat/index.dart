import 'package:flutter/material.dart';
import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:agora_rtc_engine/rtc_local_view.dart' as RtcLocalView;
import 'package:agora_rtc_engine/rtc_remote_view.dart' as RtcRemoteView;
import 'package:flutter_svg/flutter_svg.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';

const appId = "f295a2fc38ea4fc1aa76511d2dee7b3b";
const token = "006f295a2fc38ea4fc1aa76511d2dee7b3bIABQfCZyJ6he8psQ2AnfNpsE+63OFIrI6ylLkqjixP4gtXTrHHIAAAAAEACOhaHH0lTzYgEAAQDRVPNi";
const channel = "aya";

class ChatPage extends StatefulWidget {
  const ChatPage({Key? key}) : super(key: key);

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  int? _remoteUid;
  bool _localUserJoined = false;
  bool _enableAudio = true;
  bool _enableVideo = true;
  late RtcEngine _engine;


  void _incrementCounter() async {
    await initAgora();
  }

  Future<void> initAgora() async {
    // retrieve permissions
    await [Permission.microphone, Permission.camera].request();

    //create the engine
    _engine = await RtcEngine.create(appId);
    _engine.setEventHandler(
      RtcEngineEventHandler(
        joinChannelSuccess: (String channel, int uid, int elapsed) {
          print("local user $uid joined");
          setState(() {
            _localUserJoined = true;
          });
        },
        userJoined: (int uid, int elapsed) {
          print("remote user $uid joined");
          setState(() {
            _remoteUid = uid;
          });
        },
        userOffline: (int uid, UserOfflineReason reason) {
          print("remote user $uid left channel");
          setState(() {
            _remoteUid = null;
          });
        },
        userMuteVideo: (int uid, bool muted) {
          print("userMuteVideo user $uid muted $muted");
          setState(() {
            _enableVideo = muted;
          });
        },
      ),
    );

    await _engine.joinChannel(token, channel, null, 0);
    await _engine.enableVideo();
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
  
  _switchCamera() {
    _engine.switchCamera();
  }

  @override
  void initState() {
    super.initState();
    initAgora();
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ElevatedButton.styleFrom(
      textStyle: const TextStyle(fontSize: 10),
      padding: const EdgeInsets.all(0),
      maximumSize: const Size.square(48),
      minimumSize: const Size.square(48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(60)),
    );

    return Provider.value(
      value: this,
      child: Scaffold(
        body: Stack(
          children: [
            Center(
              child: _remoteVideo(),
            ),
            Align(
              alignment: Alignment.topLeft,
              child: Container(
                width: 100,
                height: 150,
                child: Center(
                  child: _enableVideo
                    ? RtcLocalView.SurfaceView()
                    : CircularProgressIndicator(),
                ),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              bottom: 0,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
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
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: _incrementCounter,
          tooltip: 'Increment',
          child: const Icon(Icons.add),
        ), // This trailing comma makes auto-formatting nicer for build methods.
      )
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
