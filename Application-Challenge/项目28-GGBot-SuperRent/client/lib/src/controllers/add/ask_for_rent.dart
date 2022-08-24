import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:super_rent/src/controllers/add/add_address.dart';
import 'package:super_rent/src/controllers/ask_for_rent_detail.dart';
import 'package:super_rent/src/models/house_type.dart';
import 'package:super_rent/src/pages/add/add_address.dart';
import 'package:super_rent/src/pages/details/ask_for_rent.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/widget.dart';

import '../../models/place.dart';
import '../../pages/add/pick_expiration.dart';
import '../../services/leancloud.dart';

class AskForRentController extends GetxController {
  // 地点
  List<Place> get places => _places;
  final _places = <Place>[].obs;

  // 期望租金
  final expectedPrice = "".obs;

  // 期望房型
  HouseType? get houseType => _houseType.value;
  final _houseType = Rx<HouseType?>(null);

  // 其他要求
  final otherRequirements = "".obs;

  // 同时找室友
  final findRoommate = true.obs;

  // 添加地址
  void addAddress(BuildContext context) {
    Get.put(AddAddressController());
    CupertinoScaffold.showCupertinoModalBottomSheet<Place>(
      context: context,
      builder: (context) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.8,
          child: const AddAddressPage(),
        );
      },
    ).then((value) {
      if (value != null) {
        _places.add(value);
      }
      Get.delete<AddAddressController>();
    });
  }

  // 移除地址
  void removePlace(Place p) {
    _places.remove(p);
  }

  // 选择房型
  void pickHouseType() {
    FocusManager.instance.primaryFocus?.unfocus();
    showPicker<HouseType>(Get.context!,
        data: HouseType.values, fn: (h) => h.name).then((value) {
      if (value != null) _houseType(value);
    });
  }

  // 发布
  void publish(BuildContext context) async {
    FocusManager.instance.primaryFocus?.unfocus();

    if (places.isEmpty) {
      toast(warning: "请添加期望地址");
      return;
    }

    final price = num.tryParse(expectedPrice.value);
    if (price == null) {
      toast(warning: "请填写预算");
      return;
    }

    if (houseType == null) {
      toast(warning: "请选择房间类型");
      return;
    }

    final days = await showDialog<int>(
        context: context, builder: (_) => const PickExpiration());
    // 将信息写入到leancloud
    final tc = loading();

    //
    var compounds = <LCObject>[];
    for (final p in places) {
      final c = await API.createCompoundIfNeed(p);
      if (c.objectId == null) {
        await c.save();
      }
      compounds.add(c);
    }

    final post = LCObject("Post");

    post['compounds'] = compounds;
    post["price"] = price;
    post["houseType"] = houseType!.index;

    if (otherRequirements.isNotEmpty) {
      post["otherRequirements"] = otherRequirements.value;
    }

    post["findRoommate"] = findRoommate.value;

    post['poster'] = Get.find<AccountService>().currentUser;

    post['days'] = days;

    await post.save();

    tc.dismiss();

    Get.off(
      () => const AskForRentDetailPage(),
      binding: BindingsBuilder.put(
        () => AskForRentDetailController(post),
      ),
    );
  }
}
