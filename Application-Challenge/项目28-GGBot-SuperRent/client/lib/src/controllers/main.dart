import 'package:get/get.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:super_rent/src/models/add_mode.dart';
import 'package:super_rent/src/pages/add/add.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/apns.dart';

import '../pages/add/ask_for_rent.dart';
import '../pages/add/rent.dart';
import '../services/toast.dart';
import 'add/ask_for_rent.dart';
import 'add/rent.dart';

class MainController extends GetxController {
  //
  int get current => _current.value;
  String get currentRouter => current == 1
      ? "live_list"
      : current == 3
          ? "message"
          : current == 4
              ? "profile"
              : "home";

  final _current = 0.obs;

  bool get isAddMode => _isAddMode.value;
  final _isAddMode = false.obs;

  void switchTab(int index) {
    if (index == 2) {
      Get.to(
          () => AddPage(
                onTap: (mode) {
                  if (mode == null) {
                    return Get.back();
                  }
                  if (mode.router == AddMode.routerAskForRent) {
                    Get.off(
                      () => const CupertinoScaffold(body: AskForRentPage()),
                      binding:
                          BindingsBuilder.put(() => AskForRentController()),
                    );
                  } else {
                    Get.off(
                      () => const CupertinoScaffold(body: RentPage()),
                      binding: BindingsBuilder.put(() => RentController()),
                    );
                  }
                },
              ),
          opaque: false,
          fullscreenDialog: true,
          transition: Transition.fadeIn,
          duration: const Duration(milliseconds: 80));
      return;
    }

    _current.value = index;

    Get.offAllNamed(currentRouter, id: 0);
  }

  void hiddenAddPage() {
    _isAddMode(false);
  }

  @override
  void onInit() {
    super.onInit();

    Get.put(ApnsService());
  }

  @override
  void onReady() {
    super.onReady();
    // 确保注册了 环信ID
    if (!Get.find<AccountService>().isEasemobRegistered) {
      toast(error: "环信账号注册失败");
    }
  }
}
