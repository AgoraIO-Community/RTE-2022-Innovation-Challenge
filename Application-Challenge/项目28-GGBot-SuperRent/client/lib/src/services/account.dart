import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';

import './easemob.dart';
import '../controllers/login.dart';
import '../models/easemob.dart';
import '../pages/login/welcome.dart';
import '../utils/error.dart';

const _kSessionToken = "session_token";
// 主要提供以下服务
// 当前用户是否登录
// 当前登录用户信息

// 手机号登录逻辑
// 微信登录逻辑
// 苹果登录逻辑
class AccountService extends GetxService {
  LCUser? _self;

  // 当前登录的用户信息
  LCUser? get currentUser => _self;
  // 是否已经登录
  bool get hasLoggedIn => _self != null;

  bool get isEasemobRegistered => _self?.isEasemobRegistered ?? false;

  FlutterSecureStorage get _storage => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true));

  EasemobService get emService => Get.find<EasemobService>();

  Future<AccountService> init() async {
    _self = await LCUser.getCurrent();
    if (_self == null) {
      // 尝试登录一下
      var sessionToken = await _storage.read(
          key: _kSessionToken,
          aOptions: const AndroidOptions(encryptedSharedPreferences: true));
      if (sessionToken != null && sessionToken.isNotEmpty) {
        try {
          _self = await LCUser.becomeWithSessionToken(sessionToken);
        } catch (err) {
          debugPrint("becomeWithSessionToken err: $err");
          await _storage.delete(key: _kSessionToken);
        }
      }
    }
    if (_self != null) {
      // 拉最新的信息
      await _self?.fetch();

      // 更新最后在线时间
      _self?["lastLoggedInAt"] = DateTime.now();
      // 保存在本地
      await _self?.save();

      emService.login(_self!);
    }

    return this;
  }

  // 请求短信验证码
  requestSMSCode(String mobile) {
    return LCSMSClient.requestSMSCode(mobile)
        .catchError((err) => throw RentError.lc(err));
  }

  // 登录或者注册
  Future<LCUser> signUpOrLoginByMobile(String mobile, String code) async {
    final user = await LCUser.signUpOrLoginByMobilePhone(mobile, code)
        .catchError((err) => throw RentError.lc(err));
    assert(user.sessionToken != null);

    await _registerSucceed(user);

    return user;
  }

  // 匿名登录
  Future<LCUser> anonymously() async {
    final user = await LCUser.loginAnonymously();
    await _registerSucceed(user);

    assert(user.emUsername != "");
    await emService.login(user);

    return user;
  }

  Future<void> _registerSucceed(LCUser user) async {
    // 将sessionToken 保存起来
    await _storage.write(key: _kSessionToken, value: user.sessionToken);
    _self = user;

    // 注册成功以后， 服务端会帮忙生成一批 关联的其他第三方系统的账号
    await Future.delayed(const Duration(seconds: 2));

    // 拉最新的信息
    await _self?.fetch();
    // 保存在本地
    await _self?.save();
  }

  // 退出登录
  Future<void> logout() async {
    await LCUser.logout();
    await _storage.delete(key: _kSessionToken);
    await emService.logout();
    _self = null;

    Get.offAll(
      () => const WelcomePage(),
      transition: Transition.noTransition,
      binding: BindingsBuilder.put(
        () => LoginController(),
      ),
    );
  }
}
