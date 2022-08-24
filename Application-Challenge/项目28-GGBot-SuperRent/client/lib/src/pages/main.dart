import 'package:bottom_bar/bottom_bar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:get/instance_manager.dart';
import 'package:get/route_manager.dart';
import 'package:super_rent/src/controllers/home/home.dart';
import 'package:super_rent/src/controllers/main.dart';
import 'package:super_rent/src/controllers/message/conversation.dart';
import 'package:super_rent/src/controllers/message/live_list.dart';
import 'package:super_rent/src/controllers/profile/profile.dart';
import 'package:super_rent/src/pages/home/index.dart';
import 'package:super_rent/src/pages/message/index.dart';
import 'package:super_rent/src/utils/images.dart';

import 'message/live_list.dart';
import 'profile/index.dart';

class MainPage extends GetWidget<MainController> {
  const MainPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Navigator(
        key: Get.nestedKey(0),
        initialRoute: controller.currentRouter,
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case "live_list":
              return GetPageRoute(
                page: () => const LiveListPage(),
                binding: BindingsBuilder.put(
                  () => LiveListController(),
                ),
                transition: Transition.noTransition,
              );
            case "message":
              return GetPageRoute(
                  page: () => const ConversationPage(),
                  transition: Transition.noTransition,
                  binding: BindingsBuilder.put(
                    () => ConversationController(),
                  ));
            case "profile":
              return GetPageRoute(
                page: () => const ProfilePage(),
                binding: BindingsBuilder.put(() => ProfileController()),
                transition: Transition.noTransition,
              );
            default:
              return GetPageRoute(
                page: () => const HomePage(),
                binding: BindingsBuilder.put(() => HomeController()),
                transition: Transition.noTransition,
              );
          }
        },
      ),
      bottomNavigationBar: Obx(
        () => SafeArea(
          top: false,
          child: BottomBar(
            selectedIndex: controller.current,
            items: [
              BottomBarItem(
                icon: Image.asset(
                  Images.home,
                  width: 24.0,
                  color: controller.current == 0 ? Colors.blue.shade700 : null,
                ),
                title: const Text("首页"),
                activeColor: Colors.blue.shade700,
              ),
              BottomBarItem(
                icon: Image.asset(
                  Images.videoConference,
                  width: 24.0,
                  color: controller.current == 1 ? Colors.red : null,
                ),
                title: const Text("带看"),
                activeColor: Colors.red,
              ),
              BottomBarItem(
                icon: Image.asset(
                  Images.add,
                  width: 24.0,
                  color: CupertinoTheme.of(context).primaryColor,
                ),
                title: const Text(""),
                activeColor: CupertinoTheme.of(context).primaryColor,
              ),
              BottomBarItem(
                icon: Image.asset(
                  Images.message,
                  width: 24.0,
                  color: controller.current == 3 ? Colors.green.shade700 : null,
                ),
                title: const Text("消息"),
                activeColor: Colors.green.shade700,
              ),
              BottomBarItem(
                icon: Image.asset(
                  Images.profile,
                  width: 24.0,
                  color:
                      controller.current == 4 ? Colors.orange.shade900 : null,
                ),
                title: const Text("我的"),
                activeColor: Colors.orange.shade900,
              )
            ],
            onTap: controller.switchTab,
          ),
        ),
      ),
    );
  }
}

// animated_toggle_switch: ^0.5.2
// https://pub.dev/packages/animated_toggle_switch

// simple_tags: ^0.0.4
// https://pub.dev/packages/simple_tags

// 明日任务 <百度>
// 1. 定位登录以后拿到用户的位置
// 2. 根据地址api拿到响应的suggestion
// 3. 类似微信的选点模式
// 4. 支持选点，删除点