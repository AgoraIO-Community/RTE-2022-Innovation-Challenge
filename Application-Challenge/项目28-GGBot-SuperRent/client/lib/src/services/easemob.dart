import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:leancloud_storage/leancloud.dart';

import '../models/easemob.dart';

class EasemobService extends GetxService {
  EMUserInfoManager get _userInfoManager =>
      EMClient.getInstance.userInfoManager;

  Future<EasemobService> init() async {
    final options = EMOptions(
      appKey: "1122210207030661#demo",
      autoLogin: true,
      debugModel: true,
      deleteMessagesAsExitChatRoom: false,
      autoAcceptGroupInvitation: true,
      requireAck: true,
      requireDeliveryAck: true,
    );
    if (kReleaseMode) {
      options.enableAPNs('superRent_production');
    } else {
      options.enableAPNs('superRent_development');
    }

    await EMClient.getInstance.init(options);

    return this;
  }

  Future<void> login(LCUser user) async {
    if (await EMClient.getInstance.isLoginBefore()) {
      if (EMClient.getInstance.currentUsername != user.emUsername) {
        await EMClient.getInstance.logout();
        await EMClient.getInstance.login(user.emUsername, user.emPassword);
      }
    } else {
      await EMClient.getInstance.login(user.emUsername, user.emPassword);
    }

    _userInfoManager.updateUserInfo(
      nickname: user['nickname'],
      avatarUrl: user['avatar'],
      gender: user['gender'],
    );
  }

  Future<void> logout() {
    return EMClient.getInstance.logout();
  }
}
