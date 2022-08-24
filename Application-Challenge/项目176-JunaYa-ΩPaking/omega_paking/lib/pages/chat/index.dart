import 'dart:io';

import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:agora_rtc_engine/rtc_local_view.dart' as rtc_local_view;
import 'package:agora_rtc_engine/rtc_remote_view.dart' as rtc_remote_view;
import 'package:omega_paking/config/agora.config.dart' as config;
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:omega_paking/_internal/components/spacing.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';


/// MultiChannel Example
class ChatPage extends StatefulWidget {
  /// Construct the [ChatPage]
  const ChatPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final RtcEngine _engine;

  bool isJoined = false;
  bool switchCamera = true;
  bool switchRender = true;
  bool isMuteVideo = false;
  bool isMuteAudio = false;
  List<int> remoteUid = [];
  late TextEditingController _controller;
  bool _isRenderSurfaceView = false;
  bool _isEnabledVirtualBackgroundImage = false;
  bool playEffect = false;
  bool openMicrophone = true;

  bool screenSharing = false;
  int _selectedDisplayId = -1;
  int _selectedWindowId = -1;
  List<MediaDeviceInfo> recordings = [];
  String _selectedLoopBackRecordingDeviceName = "";
  List<Display> displays = [];
  List<Window> windows = [];

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
    await _enumerateDisplayAndWindow();
    await _enumerateRecording();
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

  // 仅在远程可以生效，本地无效果
  Future<void> _enableVirtualBackground() async {
    print('_enableVirtualBackground');
    ByteData data = await rootBundle.load("assets/images/img1.jpg");
    List<int> bytes =  data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);

    Directory appDocDir = await getApplicationDocumentsDirectory();
    String p = path.join(appDocDir.path, 'img1.jpg');
    final file = File(p);
    if (!(await file.exists())) {
      await file.create();
      await file.writeAsBytes(bytes);
    }

    await _engine.enableVirtualBackground(
        !_isEnabledVirtualBackgroundImage,
        VirtualBackgroundSource(
            backgroundSourceType: VirtualBackgroundSourceType.Img, source: p));
    setState(() {
      _isEnabledVirtualBackgroundImage = !_isEnabledVirtualBackgroundImage;
    });
  }

  _switchEffect() async {
    if (playEffect) {
      _engine.stopEffect(1).then((value) {
        setState(() {
          playEffect = false;
        });
      }).catchError((err) {
        print('stopEffect $err');
      });
    } else {
      final path = (await _engine.getAssetAbsolutePath("assets/audios/Sound_Horizon.mp3"))!;
      _engine.playEffect(1, path, 0, 1, 1, 100, openMicrophone).then((value) {
        setState(() {
          playEffect = true;
        });
      }).catchError((err) {
        print('playEffect $err');
      });
    }
  }

    Future<void> _enumerateDisplayAndWindow() async {
    if (!(Platform.isWindows || Platform.isMacOS)) {
      return;
    }
    final windows = _engine.enumerateWindows();
    final displays = _engine.enumerateDisplays();
    setState(() {
      this.windows = windows;
      this.displays = displays;
    });
  }

  Widget _displayDropDown() {
    if (displays.isEmpty || !(Platform.isWindows || Platform.isMacOS)) {
      return Container();
    }
    final dropDownMenus = <DropdownMenuItem<int>>[];
    dropDownMenus.add(const DropdownMenuItem(
      child: Text('please select display id'),
      value: -1,
    ));
    for (var v in displays) {
      dropDownMenus.add(DropdownMenuItem(
        child: Text('Display:${v.id}'),
        value: v.id,
      ));
    }
    return DropdownButton<int>(
      items: dropDownMenus,
      value: _selectedDisplayId,
      onChanged: (v) {
        setState(() {
          _selectedDisplayId = v!;
          _selectedWindowId = -1;
        });
      },
    );
  }

  Widget _windowDropDown() {
    if (windows.isEmpty || !(Platform.isWindows || Platform.isMacOS)) {
      return Container();
    }
    final dropDownMenus = <DropdownMenuItem<int>>[];
    dropDownMenus.add(const DropdownMenuItem(
      child: Text('ID'),
      value: -1,
    ));
    for (var v in windows) {
      dropDownMenus.add(DropdownMenuItem(
        child: Text('ID'),
        value: v.id,
      ));
    }
    return DropdownButton<int>(
      items: dropDownMenus,
      value: _selectedWindowId,
      icon: const Icon(Icons.arrow_downward),
      elevation: 16,
      style: const TextStyle(color: Colors.deepPurple),
      onChanged: (v) {
        setState(() {
          _selectedWindowId = v!;
          _selectedDisplayId = -1;
        });
      },
    );
  }

  Future<void> _enumerateRecording() async {
    if (!(Platform.isWindows || Platform.isMacOS)) {
      return;
    }
    final recordings =
        await _engine.deviceManager.enumerateAudioRecordingDevices();

    setState(() {
      this.recordings = recordings;
    });
  }

  Widget _loopBackRecordingDropDown() {
    if (recordings.isEmpty || !(Platform.isWindows || Platform.isMacOS)) {
      return Container();
    }
    final dropDownMenus = <DropdownMenuItem<String>>[];
    dropDownMenus.add(const DropdownMenuItem(
      child: Text('select loopBackRecording(Optional)'),
      value: "",
    ));
    for (var v in recordings) {
      dropDownMenus.add(DropdownMenuItem(
        child: Text('Window:${v.deviceName}'),
        value: v.deviceName,
      ));
    }
    return DropdownButton<String>(
      items: dropDownMenus,
      value: _selectedLoopBackRecordingDeviceName,
      onChanged: (v) {
        setState(() {
          _selectedLoopBackRecordingDeviceName = v!;
        });
      },
    );
  }

  _startScreenShare() async {
    if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
      const ScreenAudioParameters parametersAudioParams = ScreenAudioParameters(
        100,
      );
      const VideoDimensions videoParamsDimensions = VideoDimensions(
        width: 1280,
        height: 720,
      );
      const ScreenVideoParameters parametersVideoParams = ScreenVideoParameters(
        dimensions: videoParamsDimensions,
        frameRate: 15,
        bitrate: 1000,
        contentHint: VideoContentHint.Motion,
      );
      const ScreenCaptureParameters2 parameters = ScreenCaptureParameters2(
        captureAudio: true,
        audioParams: parametersAudioParams,
        captureVideo: true,
        videoParams: parametersVideoParams,
      );

      await _engine.startScreenCaptureMobile(parameters);
    } else if (Platform.isWindows || Platform.isMacOS) {
      if (_selectedDisplayId != -1) {
        await _engine.startScreenCaptureByDisplayId(
          _selectedDisplayId,
        );
        await _engine.enableAudio();
        await _engine.enableLoopbackRecording(true,
            deviceName: _selectedLoopBackRecordingDeviceName);
      } else if (_selectedWindowId != -1) {
        await _engine.startScreenCaptureByWindowId(_selectedWindowId);
        await _engine.enableAudio();
        await _engine.enableLoopbackRecording(true,
            deviceName: _selectedLoopBackRecordingDeviceName);
      } else {
        return;
      }
    }

    setState(() {
      screenSharing = true;
    });
  }

  _stopScreenShare() async {
    await _engine.stopScreenCapture();
    setState(() {
      screenSharing = false;
      _selectedDisplayId = -1;
      _selectedWindowId = -1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
      children: [
        Container(
          child: _renderVideo(),
        ),
        Positioned(
          top: 0,
          right: 16,
          bottom: 0,
          child: _groupButtons(),
        ),
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // _loopBackRecordingDropDown(),
            ]
          ),
        ),
        Positioned(
          bottom: 16,
          left: 16,
          child: ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
              padding: const EdgeInsets.all(0),
              maximumSize: const Size.square(48),
              minimumSize: const Size.square(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(60)),
            ),
            child: Icon(Icons.exit_to_app, color: Colors.white,),
          ),
        )
      ],
    ));
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
          child: Text(isJoined ? 'Leave' : 'Join', style: TextStyle(color: Colors.white),),
        ),
        const VSpace(8),
        ElevatedButton(
          style: style,
          onPressed: _toggleMuteVideoLocal,
          child: isMuteVideo 
            ? SvgPicture.asset('assets/icons/video_camera_off.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'UnmutedVideo')
            : SvgPicture.asset('assets/icons/video_camera_on.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'MutedVideo')
        ),
        const VSpace(8),
        ElevatedButton(
          style: style,
          onPressed: _toggleMuteAudioLocal,
          child: isMuteAudio
            ? SvgPicture.asset('assets/icons/mic_off.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'UnmutedAudio')
            : SvgPicture.asset('assets/icons/mic.svg', color: Colors.white, height: 24, width: 24, semanticsLabel: 'MutedAudio')
        ),
        const VSpace(8),
        ElevatedButton(
          style: style,
          onPressed: isJoined ? _switchEffect : null,
          child: playEffect ? const Icon(Icons.image_rounded) : const Icon(Icons.image_not_supported_rounded)
        ),
        const VSpace(8),
        ElevatedButton(
          style: style,
          onPressed: isJoined ? _enableVirtualBackground : null,
          child: _isEnabledVirtualBackgroundImage
            ? SvgPicture.asset('assets/icons/icon_virtual_bg.svg', color: Colors.white, height: 24, width: 24)
            : SvgPicture.asset('assets/icons/icon_virtual_bg.svg', color: Colors.white, height: 24, width: 24)
        ),
        const VSpace(8),
        if (Platform.isAndroid || Platform.isIOS)
          ElevatedButton(
            style: style,
            onPressed: _switchCamera,
            child: SvgPicture.asset('assets/icons/video_switch.svg', height: 24, width: 24, color: switchCamera ? Colors.white : Colors.black),
          ),
        if (!(Platform.isAndroid || Platform.isIOS))
          ElevatedButton(
            style: style,
            onPressed: screenSharing ? _stopScreenShare : _startScreenShare,
            child: screenSharing 
              ? SvgPicture.asset('assets/icons/icon_screenshare_stop.svg', height: 24, width: 24, color: Colors.white)
              : SvgPicture.asset('assets/icons/icon_screenshare_start.svg', height: 24, width: 24, color: Colors.white),
          ),
        if (!(Platform.isAndroid || Platform.isIOS))
          _windowDropDown()
      ]
    );
  }

  Widget _localVideo() {
    return (kIsWeb || _isRenderSurfaceView)
      ? const rtc_local_view.SurfaceView(
          zOrderMediaOverlay: true,
          zOrderOnTop: true,
        )
      : rtc_local_view.TextureView(
          renderMode: VideoRenderMode.Fit,
      );
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
          Align(
            alignment: Alignment.topLeft,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 1),
                      borderRadius: BorderRadius.circular(120),
                      color: Colors.black.withOpacity(0.8),
                    ),
                    child: _localVideo(),
                  ),
                  ...List.of(remoteUid.map(
                  (e) => GestureDetector(
                    onTap: _switchRender,
                    child: Container(
                      width: 120,
                      height: 120,
                      clipBehavior: Clip.antiAlias,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.white, width: 1),
                        borderRadius: BorderRadius.circular(60),
                      ),
                      child: _remoteVideo(e, _controller.text),
                    ),
                  ),
                )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
