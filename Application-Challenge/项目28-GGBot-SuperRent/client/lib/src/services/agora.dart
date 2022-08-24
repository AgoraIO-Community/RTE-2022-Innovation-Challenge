import 'dart:io';

// ignore: depend_on_referenced_packages
import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

const agoraAPPID = "87a3c9a57bc240d2a96df19b3872bd87";

Future<String> watermarkPath() async {
  const objectId = '62e78bdaaff09f036a4c66b6';
  final appDirectory = await getApplicationDocumentsDirectory();
  final watermarkFolder = Directory(p.join(appDirectory.path, 'watermarks'));
  final f = File(p.join(watermarkFolder.path, '$objectId.png'));
  if (await f.exists()) {
    return f.path;
  }
  // 创建文件夹
  await watermarkFolder.create(recursive: true);

  final dio = Dio();

  await dio.download(
      'https://rent-file.rainbowbridge.top/SvVJ905r4ugmK0OxAfxOmgHh5vIyPxHk/wartermark.png',
      f.path);

  return f.path;
}
