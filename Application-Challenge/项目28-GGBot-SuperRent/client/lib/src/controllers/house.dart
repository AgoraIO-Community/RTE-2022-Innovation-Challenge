import 'package:flutter/material.dart';
import 'package:g_json/g_json.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/agency_fee.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/models/other_fee.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/toast.dart';

import '../models/media.dart';
import '../models/service_fee.dart';

class HouseDetailController extends GetxController {
  final House house;

  List<List<dynamic>> get infos => [
        [Icons.home_filled, house.type],
        [Icons.bathtub_rounded, house.bathRoom],
        [Icons.circle, "${house.area.toStringAsFixed(2)}m²"],
      ];

  HouseDetailController(this.house);

  String get agencyFee {
    final j = JSON(house['agencyFee']);
    final agencyFee = AgencyFee(
      j['type'].integerValue,
      j['has'].booleanValue,
      j['value'].ddouble,
    );

    return agencyFee.toString();
  }

  String get serviceFee {
    final j = JSON(house['serviceFee']);
    final serviceFee = ServiceFee(
      has: j['has'].booleanValue,
      type: j['type'].integer,
      payType: j['payType'].integer,
      value: j['double'].value,
    );
    return serviceFee.description;
  }

  String get otherFee {
    final j = JSON(house['otherFee']);
    final otherFee = OtherFee(
      el: j['el'].ddoubleValue,
      water: j['water'].ddoubleValue,
      net: j['net'].ddoubleValue,
      other: j['other'].ddoubleValue,
    );
    return otherFee.description;
  }

  bool get isFavorite => _isFavorite.value;
  final _isFavorite = false.obs;

  bool get isMyHouse =>
      house.creator.objectId ==
      Get.find<AccountService>().currentUser?.objectId;

  // 截图与录屏
  late List<RentMedia> medias = [];

  @override
  void onInit() {
    super.onInit();
    for (final m in house.medias) {
      if (!m['ignore'].booleanValue) {
        if (m['type'].stringValue == 'video') {
          medias.add(
            RentMedia.video(
              m['url'].stringValue,
              videoPath: m['video_url'].stringValue,
              timestamp: m['timestamp'].integerValue,
            ),
          );
        } else if (m['type'].stringValue == 'image') {
          medias.add(
            RentMedia.image(
              m['url'].stringValue,
              timestamp: m['timestamp'].integerValue,
            ),
          );
        }
      }
    }
    LCQuery("Favorite")
        .whereEqualTo("house", house)
        .count()
        .then((v) => _isFavorite(v == 1));
  }

  void favAction() async {
    final query = LCQuery("Favorite").whereEqualTo("house", house);
    if (isFavorite) {
      final fav = await query.first();
      await fav?.delete();
      _isFavorite(false);
    } else {
      final fav = LCObject("Favorite");
      fav['house'] = house;
      await fav.save(query: query);
      _isFavorite(true);
      toast(succeed: "已收藏");
    }
  }
}
