import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/controllers/profile/profile.dart';
import 'package:super_rent/src/widgets/empty.dart';

class UserList extends StatelessWidget {
  final List<LCObject> users;

  const UserList({Key? key, required this.users}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Align(
        alignment: Alignment.center,
        child: Obx(
          () => users.isEmpty
              ? const Empty()
              : ListView.separated(
                  itemBuilder: (context, index) {
                    final user = users[index];
                    return Text("id: ${user.objectId} TODO");
                  },
                  separatorBuilder: (_, __) => const Divider(),
                  itemCount: users.length),
        ),
      ),
    );
  }
}

class MyFolloweesPage extends GetWidget<ProfileController> {
  const MyFolloweesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("我的粉丝"),
        border: null,
      ),
      child: UserList(users: controller.followers),
    );
  }
}

class MyFollowersPage extends GetWidget<ProfileController> {
  const MyFollowersPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("我关注的"),
        border: null,
      ),
      child: UserList(users: controller.followees),
    );
  }
}
