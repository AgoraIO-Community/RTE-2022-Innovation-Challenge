import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/message/mixin_chat.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../services/agora.dart';
import 'get_house_controller.dart';

class WatchLiveController extends GetXHouseController with ChatMixin {
  WatchLiveController(super.house);

  @override
  String get role => 'subscriber';

  bool get isLocalAudioMuted => _mute.value;
  final _mute = true.obs;

  final textController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    _setupRtcEngine().then((value) {
      _join();
    });
  }

  Future<void> _setupRtcEngine() async {
    //  创建 RTC 客户端实例
    final rtcContext = RtcEngineContext(agoraAPPID);

    engine = await RtcEngine.createWithContext(rtcContext);
    info("RTCEngine created.");

    addListeners();

    info("prepare for streaming");
    // 设置频道场景为直播
    await engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    info('channelProfile: LiveBroadcasting');

    // 设置用户角色为观众
    // 暂时有疑问，如果是观众的话， 没办法连麦
    await engine.setClientRole(ClientRole.Broadcaster);
    info("clientRole: Broadcaster");

    engineDidInit(true);

    info('engine did init');

    await engine.enableVideo();

    await engine.muteLocalAudioStream(_mute.value);
  }

  void _join() async {
    info('start join channel ...');
    final token = await fetchToken(role: role);

    engine.joinChannel(
      token,
      channel,
      null,
      uid,
      ChannelMediaOptions(
        publishLocalAudio: true,
        publishLocalVideo: false,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      ),
    );
  }

  void onTapVoiceButton() async {
    final tc = loading();
    await engine.muteLocalAudioStream(!_mute.value);
    _mute.toggle();
    tc.dismiss();
  }

  void send(String text) async {
    if (text.isEmpty) {
      FocusManager.instance.primaryFocus?.unfocus();
      return;
    }

    sendTextMessage(text);

    textController.text = "";
    info(text);
  }
}
