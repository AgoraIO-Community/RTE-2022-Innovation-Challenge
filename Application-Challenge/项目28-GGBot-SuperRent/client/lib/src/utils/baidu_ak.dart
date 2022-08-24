import 'dart:io';

class BaiduAk {
  static const ios = "cVZezTGojwzdvqMSTbao30qsT71OkfMG";
  static const android = "xldGA8gTpTCN0I2WmqyHy2j4Doblkjg5";

  static String get value => Platform.isIOS ? ios : android;
}
