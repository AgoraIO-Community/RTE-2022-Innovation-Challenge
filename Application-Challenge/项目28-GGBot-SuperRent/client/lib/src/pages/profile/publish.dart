import 'package:flutter/src/widgets/framework.dart';
import 'package:get/get_state_manager/get_state_manager.dart';

import '../../controllers/profile/my_items.dart';
import 'like/like.dart';

class MyItems extends GetWidget<MyItemsController> {
  @override
  Widget build(BuildContext context) {
    return TempListScaffold(
        posts: controller.posts, houses: controller.houses, title: "我的发布");
  }
}
