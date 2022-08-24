import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/like.dart';
import 'package:super_rent/src/controllers/profile/profile.dart';
import 'package:super_rent/src/controllers/profile/user_detail.dart';
import 'package:super_rent/src/pages/profile/detail.dart';
import 'package:super_rent/src/pages/profile/publish.dart';
import 'package:super_rent/src/pages/profile/settings.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/images.dart';
import 'package:super_rent/src/utils/widget.dart';

import '../../controllers/profile/my_items.dart';
import 'like/like.dart';

class ProfilePage extends GetWidget<ProfileController> {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        middle: Text("我的"),
      ),
      child: ListView(
        children: [
          _buildHeader(context),
          _buildItem(
            "我的收藏",
            assetImageName: Images.like,
            onTap: () => Get.to(
              const LikePage(),
              binding: BindingsBuilder.put(() => LikeController()),
            ),
          ),
          _buildItem(
            "我的发布",
            assetImageName: Images.publish,
            onTap: () => Get.to(
              MyItems(),
              binding: BindingsBuilder.put(() => MyItemsController()),
            ),
          ),
          _buildItem(
            "意见反馈",
            assetImageName: Images.feedback,
            onTap: () => toast(warning: "TODO"),
          ),
          _buildItem(
            "联系客服",
            assetImageName: Images.kefu,
            onTap: () => toast(warning: "TODO"),
          ),
          _buildItem(
            "设置",
            assetImageName: Images.settings,
            onTap: () => Get.to(() => const SettingsPage()),
          ),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Get.to(
          () => const UserDetailPage(),
          binding: BindingsBuilder.put(
            () => UserDetailController(controller.mySelf),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          border: bottomBorder(),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 32.0),
          child: Obx(
            () => Row(
              children: [
                CircleAvatar(
                  radius: 35,
                  backgroundColor: CupertinoColors.systemGroupedBackground,
                  foregroundImage: controller.avatar.isNotEmpty
                      ? NetworkImage(controller.avatar)
                      : null,
                ),
                const SizedBox(width: 16),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      controller.nickname,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text.rich(
                      TextSpan(children: [
                        WidgetSpan(
                          child: Icon(
                            Icons.video_call,
                            color: Colors.blue.shade400,
                            size: 18,
                          ),
                        ),
                        TextSpan(
                            text: "RTC在线",
                            style: TextStyle(color: Colors.blue.shade400))
                      ]),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "关注：${controller.followersCount}   粉丝：${controller.followeesCount}",
                      style: const TextStyle(fontSize: 12.0),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildItem(String title,
      {required String assetImageName, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            border: bottomBorder(),
          ),
          child: Row(
            children: [
              Image.asset(assetImageName, width: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16.0,
                  ),
                ),
              ),
              const Icon(
                CupertinoIcons.chevron_right,
                color: CupertinoColors.secondaryLabel,
                size: 18,
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return SizedBox(
      height: 100,
      child: Center(
        child: Obx(
          () => Text(
            controller.versionRemark,
            style: const TextStyle(color: CupertinoColors.secondaryLabel),
          ),
        ),
      ),
    );
  }
}
