import 'dart:async';
import 'dart:io';

import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:home_indicator/home_indicator.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:super_rent/src/controllers/message/get_house_controller.dart';
import 'package:super_rent/src/controllers/message/upload.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/agora.dart';
import 'package:super_rent/src/services/leancloud.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../pages/message/upload.dart';
import 'mixin_chat.dart';

class LiveController extends GetXHouseController with ChatMixin {
  @override
  String get role => 'publisher';

  late final String _snapshotDirectory;
  final snapshotIndex = 0.obs;

  bool get cameraTorch => false;
  final _cameraTorch = false.obs;

  bool get localStreamIsMute => _mute.value;
  final _mute = false.obs;

  late final Timer timer;

  Duration get duration => _duration.value;
  final _duration = Duration.zero.obs;

  String? _recordingRef;
  final isRecording = false.obs;
  final takeSnapshotButtonDown = false.obs;

  @override
  LiveController(super.house);

  @override
  void onReady() {
    super.onReady();

    HomeIndicator.hide();
  }

  @override
  void onInit() async {
    super.onInit();
    // 获取权限
    await [Permission.microphone, Permission.camera].request();
    // 初始化引擎
    _setupRtcEngine();

    // 初始化计数器
    timer = Timer.periodic(const Duration(seconds: 1), _periodic);

    // 工作目录
    _setupSnapshotDirectory();
  }

  void _setupSnapshotDirectory() async {
    // 准备截图文件夹
    final appDocDir = await getApplicationDocumentsDirectory();
    final d = Directory(p.join(
      appDocDir.path,
      'snapshots',
      channel,
      DateTime.now().millisecondsSinceEpoch.toString(),
    ));

    await d.create(recursive: true);

    _snapshotDirectory = d.path;
  }

  void switchCamera() {
    engine.switchCamera();
    info("switch camera");
  }

  void takeSnapshot() async {
    if (takeSnapshotButtonDown.value) {
      return;
    }

    takeSnapshotButtonDown(true);

    final filePath = p.join(_snapshotDirectory, "${snapshotIndex.value}.jpg");

    await engine.takeSnapshot(channel, 0, filePath);

    Future.delayed(const Duration(seconds: 1))
        .then((value) => takeSnapshotButtonDown(false));
  }

  void toggleCameraTorch() async {
    await engine.setCameraTorchOn(!_cameraTorch.value);
    _cameraTorch.toggle();
  }

  void muteLocalStream() async {
    if (!isJoined.value) {
      return;
    }
    await engine.muteLocalVideoStream(!_mute.value);
    _mute.toggle();
  }

  Future<void> onTapRecord() async {
    assert(isJoined.value);

    final tc = loading();

    // 结束录制
    if (isRecording.value) {
      assert(_recordingRef != null);
      await API.stopRecord(_recordingRef!);
      isRecording(false);
      _recordingRef = null;
    } else {
      final result = await API.startRecord(
        channel: channel,
        houseObjectId: house.objectId!,
        chantRoomId: house.chatRoomId,
      );
      if (result.isError) {
        toast(error: "开始录制失败");
        return;
      }
      _recordingRef = result.asValue?.value;
      isRecording(true);
    }
    tc.dismiss();
  }

  // 添加水印
  Future<void> _addWatermark() async {
    final url = await watermarkPath();
    await engine.addVideoWatermark(
      url,
      WatermarkOptions(
        positionInPortraitMode: Rectangle(
          x: 50,
          y: MediaQuery.of(Get.context!).padding.top.toInt(),
          width: 200,
          height: 100,
        ),
      ),
    );

    info("watermark added");
  }

  void _setupRtcEngine() async {
    //  创建 RTC 客户端实例
    final rtcContext = RtcEngineContext(agoraAPPID);

    engine = await RtcEngine.createWithContext(rtcContext);
    info("RTCEngine created.");

    addListeners();

    // 关闭美颜
    await engine.setBeautyEffectOptions(false, BeautyOptions());
    info('disable beauty effect');

    await engine.setCameraCapturerConfiguration(
      CameraCapturerConfiguration(
        cameraDirection: CameraDirection.Rear,
      ),
    );
    // 开启音视频
    await engine.enableVideo();
    info('enable Video');

    // 预览
    await engine.startPreview();
    info("start preview");

    info("prepare for streaming");
    // 设置频道场景为直播
    await engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
    info('channelProfile: LiveBroadcasting');

    // 设置用户角色为主播
    // 考虑 即使观众也以这个角色进来
    await engine.setClientRole(ClientRole.Broadcaster);
    info("clientRole: Broadcaster");

    engineDidInit(true);

    info('engine did init');

    info("add watermark");
    _addWatermark();
  }

  void start() async {
    info("start ...");

    final token = await fetchToken(role: role);

    try {
      info('joining ...');
      await engine.joinChannel(token, channel, null, uid);
    } on PlatformException catch (pe) {
      if (pe.code == "-17") {
        warning("already joined.");
        isJoined(true);
      } else {
        error("$pe");
      }
    }

    final user = Get.find<AccountService>().currentUser!;
    API.notifyOtherUsers(
        channelId: channel, user: user, address: house.compoundAddress);
  }

  Future<bool> stop(BuildContext context) async {
    if (isJoined.isFalse) {
      // 没有开始直播 直接返回
      return true;
    }

    final r = await Get.dialog<bool>(
      CupertinoAlertDialog(
        title: const Text("确认要结束带看吗？"),
        actions: [
          CupertinoDialogAction(
            child: const Text("暂不"),
            onPressed: () => Get.back(result: false),
          ),
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () => Get.back(result: true),
            child: const Text("结束"),
          ),
        ],
      ),
    );

    if (!r!) {
      // 暂不结束带看
      return false;
    }

    loading(duration: const Duration(milliseconds: 500));

    if (isRecording.isTrue) {
      // 结束录像
      await onTapRecord();
    }

    await leaveChannel();
    await leaveChatRoom();

    Get.off(
      () => const LiveUploadPage(),
      binding: BindingsBuilder.put(
        () => LiveUploadController(
          photoFolder: _snapshotDirectory,
          house: house,
        ),
      ),
    );

    return false;
  }

  @override
  void snapshotTaken(String channel, int uid, String filePath, int width,
      int height, int errCode) {
    if (errCode != 0) {
      error("take snapshot failed. $errCode");
    } else {
      info('write $filePath succeed');
      toast(succeed: '截图成功');
      // 自增截图
      snapshotIndex(snapshotIndex.value + 1);
    }
  }

  void _periodic(Timer t) {
    if (isRecording.value) {
      _duration(_duration.value + const Duration(seconds: 1));
    }
  }
}
