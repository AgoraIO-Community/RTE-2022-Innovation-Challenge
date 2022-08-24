import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';

class PostListController extends GetxController with ScrollMixin {
  List<LCObject> get posts => _posts;
  final _posts = <LCObject>[].obs;

  var hasMoreData = true;

  @override
  void onInit() {
    super.onInit();
    _loadPosts();
  }

  @override
  Future<void> onEndScroll() async {
    _loadPosts();
  }

  void _loadPosts() async {
    if (!hasMoreData) return;
    final query =
        LCQuery('Post').include('poster').include("compounds").limit(20);
    if (_posts.isNotEmpty) {
      query.whereGreaterThan("createAt", _posts.last.createdAt!);
    }
    query.find().then((value) {
      if (value != null) {
        hasMoreData = value.length == 20;
        _posts.addAll(value);
      }
    });
  }

  @override
  Future<void> onTopScroll() async {}
}
