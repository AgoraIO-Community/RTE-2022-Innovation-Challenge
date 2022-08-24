import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/home/home.dart';
import 'package:super_rent/src/controllers/home/house_list.dart';
import 'package:super_rent/src/controllers/home/post_list.dart';
import 'package:super_rent/src/pages/home/city_picker.dart';
import 'package:super_rent/src/pages/home/house_list.dart';
import 'package:super_rent/src/pages/home/post_list.dart';
import 'package:super_rent/src/pages/message/chat.dart';
import 'package:super_rent/src/services/location.dart';
import 'package:super_rent/src/utils/images.dart';
import 'package:super_rent/src/widgets/post.dart';

import '../../models/easemob.dart';
import '../../widgets/post.dart';

class HomePage extends GetWidget<HomeController> {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final locationService = Get.find<LocationService>();
    return CupertinoPageScaffold(
      child: Stack(
        children: [
          Positioned.fill(
            child: ListView(
              controller: controller.scroll,
              padding: EdgeInsets.zero,
              children: [
                GestureDetector(
                  onTap: () {
                    Get.to(() => const ChatPage(superRentChinaGroupId));
                  },
                  child: SizedBox(
                    height: 350,
                    child: Stack(
                      children: [
                        Positioned(
                          left: 0,
                          top: 0,
                          bottom: 30,
                          right: 0,
                          child: Image.asset(
                            Images.homeHeader,
                            fit: BoxFit.contain,
                          ),
                        ),
                        Positioned(
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 60,
                          child: GestureDetector(
                            onTap: () => Get.to(
                              const HouseListPage(),
                              binding: BindingsBuilder.put(
                                  () => HouseListController()),
                            ),
                            child: Container(
                              margin:
                                  const EdgeInsets.symmetric(horizontal: 16.0),
                              decoration: BoxDecoration(
                                borderRadius:
                                    const BorderRadius.all(Radius.circular(4)),
                                color: CupertinoColors.systemBackground,
                                boxShadow: [
                                  BoxShadow(
                                      color: Colors.grey.withOpacity(0.3),
                                      spreadRadius: 5,
                                      blurRadius: 7,
                                      offset: const Offset(0, 3))
                                ],
                              ),
                              child: Row(children: [
                                Obx(
                                  () => CupertinoButton(
                                    child: Text(
                                      locationService.city.name,
                                      style: TextStyle(
                                        color: CupertinoColors.label
                                            .withOpacity(0.5),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    onPressed: () =>
                                        Get.to(() => const CityPicker()),
                                  ),
                                ),
                                const VerticalDivider(
                                  color: CupertinoColors.opaqueSeparator,
                                  indent: 15,
                                  endIndent: 15,
                                ),
                                const SizedBox(width: 10),
                                const Icon(
                                  CupertinoIcons.search,
                                  color: CupertinoColors.placeholderText,
                                  size: 20,
                                ),
                                const SizedBox(width: 15),
                                const Text(
                                  "请输入关键字找房",
                                  style: TextStyle(
                                      color: CupertinoColors.placeholderText),
                                ),
                              ]),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                GridView.count(
                  crossAxisCount: 5,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    ...List.generate(10, _buildHomeIcon),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.only(left: 16.0),
                  child: Text(
                    "#求租找室友#",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text("这个城市有800人也和你一样在找室友"),
                ),
                const Divider(),
                Obx(
                  () => ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    physics: const NeverScrollableScrollPhysics(),
                    shrinkWrap: true,
                    children: [
                      ...controller.posts
                          .map((p) => buildPostListItem(context, p)),
                      CupertinoButton(
                        padding: EdgeInsets.zero,
                        onPressed: () => Get.to(
                          const PostListPage(),
                          binding:
                              BindingsBuilder.put(() => PostListController()),
                        ),
                        child: Container(
                          height: 44,
                          alignment: Alignment.center,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.copy, size: 15),
                              Text(
                                "查看更多",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(left: 16.0),
                  child: Text(
                    "#热门房源#",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Obx(
                    () => GridView.count(
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      crossAxisCount: 2,
                      childAspectRatio:
                          MediaQuery.of(context).size.width / 2 / 260,
                      crossAxisSpacing: 16.0,
                      mainAxisSpacing: 16.0,
                      children: [
                        ...controller.houses
                            .map((h) => buildHouseItem(context, h))
                      ],
                    ),
                  ),
                ),
                Container(
                  height: 50,
                  alignment: Alignment.center,
                  child: const Text(
                    "到底啦~",
                    style: TextStyle(
                      color: CupertinoColors.secondaryLabel,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 44 + MediaQuery.of(context).padding.top,
            child: Obx(
              () => Container(
                padding:
                    EdgeInsets.only(top: MediaQuery.of(context).padding.top),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: CupertinoColors.systemBackground
                      .withOpacity(controller.opacity),
                ),
                child: Obx(
                  () => controller.opacity > 0.65
                      ? const Text(
                          "随心租",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18.0,
                          ),
                        )
                      : const Text(""),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  static const menuItems = [
    ["全部", "home_all.svg"],
    ["直播带看", "home_video.svg"],
    ["近地铁", "home_metro.svg"],
    ["附近找房", "home_location.svg"],
    ["整租", "home_shared.svg"],
    ["转租", "home_p2p.svg"],
    ["月付", "home_month.svg"],
    ["通勤找房", "home_traffic.svg"],
    ["可短租", "home_short.svg"],
    ["房东直租", "home_owner.svg"],
  ];
  Widget _buildHomeIcon(int index) {
    final item = menuItems[index];
    return GestureDetector(
      onTap: () => Get.to(
        const HouseListPage(),
        binding: BindingsBuilder.put(() => HouseListController()),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          SvgPicture.asset(
            "assets/images/${item.last}",
            width: 24,
          ),
          const SizedBox(height: 4),
          Text(item.first),
        ],
      ),
    );
  }
}
