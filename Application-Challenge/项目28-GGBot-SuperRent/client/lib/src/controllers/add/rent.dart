import 'package:flutter_multi_formatter/flutter_multi_formatter.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/agency_fee.dart';
import 'package:super_rent/src/models/other_fee.dart';
import 'package:super_rent/src/models/rent_type.dart';
import 'package:super_rent/src/models/service_fee.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/leancloud.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../models/place.dart';
import '../../pages/details/house.dart';
import '../house.dart';

class RentController extends GetxController {
  final place = Rx<Place?>(null);
  final rentType = Rx<RentType?>(null);

  final monthlyRent = Rx<double?>(null);
  String? get monthlyRentStr => monthlyRent.value == null
      ? null
      : MoneySymbols.YEN_SIGN + monthlyRent.value!.toStringAsFixed(2);

  final agencyFee = Rx<AgencyFee?>(null);

  final serviceFee = Rx<ServiceFee?>(null);

  final otherFee = Rx<OtherFee?>(null);

  final area = Rx<double?>(null);

  final livingRoomCount = Rx<int?>(null);
  final bedRoomCount = Rx<int?>(null);
  final bathRoomCount = Rx<int?>(null);

  // 创建的时候自动生成
  final description = Rx<String>("");

  final contactPhone = Rx<String?>(null);
  final isHiddenContactPhone = false.obs;
// "代理" 0  "业主" 1 "租客" 2
  final houseOwnerType = Rx<int?>(null);

  final personalProfile = Rx<String>("");

  // 宠物
  final pet = Rx<int?>(null);

  // 做饭
  final cook = Rx<int?>(null);

  // 电梯
  final elevator = Rx<int?>(null);

  // 租客性别
  final tenantGender = Rx<int?>(null);

  // 独卫
  final individualBathroom = Rx<int?>(null);

  void preview() {
    toast(warning: "试运营暂不支持预览");
  }

  void publish() async {
    tip(String field) {
      toast(warning: "请添加$field");
    }

    if (place.value == null) {
      tip("小区地址");
      return;
    }

    if (rentType.value == null) {
      tip("出租方式");
      return;
    }

    if (monthlyRent.value == null) {
      tip('月租金');
      return;
    }

    if (agencyFee.value == null) {
      tip('中介费');
      return;
    }

    if (serviceFee.value == null) {
      tip('服务费');
      return;
    }

    if (otherFee.value == null) {
      tip('其他费用');
      return;
    }

    if (area.value == null) {
      tip('房间面积');
      return;
    }

    if (bedRoomCount.value == null) {
      tip('卧室数量');
      return;
    }

    if (livingRoomCount.value == null) {
      tip('客厅数量');
      return;
    }

    if (bathRoomCount.value == null) {
      tip('卫生间数量');
      return;
    }

    if (description.value == "") {
      tip('房间描述');
      return;
    }

    if (houseOwnerType.value == null) {
      tip('与房源关系');
      return;
    }

    final tc = loading();

    // 1. 插入小区信息，如果需要的话
    final compound = await API.createCompoundIfNeed(place.value!);

    // 准备插入房源
    final house = LCObject("House");

    house['rentType'] = rentType.value!.value;
    house['monthlyRent'] = monthlyRent.value!;
    house['agencyFee'] = agencyFee.toJson();
    house['serviceFee'] = serviceFee.toJson();
    house['otherFee'] = otherFee.toJson();
    house['area'] = area.value!.toStringAsFixed(2);
    house['bedroom'] = bedRoomCount.value!;
    house['livingRoom'] = livingRoomCount.value!;
    house['bathRoom'] = bathRoomCount.value!;
    house['description'] = description.value;
    house['contactPhone'] = contactPhone.value;
    house['isHiddenContactPhone'] = isHiddenContactPhone.value;
    house['houseOwnerType'] = houseOwnerType.value!;

    house['personalProfile'] = personalProfile.value;

    house['pet'] = pet.value;
    house['cook'] = cook.value;
    house['elevator'] = elevator.value;
    house['tenantGender'] = tenantGender.value;
    house['individualBathroom'] = individualBathroom.value;

    house['compound'] = compound;

    house['creator'] = Get.find<AccountService>().currentUser;

    await house.save(fetchWhenSave: false);

    compound.addUnique("houses", house);

    await compound.save();

    await Future.delayed(const Duration(seconds: 1));
    final obj = LCObject.createWithoutData("House", house.objectId!);
    await obj.fetch(includes: ["compound", "creator"]);

    tc.dismiss();

    Get.off(
      () => const HouseDetailPage(),
      binding: BindingsBuilder.put(() => HouseDetailController(obj)),
    );
  }
}
