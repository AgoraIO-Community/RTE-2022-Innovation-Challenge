import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/profile/profile.dart';
import 'package:super_rent/src/pages/profile/user_list.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/images.dart';
import 'package:super_rent/src/widgets/empty.dart';

import '../../controllers/profile/user_detail.dart';
import '../../services/account.dart';
import '../../widgets/post.dart';
import '../../widgets/tab_view.dart';

class UserDetailPage extends GetWidget<UserDetailController> {
  const UserDetailPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CupertinoColors.systemBackground,
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomScrollView(
              controller: controller.scroll,
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.purple,
                          Colors.black12,
                          CupertinoTheme.of(context).primaryColor
                        ],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 70, left: 16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              CircleAvatar(
                                radius: 45,
                                backgroundColor:
                                    CupertinoColors.systemGroupedBackground,
                                foregroundImage: controller.avatar.isNotEmpty
                                    ? NetworkImage(controller.avatar)
                                    : null,
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Obx(() {
                                      return Text(
                                        controller.nickname,
                                        style: const TextStyle(
                                            color: CupertinoColors.white,
                                            fontWeight: FontWeight.w500,
                                            fontSize: 20.0),
                                      );
                                    }),
                                    const Text(
                                      "加入随心租10天，几秒前来过",
                                      style: TextStyle(
                                        color: Colors.white54,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Padding(
                          padding: EdgeInsets.only(left: 16.0),
                          child: Text(
                            '暂无个人简介',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14.0,
                            ),
                          ),
                        ),
                        Wrap(
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.only(left: 16.0, top: 8.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.black12,
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                                width: 30,
                                height: 30,
                                alignment: Alignment.center,
                                child: Image.asset(
                                  Images.female,
                                  width: 15,
                                  color: Colors.pink,
                                ),
                              ),
                            )
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(
                              left: 16.0, top: 60, bottom: 16.0, right: 16.0),
                          child: Row(
                            children: [
                              GestureDetector(
                                onTap: () {
                                  if (controller.user.objectId ==
                                      Get.find<AccountService>()
                                          .currentUser
                                          ?.objectId) {
                                    Get.to(MyFollowersPage(),
                                        binding: BindingsBuilder.put(
                                            () => ProfileController()));
                                  }
                                },
                                child: Column(
                                  children: [
                                    Obx(() {
                                      return Text(
                                          "${controller.followersCount}",
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w400,
                                          ));
                                    }),
                                    const Text("关注",
                                        style: TextStyle(
                                          color: Colors.white60,
                                          fontWeight: FontWeight.w400,
                                          fontSize: 14,
                                        )),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              GestureDetector(
                                onTap: () {
                                  if (controller.user.objectId ==
                                      Get.find<AccountService>()
                                          .currentUser
                                          ?.objectId) {
                                    Get.to(MyFolloweesPage(),
                                        binding: BindingsBuilder.put(
                                            () => ProfileController()));
                                  }
                                },
                                child: Column(
                                  children: [
                                    Obx(() {
                                      return Text(
                                          "${controller.followeesCount}",
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w400,
                                          ));
                                    }),
                                    const Text("粉丝",
                                        style: TextStyle(
                                          color: Colors.white60,
                                          fontWeight: FontWeight.w400,
                                          fontSize: 14,
                                        )),
                                  ],
                                ),
                              ),
                              const Spacer(),
                              GestureDetector(
                                onTap: controller.follow,
                                child: Container(
                                  height: 40,
                                  width: 90,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color:
                                        CupertinoTheme.of(context).primaryColor,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    "+ 关注",
                                    style: TextStyle(color: Colors.white),
                                  ),
                                ),
                              ),
                              IconButton(
                                  onPressed: () => toast(warning: "体验版暂不支持分享"),
                                  icon: const Icon(
                                    CupertinoIcons.share,
                                    color: Colors.white,
                                  )),
                            ],
                          ),
                        ),
                        Obx(() {
                          return Container(
                            clipBehavior: Clip.antiAlias,
                            decoration: const BoxDecoration(
                              color: CupertinoColors.systemBackground,
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(8.0),
                                topRight: Radius.circular(8.0),
                              ),
                            ),
                            alignment: Alignment.center,
                            height: 500,
                            child: !controller.houses.isNotEmpty &&
                                    !controller.posts.isNotEmpty
                                ? const Empty(message: "你还没有发布任何内容")
                                : FaradayTabBarView(
                                    itemBuilder: (context, index) => index == 1
                                        ? buildPostList(
                                            context,
                                            controller.posts,
                                            physics:
                                                const NeverScrollableScrollPhysics(),
                                          )
                                        : buildHouseList(
                                            context,
                                            controller.houses,
                                            physics:
                                                const NeverScrollableScrollPhysics(),
                                          ),
                                    itemCount: 2,
                                    onPageChanged: controller.currentIndex,
                                    titleBuilder: (i) =>
                                        i == 0 ? "房源贴" : "找室友贴",
                                  ),
                          );
                        })
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Obx(
            () => Container(
              height: 44 + MediaQuery.of(context).padding.top,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: CupertinoColors.systemBackground
                    .withOpacity(controller.opacity),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: Icon(
                      CupertinoIcons.back,
                      color: controller.opacity > 0.65
                          ? Colors.black
                          : Colors.white,
                    ),
                  ),
                  if (controller.opacity > 0.65)
                    Obx(
                      () => Text(
                        "${controller.nickname}的主页",
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18.0,
                        ),
                      ),
                    ),
                  IconButton(onPressed: () {}, icon: const Text("")),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
