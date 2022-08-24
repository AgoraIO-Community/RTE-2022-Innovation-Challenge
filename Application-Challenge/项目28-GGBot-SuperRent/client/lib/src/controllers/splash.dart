import 'package:get/get.dart';
import 'package:super_rent/src/services/easemob.dart';
import 'package:super_rent/src/services/location.dart';
import 'package:super_rent/src/services/user.dart';

import '../pages/login/welcome.dart';
import '../pages/main.dart';
import '../services/account.dart';
import '../services/toast.dart';
import 'login.dart';
import 'main.dart';

class SplashController extends GetxController {
  @override
  onReady() async {
    super.onReady();
    await _initService();

    Future.delayed(const Duration(milliseconds: 500), () {
      final user = Get.find<AccountService>().currentUser;
      if (user == null) {
        Get.off(
          () => const WelcomePage(),
          transition: Transition.noTransition,
          binding: BindingsBuilder.put(
            () => LoginController(),
          ),
        );
      } else {
        Get.off(
          () => const MainPage(),
          transition: Transition.noTransition,
          binding: BindingsBuilder(
            () {
              Get.put(MainController());
            },
          ),
        );
      }
    });
  }

  _initService() async {
    // 全局Toast管理
    Get.lazyPut(() => ToastService());

    Get.lazyPut(() => UserService());

    // 百度地图定位相关
    await Get.putAsync(() => LocationService().init());

    // 环信相关
    await Get.putAsync(() => EasemobService().init());

    // 这里是你放get_storage、cloud 初始化的地方。
    await Get.putAsync(() => AccountService().init());
  }
}
