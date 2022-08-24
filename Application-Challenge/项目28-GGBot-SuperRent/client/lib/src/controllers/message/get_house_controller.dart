import 'dart:ui';

import 'package:agora_rtc_engine/rtc_engine.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:im_animations/im_animations.dart';
import 'package:super_rent/src/controllers/message/mixin_log.dart';

import '../../models/easemob.dart';
import '../../models/house.dart';
import '../../services/account.dart';
import '../../services/leancloud.dart';
import '../../services/toast.dart';
import '../../services/user.dart';

class RemoteAudio {
  final RentUserInfo user;
  final RxBool enable;

  RemoteAudio(this.user, this.enable);
}

abstract class GetXHouseController extends GetxController
    with ScrollMixin, LogMixin {
  final House house;

  GetXHouseController(this.house);

  late final RtcEngine engine;

  final engineDidInit = false.obs;

  String get channel => house.channel;
  int get uid => _accountService.currentUser!.uid;

  AccountService get _accountService => Get.find<AccountService>();

  final isJoined = false.obs;

  final remoteAudios = <int, RemoteAudio>{}.obs;

  UserService get _us => Get.find<UserService>();

  // 主播UID
  int get broadcasterUid => num.parse(house.creator.emUsername).toInt();
  // 主播是否进入直播间
  bool get broadcasterHasJoined => members.keys.contains(broadcasterUid);

  final members = <int, RentUserInfo>{}.obs;

  String get role;

  Future<String> fetchToken({required String role}) async {
    final r = await API.createRtcToken(channel: channel, role: role);
    if (r.isError) {
      toast(error: "生成Token失败");
      error("generate token failed");
      throw 'generate token failed';
    }
    info("got token");
    return r.asValue!.value;
  }

  Future<void> leaveChannel() async {
    return engine.leaveChannel();
  }

  @override
  void onClose() async {
    await engine.stopPreview();
    await engine.destroy();
    super.onClose();
  }

  @override
  Future<void> onEndScroll() async {}

  @override
  Future<void> onTopScroll() async {}

  //
  void addListeners() {
    // 定义事件处理逻辑
    engine.setEventHandler(
      RtcEngineEventHandler(
        warning: (warn) {
          warning(warn.name);
        },
        error: (err) {
          error(err.name);
        },
        apiCallExecuted: (err, api, result) {
          if (err == ErrorCode.NoError) {
            info("$api call succeed");
          } else {
            error("$api err: ${err.name}");
          }
        },
        joinChannelSuccess: (String channel, int uid, int elapsed) async {
          assert(channel == this.channel);
          isJoined(true);
          warning("join channel succeed remote: $uid local:${this.uid}");
          final u = await _us.fetchUserInfo("$uid");
          members[uid] = u;
        },
        snapshotTaken: snapshotTaken,
        userJoined: (int uid, int elapsed) async {
          if (members[uid] == null) {
            final u = await _us.fetchUserInfo('$uid');
            members[uid] = u;
          }
          warning('user join $uid');
        },
        userOffline: (int uid, UserOfflineReason reason) {
          members.remove(uid);
          warning('user offline $reason');
        },
        tokenPrivilegeWillExpire: ((token) async {
          final token = await fetchToken(role: role);
          await engine.renewToken(token);
          info('renew token');
        }),
        firstLocalVideoFramePublished: ((elapsed) {
          info("firstLocalVideoFramePublished");
        }),
        userMuteAudio: ((uid, muted) async {
          if (muted) {
            remoteAudios.remove(uid);
          } else {
            final u = await _us.fetchUserInfo("$uid");
            remoteAudios[uid] = RemoteAudio(u, true.obs);
          }
        }),
      ),
    );

    info('add engine event listeners');
  }

  void muteRemoteAudio(RemoteAudio ra) async {
    final tc = loading();
    await engine.muteRemoteAudioStream(uid, !ra.enable.value);
    ra.enable.toggle();
    tc.dismiss();
  }

  void snapshotTaken(String channel, int uid, String filePath, int width,
      int height, int errCode) {}
}

Widget buildRemoteAudio(RemoteAudio ra, {required VoidCallback? onTap}) {
  final avatar = ClipOval(
    child: SizedBox(
      width: 50,
      height: 50,
      child: Image.network(ra.user.avatarUrl!),
    ),
  );

  return GestureDetector(
    behavior: HitTestBehavior.translucent,
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.only(top: 10.0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            color: Colors.black26,
            padding: const EdgeInsets.all(4),
            child: Row(children: [
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Obx(() => ra.enable.value
                    ? Rotate(
                        repeat: true,
                        rotationsPerMinute: 10,
                        child: avatar,
                      )
                    : avatar),
              ),
              Text(
                "${ra.user.nickName!} ${ra.enable.value ? "正在讲话" : "已静音"}",
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(width: 8),
              Obx(
                () => Icon(
                  ra.enable.value
                      ? CupertinoIcons.stop_circle
                      : CupertinoIcons.stop_circle_fill,
                  color: ra.enable.value ? Colors.white : Colors.red,
                ),
              ),
              const SizedBox(width: 8),
            ]),
          ),
        ),
      ),
    ),
  );
}
