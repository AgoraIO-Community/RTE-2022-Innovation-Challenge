import 'package:flutter/material.dart';

import '../utils/images.dart';

class AddMode {
  //
  static String routerAskForRent = "/add_ask_for_rent";
  static String routerRent = "/add_rent";
  static String routerFindRoommate = "/add_find_roommate";

  final String imageName;
  final Color color;
  final String title;
  final String subTitle;

  String get router => imageName == Images.findHouse
      ? AddMode.routerAskForRent
      : imageName == Images.findRoommate
          ? AddMode.routerRent
          : AddMode.routerFindRoommate;

  AddMode(this.imageName, this.color, this.title, this.subTitle);

  AddMode.findHouse()
      : imageName = Images.findHouse,
        color = Colors.blue.shade900,
        title = "求租",
        subTitle = "发布求租贴";

  AddMode.findRoommate()
      : imageName = Images.findRoommate,
        color = Colors.cyan.shade900,
        title = "出租",
        subTitle = "发布新房源";

  AddMode.recordHouse()
      : imageName = Images.recordHouse,
        color = Colors.orange.shade900,
        title = "找室友",
        subTitle = "记录房源～";

  static List<AddMode> supportModes = [
    AddMode.findHouse(),
    AddMode.findRoommate(),
    // AddMode.recordHouse(),
  ];
}
