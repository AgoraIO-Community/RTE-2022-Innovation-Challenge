import 'package:flutter/material.dart';

import 'src/app.dart';
import 'src/services/leancloud.dart';

void main() async {
  // 初始化 leancloud
  initLeancloud();

  runApp(
    const Material(
      child: App(),
    ),
  );
}
