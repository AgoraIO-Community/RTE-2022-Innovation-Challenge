import 'package:avatar_stack/avatar_stack.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:im_animations/im_animations.dart';
import 'package:super_rent/src/controllers/message/watch_live.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/pages/message/watch_live.dart';
import 'package:super_rent/src/utils/widget.dart';
import 'package:super_rent/src/widgets/empty.dart';

import '../../controllers/message/live_list.dart';

class LiveListPage extends GetWidget<LiveListController> {
  const LiveListPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("带看中..."),
        border: null,
      ),
      child: CustomScrollView(
        slivers: [
          CupertinoSliverRefreshControl(
            onRefresh: controller.onRefresh,
          ),
          Obx(() {
            if (controller.channels.isEmpty) {
              return const SliverFillRemaining(
                child: Empty(message: "没有正在直播的带看"),
              );
            }
            return SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final c = controller.channels[index];
                  final providers = <ImageProvider>[];
                  if (c.audiences != null) {
                    providers.addAll(
                        c.audiences!.map((e) => NetworkImage(e.avatarUrl!)));
                  }
                  return GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      Get.to(
                        const WatchLivePage(),
                        binding: BindingsBuilder.put(
                            () => WatchLiveController(c.house)),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      decoration: BoxDecoration(
                        border: bottomBorder(),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "${c.house.subAddress} ${c.house.compoundAddress}",
                                  style: const TextStyle(fontSize: 16.0),
                                ),
                                const SizedBox(height: 8.0),
                                Row(
                                  children: [
                                    Sonar(
                                      waveColor: Colors.blue,
                                      child: ClipOval(
                                        child: Image.network(
                                          c.broadcaster!.avatarUrl!,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8.0),
                                    Expanded(
                                      child: AvatarStack(
                                        height: 30,
                                        avatars: providers,
                                        borderColor: Colors.blue,
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                          Text.rich(
                            TextSpan(children: [
                              WidgetSpan(
                                child: Icon(
                                  Icons.video_call,
                                  color: Colors.blue.shade400,
                                  size: 18,
                                ),
                              ),
                              TextSpan(
                                  text: "正在直播带看",
                                  style: TextStyle(color: Colors.blue.shade400))
                            ]),
                          ),
                        ],
                      ),
                    ),
                  );
                },
                childCount: controller.channels.length,
              ),
            );
          })
        ],
      ),
    );
  }
}
