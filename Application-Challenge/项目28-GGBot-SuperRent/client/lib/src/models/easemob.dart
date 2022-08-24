import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/utils/images.dart';

extension Easemob on LCUser {
  bool get isEasemobRegistered => (this['easemobRegistered'] as bool?) ?? false;

  String get emUsername => "${this['emUid']}";
  String get emPassword => objectId!;
}

EMMessage assembleRequestLiveMessage(House house) {
  final msg = EMMessage.createCustomSendMessage(
    targetId: house.creator.emUsername,
    event: "request_live_card",
    params: {
      "houseId": house.objectId!,
      "url": house.medias.isEmpty
          ? Images.housePlaceholder
          : house.medias.first['url'].stringValue,
      'address': house.compoundAddress,
      'price': house.monthlyRent.toStringAsFixed(0),
    },
  );

  msg.attributes = {
    "em_apns_ext": {
      "em_alert_title": "请求在线带看",
      "em_alert_subTitle": "",
      "em_alert_body": "${house.creator['nickName']}正在等待开播...",
      "conversationId": msg.conversationId,
    }
  };

  return msg;
}

const superRentChinaGroupId = "190579972571139";
