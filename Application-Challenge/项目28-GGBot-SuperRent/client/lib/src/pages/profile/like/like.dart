import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/widgets/post.dart';
import 'package:super_rent/src/widgets/tab_view.dart';

import '../../../controllers/like.dart';

class LikePage extends GetWidget<LikeController> {
  const LikePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TempListScaffold(
        posts: controller.posts, houses: controller.houses, title: "我的收藏");
  }
}

class TempListScaffold extends StatelessWidget {
  final List<LCObject> posts;
  final List<House> houses;
  final String title;

  const TempListScaffold(
      {super.key,
      required this.posts,
      required this.houses,
      required this.title});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text(title),
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
      ),
      child: FaradayTabBarView(
        itemBuilder: (context, index) => index == 1
            ? buildPostList(context, posts)
            : buildHouseList(context, houses),
        itemCount: 2,
        titleBuilder: (i) => i == 0 ? "房源贴" : "找室友贴",
      ),
    );
  }
}
