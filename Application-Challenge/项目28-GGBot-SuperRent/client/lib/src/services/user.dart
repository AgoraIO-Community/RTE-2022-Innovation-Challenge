import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';

import '../controllers/message/conversation.dart';

typedef RentUserInfo = EMUserInfo;

class UserService extends GetxService {
  final _userInfo = <String, EMUserInfo>{};

  // refresh from server
  Future<void> load(List<String> id) {
    return EMClient.getInstance.userInfoManager
        .fetchUserInfoById(id)
        .then(((value) {
      for (final key in value.keys) {
        _userInfo[key] = value[key]!;
      }
    }));
  }

  Future<EMUserInfo> fetchUserInfo(String uid) async {
    var userInfo = _userInfo[uid];
    if (userInfo == null) {
      if (uid == "19900328") {
        return EMUserInfoX.system;
      }
      userInfo =
          (await EMClient.getInstance.userInfoManager.fetchUserInfoById([uid]))
              .values
              .first;

      _userInfo[uid] = userInfo;
    }

    return userInfo;
  }
}
