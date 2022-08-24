import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:super_rent/src/services/location.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../models/house.dart';

class HomeController extends GetxController with ScrollMixin {
  List<House> get houses => _houses;
  final _houses = <House>[].obs;

  List<LCObject> get posts => _posts;
  final _posts = <LCObject>[].obs;

  double get opacity => _opacity.value < 0
      ? 0.0
      : _opacity.value > 1.0
          ? 1.0
          : _opacity.value;

  final _opacity = 0.0.obs;

  @override
  void onInit() {
    super.onInit();
    final locationService = Get.find<LocationService>();
    // 申请定位权限
    locationService.requestLocationPermission().then((value) {
      if (value != PermissionStatus.granted) {
        toast(warning: "不能自动定位到您所在的城市");
        return;
      }
      // 定位
      locationService.whereAmI();
    });

    //  加载房源数据
    LCQuery('House')
        .include('compound')
        .include('creator')
        .orderByDescending('createdAt')
        .limit(20)
        .find()
        .then((value) {
      if (value != null) {
        _houses.assignAll(value);
      }
    });

    // 加载帖子
    LCQuery('Post')
        .include('poster')
        .include("compounds")
        .orderByDescending('createdAt')
        .limit(2)
        .find()
        .then((value) {
      if (value != null) {
        _posts.assignAll(value);
      }
    });
  }

  @override
  void onReady() {
    super.onReady();
    scroll.addListener(() {
      _opacity.value = scroll.offset / 155.0;
    });
  }

  @override
  Future<void> onEndScroll() async {}

  @override
  Future<void> onTopScroll() async {}
}
