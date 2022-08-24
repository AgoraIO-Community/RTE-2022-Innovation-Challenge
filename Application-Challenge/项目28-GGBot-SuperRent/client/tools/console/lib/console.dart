import 'dart:io';

import 'package:path/path.dart' as p;

int run() {
  _moveImageAssets();
  return 0;
}

void _moveImageAssets() async {
  final d =
      "/Users/gix/Documents/GitHub/RTE-2022-Innovation-Challenge/Application-Challenge/Kevin-SuperRent/client/assets/images";
  //
  final orignal = Directory("path");

  final items = orignal.listSync(followLinks: false);
  for (final item in items) {
    final fileName = p.basename(item.path);
    final realName = fileName.split("@").first;
    if (fileName.endsWith("@2x")) {
      await item.rename(p.join(d, "2.0", "$realName.png"));
    } else if (fileName.endsWith("@3x")) {
      await item.rename(p.join(d, "3.0", "$realName.png"));
    } else {
      await item.rename(p.join(d, "$realName.png"));
    }
  }
}
