import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/services/leancloud.dart';
import 'package:super_rent/src/services/user.dart';

import '../../models/house.dart';

class Channel {
  final String name;
  final bool isExist;
  final House house;
  final EMUserInfo? broadcaster;
  final List<EMUserInfo>? audiences;

  Channel(
      this.name, this.isExist, this.house, this.broadcaster, this.audiences);
}

class LiveListController extends GetxController {
  List<Channel> get channels => _channels;
  final _channels = <Channel>[].obs;

  UserService get _us => Get.find<UserService>();

  @override
  void onInit() {
    super.onInit();
    onReady();
  }

  Future<void> onRefresh() async {
    final result = await API.fetchChannels();
    if (result.isValue) {
      final channels = result.asValue!.value;
      final uid = channels.mapMany((item) => [
            ...item['Broadcasters'].listValue.map((e) => e.integerValue),
            ...item['Audience'].listValue.map((e) => e.integerValue),
          ]);
      await _us.load(uid.map((e) => e.toString()).toList(growable: false));

      _channels.clear();
      for (final c in channels) {
        final name = c['Name'].stringValue;
        final isExist = c['Exist'].booleanValue;

        if (isExist) {
          EMUserInfo? broadcaster;
          List<EMUserInfo>? audiences;

          final broadcasterIds =
              c['Broadcasters'].listValue.map((e) => e.integerValue);

          if (broadcasterIds.isNotEmpty) {
            broadcaster =
                await _us.fetchUserInfo(broadcasterIds.first.toString());
          }
          audiences = [];
          for (final id in broadcasterIds) {
            audiences.add(await _us.fetchUserInfo(id.toString()));
          }

          final house = LCObject.createWithoutData('House', name);
          await house.fetch(includes: ['compound', 'creator']);
          _channels.add(Channel(name, isExist, house, broadcaster, audiences));
        }
      }
    }
  }
}
