import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';

import '../../models/house.dart';

class HouseListController extends GetxController with ScrollMixin {
  List<House> get houses => _houses;
  final _houses = <House>[].obs;

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

  Future<void> _loadPosts([bool isRefreshing = false]) async {
    if (!hasMoreData) return;
    final query =
        LCQuery('House').include('creator').include("compound").limit(20);
    if (_houses.isNotEmpty) {
      query.whereGreaterThan("createAt", _houses.last.createdAt!);
    }
    final value = await query.find();

    if (value != null) {
      hasMoreData = value.length == 20;
      if (isRefreshing) {
        _houses.assignAll(value);
      } else {
        _houses.addAll(value);
      }
    }
  }

  Future<void> onRefresh() {
    return _loadPosts(true);
  }

  @override
  Future<void> onTopScroll() async {}
}
