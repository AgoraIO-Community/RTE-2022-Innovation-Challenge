import 'package:flutter/cupertino.dart';
import 'package:get/get_state_manager/get_state_manager.dart';

import '../controllers/splash.dart';
import '../utils/images.dart';

class Splash extends GetWidget<SplashController> {
  const Splash({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 200,
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Hero(
                  tag: "logo_image",
                  child: Image.asset(
                    Images.logo,
                    width: 25,
                    color: CupertinoTheme.of(context).primaryColor,
                  ),
                ),
                const Hero(
                  tag: "log_text",
                  child: Text(" 随心租"),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
