import 'package:get/get.dart';

enum RentMediaItemType { video, image }

class RentMedia {
  final RentMediaItemType type;
  final String imagePath;
  final String? videoPath;
  final ignore = RxBool(false);
  final int timestamp;

  RentMedia.video(this.imagePath, {required this.videoPath, this.timestamp = 0})
      : type = RentMediaItemType.video;

  RentMedia.image(this.imagePath, {this.timestamp = 0})
      : type = RentMediaItemType.image,
        videoPath = null;

  bool get isVideo => videoPath != null;

  bool get isRemoteImage => imagePath.startsWith("http");
}
