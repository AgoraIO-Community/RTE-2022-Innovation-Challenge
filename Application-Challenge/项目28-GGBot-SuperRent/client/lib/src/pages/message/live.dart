import 'package:agora_rtc_engine/rtc_local_view.dart' as rtc_local_view;
import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:avatar_stack/avatar_stack.dart';
import 'package:avatar_stack/positions.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/message/live.dart';

import '../../controllers/message/get_house_controller.dart';
import '../../controllers/message/mixin_chat.dart';
import '../../widgets/button.dart';
// import 'package:agora_rtc_engine/rtc_remote_view.dart' as RtcRemoteView;

class LivePage extends GetView<LiveController> {
  const LivePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () => controller.stop(context),
      child: CupertinoPageScaffold(
        backgroundColor: Colors.black,
        child: Obx(() {
          return Stack(
            children: [
              Positioned.fill(
                child: Obx(
                  (() => controller.engineDidInit.value
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: rtc_local_view.SurfaceView(
                            // renderMode: VideoRenderMode.FILL,
                            channelId: controller.channel,
                            onPlatformViewCreated: (id) {
                              debugPrint(id.toString());
                            },
                          ),
                        )
                      : Container()),
                ),
              ),
              _buildStartButtons(context),
              _buildActionTools(context),
              _buildRecordArea(context),
              if (controller.localStreamIsMute && controller.isJoined.value)
                Positioned.fill(
                  child: Center(
                    child: DefaultTextStyle(
                      style: const TextStyle(
                        fontSize: 35,
                        color: Colors.white,
                        shadows: [
                          Shadow(
                            blurRadius: 7.0,
                            color: Colors.white,
                            offset: Offset(0, 0),
                          ),
                        ],
                      ),
                      child: AnimatedTextKit(
                        repeatForever: true,
                        animatedTexts: [
                          WavyAnimatedText("已暂停推流"),
                        ],
                      ),
                    ),
                  ),
                ),
              // 当前直播间的所有人
              if (controller.isJoined.value) _buildMembers(context),
              _buildRemoteAudios(context),
              _buildMessageArea(context),
              if (controller.isJoined.value) _buildLeaveButton(context),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildLogsArea(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      height: MediaQuery.of(context).size.height * 0.3,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.black26,
          borderRadius: BorderRadius.only(bottomRight: Radius.circular(8.0)),
        ),
        child: Obx(
          () {
            return ListView.builder(
              controller: controller.scroll,
              padding:
                  const EdgeInsets.symmetric(horizontal: 8.0, vertical: 16.0),
              itemBuilder: (context, index) {
                final log = controller.logs[index];
                return Text(
                  log.message,
                  style: TextStyle(
                    color: log.color,
                    fontWeight: FontWeight.w600,
                  ),
                );
              },
              itemCount: controller.logs.length,
            );
          },
        ),
      ),
    );
  }

  Widget _buildStartButtons(BuildContext context) {
    return Positioned(
      bottom: 50,
      left: 100,
      right: 100,
      child: Obx(
        () {
          final children = <Widget>[];

          if (controller.isJoined.isFalse) {
            children.addAll([
              primaryButton(
                context,
                child: const Text("开始带看"),
                onTap: controller.start,
              ),
              CupertinoButton(
                onPressed: Get.back,
                child: const Text(
                  "返回",
                  style: TextStyle(
                    decoration: TextDecoration.underline,
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
              )
            ]);
          }
          return Column(children: children);
        },
      ),
    );
  }

  Widget _buildActionTools(BuildContext context) {
    final children = actions(context);
    final firstChild = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: children,
    );
    final secondChild = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: actions(context),
    );

    return Obx(
      () => Positioned(
        left: 32,
        right: 32,
        bottom: controller.isJoined.value ? 100 : 200,
        child: AnimatedCrossFade(
          firstChild: firstChild,
          secondChild: secondChild,
          crossFadeState: controller.isJoined.value
              ? CrossFadeState.showSecond
              : CrossFadeState.showFirst,
          duration: const Duration(milliseconds: 280),
          layoutBuilder: (topChild, topChildKey, bottomChild, bottomChildKey) {
            return Stack(
              clipBehavior: Clip.none,
              children: <Widget>[
                Positioned(
                  key: topChildKey,
                  child: topChild,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildRecordArea(BuildContext context) {
    final recordWidget = Row(
      children: [
        GestureDetector(
          onTap: controller.takeSnapshot,
          child: Container(
            height: 60,
            width: 60,
            alignment: Alignment.center,
            clipBehavior: Clip.hardEdge,
            decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(
                color: Colors.white,
                width: 5.0,
              ),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Transform.scale(
              scale: 0.9,
              child: Obx(() {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: EdgeInsets.all(
                      controller.takeSnapshotButtonDown.value ? 2 : 0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(27),
                  ),
                );
              }),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Obx(
          () => Text(
            controller.snapshotIndex.value > 0
                ? "${controller.snapshotIndex.value}张截图"
                : "",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const Spacer(),
        Obx(
          () => Text(
            controller.isRecording.value
                ? controller.duration.toString().split('.').first
                : "",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 16.0),
        GestureDetector(
          onTap: controller.onTapRecord,
          child: Container(
            height: 60,
            width: 60,
            alignment: Alignment.center,
            clipBehavior: Clip.hardEdge,
            decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(
                color: Colors.white,
                width: 5.0,
              ),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Transform.scale(
              scale: 0.9,
              child: Obx(() {
                return AnimatedContainer(
                  margin: EdgeInsets.all(controller.isRecording.value ? 10 : 0),
                  duration: const Duration(milliseconds: 180),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(
                        controller.isRecording.value ? 8 : 27),
                  ),
                );
              }),
            ),
          ),
        ),
      ],
    );
    return Obx(
      () => AnimatedPositioned(
        right: 32,
        left: 32,
        bottom: controller.isJoined.value ? 32 : -100,
        duration: const Duration(milliseconds: 200),
        child: recordWidget,
      ),
    );
  }

  List<Widget> actions(BuildContext context) {
    return [
      _buildActionButton(
        context,
        action: "翻转",
        iconData: CupertinoIcons.switch_camera,
        onPressed: controller.switchCamera,
      ),
      _buildActionButton(
        context,
        action: "闪光灯",
        iconData: Icons.flash_on,
        onPressed: controller.toggleCameraTorch,
      ),
      _buildActionButton(
        context,
        action: "暂停",
        iconData: CupertinoIcons.camera,
        onPressed: controller.muteLocalStream,
      ),
    ];
  }

  Widget _buildActionButton(
    BuildContext context, {
    required String action,
    required IconData iconData,
    required VoidCallback? onPressed,
  }) {
    return CupertinoButton(
      padding: const EdgeInsets.only(top: 8.0),
      onPressed: onPressed,
      child: SizedBox(
        width: 60,
        height: 60,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              iconData,
              color: Colors.white,
            ),
            const SizedBox(height: 4),
            Text(
              action,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMembers(BuildContext context) {
    final settings = RestrictedPositions(
      maxCoverage: 0.3,
      minCoverage: 0.2,
      align: StackAlign.right,
    );
    return Positioned(
      right: 16,
      top: 100,
      width: MediaQuery.of(context).size.width * 0.3,
      child: Obx(
        () => AvatarStack(
          height: 40,
          settings: settings,
          avatars: controller.members.values
              .map((e) => NetworkImage(e.avatarUrl!))
              .toList(growable: false),
        ),
      ),
    );
  }

  Widget _buildRemoteAudios(BuildContext context) {
    return Positioned(
      right: 0,
      top: 300,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: controller.remoteAudios.keys.map((k) {
          final ra = controller.remoteAudios[k]!;
          return buildRemoteAudio(ra,
              onTap: () => controller.muteRemoteAudio(ra));
        }).toList(growable: false),
      ),
    );
  }

  Widget _buildMessageArea(BuildContext context) {
    return Positioned(
      top: 0,
      left: 16,
      right: 100,
      height: MediaQuery.of(context).size.height * 0.5,
      child: Obx(
        () => ListView.builder(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          key: controller.messageListKey,
          reverse: true,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.only(right: 100),
          controller: controller.messageScrollController,
          itemBuilder: (context, index) => buildLiveChatMessageItem(
            context,
            controller.messages[index],
          ),
          itemCount: controller.messages.length,
        ),
      ),
    );
  }

  Widget _buildLeaveButton(BuildContext context) {
    return Positioned(
      top: MediaQuery.of(context).padding.top,
      right: 8.0,
      child: GestureDetector(
        onTap: () => navigator?.maybePop(),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 8.0),
          decoration: BoxDecoration(
            color: CupertinoColors.systemRed,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Text(
              "结束带看",
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
