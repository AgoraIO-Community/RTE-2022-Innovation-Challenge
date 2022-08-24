import 'package:leancloud_storage/leancloud.dart';

import 'house.dart';

extension HousePostQuery on LCUser {
  Future<List<House>?> get houses => LCQuery("House")
      .include('compound')
      .include('creator')
      .whereEqualTo('creator', this)
      .find();

  Future<List<LCObject>?> get posts => LCQuery("Post")
      .include('compounds')
      .include('poster')
      .whereEqualTo('poster', this)
      .find();
}
