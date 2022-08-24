import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';

class LikeController extends GetxController {
  List<LCObject> get posts => _posts;
  final _posts = <LCObject>[].obs;

  List<LCObject> get houses => _houses;
  final _houses = <LCObject>[].obs;

  @override
  void onInit() {
    super.onInit();
    refresh();
  }

  @override
  void refresh() async {
    final query = LCQuery("Favorite")
        .limit(1000)
        .include('house')
        .include('house.compound')
        .include('house.creator')
        .include("post")
        .include("post.poster")
        .include("post.compounds");
    final favorites = await query.find();
    if (favorites != null) {
      for (final f in favorites) {
        if (f['post'] != null) {
          _posts.add(f['post']);
        }
        if (f['house'] != null) {
          _houses.add(f['house']);
        }
      }
    }
  }
}
