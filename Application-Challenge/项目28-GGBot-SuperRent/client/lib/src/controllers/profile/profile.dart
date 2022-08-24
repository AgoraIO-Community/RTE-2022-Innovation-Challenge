import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:package_info_plus/package_info_plus.dart';

class ProfileController extends GetxController {
  String get avatar => _avatar.value;
  final _avatar = "".obs;

  String get nickname => _nickname.value;
  final _nickname = "".obs;

  int get followersCount => _followersAndFollowees.value?.followeesCount ?? 0;
  int get followeesCount => _followersAndFollowees.value?.followersCount ?? 0;

  late final Rx<LCFollowersAndFollowees?> _followersAndFollowees = Rx(null);

  String get versionRemark => _versionRemark.value;
  final _versionRemark = "".obs;

  late LCUser mySelf;

  final followees = <LCObject>[].obs;
  final followers = <LCObject>[].obs;

  @override
  void onInit() async {
    super.onInit();

    LCUser.getCurrent().then(
      (u) {
        if (u != null) {
          // 名称
          _nickname.value = u['nickname'] ?? "游客";

          // 头像
          final url = u["avatar"];
          if (url is String) {
            _avatar.value = url;
          }

          u.getFollowersAndFollowees(returnCount: true).then((v) {
            _followersAndFollowees.value = v;
            followees(v.followees);
            followers(v.followers);
          });

          mySelf = u;
        }
      },
    );

    // 读取版本号相关
    PackageInfo.fromPlatform().then((v) {
      _versionRemark.value = "${v.appName.toUpperCase()} ${v.version}";
    });
  }
}
