import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/widget.dart';

import '../../controllers/home/house_list.dart';
import '../../widgets/post.dart';

class HouseListPage extends GetWidget<HouseListController> {
  const HouseListPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("房源"),
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
      ),
      child: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          controller: controller.scroll,
          slivers: [
            SliverPersistentHeader(
              delegate: HouseListHeaderDelegate(),
              pinned: true,
            ),
            CupertinoSliverRefreshControl(
              onRefresh: controller.onRefresh,
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: Obx(
                () => SliverGrid.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16.0,
                  mainAxisSpacing: 16.0,
                  childAspectRatio: MediaQuery.of(context).size.width / 2 / 270,
                  children: controller.houses
                      .map((h) => buildHouseItem(context, h))
                      .toList(growable: false),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HouseListHeaderDelegate extends SliverPersistentHeaderDelegate {
  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      decoration: BoxDecoration(
        border: bottomBorder(),
        color: CupertinoColors.systemBackground,
      ),
      child: Column(
        children: [
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => toast(succeed: "当前房源太少，暂不支持搜索"),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16.0),
              height: 50,
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.all(Radius.circular(4)),
                color: CupertinoColors.systemBackground,
                boxShadow: [
                  BoxShadow(
                      color: Colors.grey.withOpacity(0.3),
                      spreadRadius: 5,
                      blurRadius: 7,
                      offset: const Offset(0, 3))
                ],
              ),
              child: Row(children: const [
                SizedBox(width: 10),
                Icon(
                  CupertinoIcons.search,
                  color: CupertinoColors.placeholderText,
                  size: 20,
                ),
                SizedBox(width: 8.0),
                Text(
                  "请输入关键字找房",
                  style: TextStyle(
                      color: CupertinoColors.placeholderText,
                      fontWeight: FontWeight.bold),
                ),
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: const ["综合排序", "位置", "价格", "筛选"]
                  .map(
                    (t) => Expanded(
                      child: GestureDetector(
                        onTap: () => toast(succeed: "当前房源太少，暂不支持筛选"),
                        child: Container(
                          alignment: Alignment.center,
                          height: 30,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                t,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Icon(
                                Icons.arrow_drop_down,
                                color: CupertinoColors.label,
                              )
                            ],
                          ),
                        ),
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
          )
        ],
      ),
    );
  }

  @override
  double get maxExtent => 128;

  @override
  double get minExtent => 128;

  @override
  bool shouldRebuild(covariant SliverPersistentHeaderDelegate oldDelegate) {
    return false;
  }
}
