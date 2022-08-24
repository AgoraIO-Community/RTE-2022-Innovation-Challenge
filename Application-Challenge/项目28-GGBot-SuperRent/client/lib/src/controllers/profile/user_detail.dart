import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/lcuser.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/toast.dart';

class UserDetailController extends GetxController with ScrollMixin {
  final LCUser user;

  UserDetailController(this.user);

  String get avatar => _avatar.value;
  final _avatar = "".obs;

  String get nickname => _nickname.value;
  final _nickname = "".obs;

  int get followersCount => _followersAndFollowees.value?.followeesCount ?? 0;
  int get followeesCount => _followersAndFollowees.value?.followersCount ?? 0;

  late final Rx<LCFollowersAndFollowees?> _followersAndFollowees = Rx(null);

  double get opacity => _opacity.value < 0
      ? 0.0
      : _opacity.value > 1.0
          ? 1.0
          : _opacity.value;

  final _opacity = 0.0.obs;

  List<LCObject> get posts => _posts;
  final _posts = <LCObject>[].obs;

  List<LCObject> get houses => _houses;
  final _houses = <LCObject>[].obs;

  final currentIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    refresh();

    // 名称
    _nickname.value = user['nickname'] ?? "游客";

    // 头像
    final url = user["avatar"];
    if (url is String) {
      _avatar.value = url;
    }

    user
        .getFollowersAndFollowees(returnCount: true)
        .then(_followersAndFollowees);
  }

  @override
  void refresh() async {
    final h = await user.houses;
    if (h != null) {
      _houses.assignAll(h);
    }

    final p = await user.posts;
    if (p != null) {
      _posts.assignAll(p);
    }
  }

  @override
  void onReady() {
    super.onReady();
    scroll.addListener(() {
      _opacity.value = scroll.offset / 155.0;
    });
  }

  void follow() async {
    final self = Get.find<AccountService>().currentUser!;
    if (self.objectId == user.objectId) {
      toast(warning: "不可以这么自恋哦");
      return;
    }

    await self.follow(user.objectId!);

    toast(succeed: "关注成功");
  }

  @override
  Future<void> onEndScroll() async {}

  @override
  Future<void> onTopScroll() async {}
}
