import 'dart:io';

import 'package:flutter_apns_only/flutter_apns_only.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';

import '../controllers/home/post_list.dart';
import '../models/easemob.dart';
import '../pages/home/post_list.dart';
import '../pages/message/chat.dart';

class ApnsService extends GetxService {
  late final ApnsPushConnectorOnly _connector;

  @override
  void onReady() {
    // 默认进去全国社群
    EMClient.getInstance.chatRoomManager.joinChatRoom(superRentChinaGroupId);
    if (Platform.isIOS) {
      _connector = ApnsPushConnectorOnly();
      _connector.token.addListener(() {
        final t = _connector.token.value;
        if (t != null && t.isNotEmpty) {
          EMClient.getInstance.pushManager.updateAPNsDeviceToken(t);
        }
      });
      _connector.shouldPresent = (_) => Future.value(true);

      _connector.configureApns(
        onBackgroundMessage: _onPush,
        onLaunch: _onPush,
        onMessage: _onPush,
        onResume: _onPush,
      );
      _connector.requestNotificationPermissions();
    }
  }

  Future<void> _onPush(ApnsRemoteMessage message) async {
    final f = message.payload['f'];
    if (f != null && f is String) {
      Get.to(() => ChatPage(f));
    } else {
      Get.to(
        const PostListPage(),
        binding: BindingsBuilder.put(
          () => PostListController(),
        ),
      );
    }
  }
}
