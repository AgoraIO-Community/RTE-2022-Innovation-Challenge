import 'dart:io';

import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:path/path.dart' as p;
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../models/media.dart';

class LiveUploadController extends GetxController {
  final String photoFolder;
  final House house;

  LiveUploadController({
    required this.photoFolder,
    required this.house,
  });

  final items = <RentMedia>[].obs;

  late List<LCObject> _tasks;

  @override
  void onInit() {
    super.onInit();

    _setup();
  }

  void _setup() async {
    // 查询一下当前房源有没有待处理的录制任务
    final query = LCQuery('RecordTask')
        .whereEqualTo('houseId', house.objectId)
        .whereEqualTo('status', 'waiting-assign');
    _tasks = (await query.find()) ?? [];
    for (final task in _tasks) {
      final filename = task['file'];
      final filePath = "http://cdn.rainbowbridge.top/$filename";

      final thumbnailPath = "$filePath?vframe/png/offset/1";

      items.add(RentMedia.video(thumbnailPath, videoPath: filePath));
    }

    // 图片
    final files = Directory(photoFolder).listSync(followLinks: false);
    for (final file in files) {
      if (file is File) {
        items.add(RentMedia.image(file.path));
      }
    }
  }

  void upload() async {
    final tc = loading();

    for (final item in items) {
      var value = {
        'ignore': item.ignore.value,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'type': item.type.name,
      };

      // 视频直接保存
      if (item.isVideo) {
        // 这个imagePath 为远程地址
        value['video_url'] = item.videoPath!;
        value['url'] = item.imagePath;
      } else {
        // 先上传本地图片文件
        final name = "${house.objectId!}/${p.basename(item.imagePath)}";
        final file = await LCFile.fromPath(name, item.imagePath);
        file.addMetaData("house", house.objectId!);
        await file.save();

        value['url'] = file.url!;

        // 删除本地文件
        File(item.imagePath).delete();
      }

      house.add('medias', value);
    }

    await house.save();

    for (final t in _tasks) {
      await t.delete();
    }

    tc.dismiss();

    Get.back();
  }
}
