import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/services/account.dart';

import '../../models/lcuser.dart';

class MyItemsController extends GetxController {
  List<LCObject> get posts => _posts;
  final _posts = <LCObject>[].obs;

  List<LCObject> get houses => _houses;
  final _houses = <LCObject>[].obs;

  @override
  void onInit() {
    super.onInit();
    refresh();
  }

  @override
  void refresh() async {
    final self = Get.find<AccountService>().currentUser;

    final h = await self?.houses;
    if (h != null) {
      _houses.assignAll(h);
    }

    final p = await self?.posts;
    if (p != null) {
      _posts.assignAll(p);
    }
  }
}
