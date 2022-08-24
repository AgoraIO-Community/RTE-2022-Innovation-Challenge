import 'dart:async';

import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';

import '../services/account.dart';
import '../services/toast.dart';

class LoginController extends GetxController {
  String get mobilePhone => _mobilePhone;
  late String _mobilePhone = "";

  final _pin = "".obs;
  final seconds = 0.obs;

  bool get isPinValid => _pin.value.length == 6;

  AccountService get _service => Get.find<AccountService>();

  LoginController();

  void sendSmsCode(String mobilePhone) async {
    _mobilePhone = mobilePhone;

    try {
      await _service.requestSMSCode(mobilePhone);
    } catch (err) {
      toast(error: err.toString());
      return;
    }

    seconds.value = 60;
    Timer.periodic(const Duration(seconds: 1), (t) {
      seconds.value -= 1;
      if (seconds.value == 0) {
        t.cancel();
      }
    });
  }

  void onPinChange(String pin) {
    _pin.value = pin;
  }

  // 登录
  void mobileLogin() async {
    _login(_service.signUpOrLoginByMobile(_mobilePhone, _pin.value));
  }

  // 重新发送二维码
  void resend() {
    if (seconds.value > 0) {
      return;
    }
    sendSmsCode(_mobilePhone);
  }

  // 游客登录
  void anonymouslyLogin() {
    _login(_service.anonymously());
  }

  void _login(Future<LCUser> future) async {
    final tc = loading();
    try {
      final user = await future;
      assert(user.sessionToken != null);

      // 登录成功 跳转去主页
      Get.offAllNamed("/main");
    } catch (err) {
      toast(error: '环信登录超时，请重试');
    } finally {
      tc.dismiss();
    }
  }
}

typedef LoginFn = LCUser Function();
