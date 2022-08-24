import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/widgets/post.dart';

import '../../controllers/home/post_list.dart';

class PostListPage extends GetWidget<PostListController> {
  const PostListPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        middle: Text("同城找室友"),
      ),
      child: SafeArea(
        child: Obx(() {
          return ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            controller: controller.scroll,
            itemBuilder: ((context, index) =>
                buildPostListItem(context, controller.posts[index])),
            itemCount: controller.posts.length,
            separatorBuilder: (BuildContext context, int index) =>
                const Divider(),
          );
        }),
      ),
    );
  }
}
