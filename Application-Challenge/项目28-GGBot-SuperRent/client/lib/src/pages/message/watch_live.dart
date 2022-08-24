import 'dart:ui';

import 'package:agora_rtc_engine/rtc_remote_view.dart' as rtc_remote_view;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:im_animations/im_animations.dart';
import 'package:super_rent/src/controllers/message/watch_live.dart';
import 'package:super_rent/src/utils/images.dart';

import '../../controllers/message/get_house_controller.dart';
import '../../controllers/message/mixin_chat.dart';

class WatchLivePage extends GetView<WatchLiveController> {
  const WatchLivePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Obx(
            (() => controller.broadcasterHasJoined
                ? rtc_remote_view.TextureView(
                    uid: controller.broadcasterUid,
                    channelId: controller.channel,
                    onPlatformViewCreated: (id) {
                      debugPrint(id.toString());
                    },
                  )
                : Container(
                    color: CupertinoColors.secondarySystemBackground,
                    child: const Center(
                      child: Text(
                        "业主正在赶来的路上",
                        style: TextStyle(color: CupertinoColors.label),
                      ),
                    ),
                  )),
          ),
        ),
        Positioned.fill(
          child: CupertinoPageScaffold(
            backgroundColor: Colors.transparent,
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
              onVerticalDragStart: (_) =>
                  FocusManager.instance.primaryFocus?.unfocus(),
              child: Stack(
                children: [
                  _buildMessageArea(context),
                  _buildRemoteAudios(context),
                ],
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildLogsArea(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(8.0)),
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
    );
  }

  Widget _buildMessageArea(BuildContext context) {
    return Positioned(
      left: 16,
      right: 4,
      bottom: 0,
      height: MediaQuery.of(context).size.height * 0.7,
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Obx(
                () => ListView.builder(
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
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
            ),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                      child: Container(
                        color: Colors.black26,
                        height: 60,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 60,
                                child: CupertinoTextField(
                                    controller: controller.textController,
                                    decoration: null,
                                    placeholder: "提问...",
                                    placeholderStyle: const TextStyle(
                                      color: Colors.white60,
                                    ),
                                    style: const TextStyle(color: Colors.white),
                                    onSubmitted: controller.send),
                              ),
                            ),
                            CupertinoButton(
                              padding: EdgeInsets.zero,
                              onPressed: () {
                                controller.send(controller.textController.text);
                              },
                              child: Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color:
                                      CupertinoTheme.of(context).primaryColor,
                                  borderRadius: BorderRadius.circular(22),
                                ),
                                child: Center(
                                  child: Image.asset(
                                    Images.send,
                                    color: Colors.white,
                                    fit: BoxFit.scaleDown,
                                    width: 26,
                                    height: 26,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                _buildVoiceButton(context),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVoiceButton(BuildContext context) {
    final button = CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: controller.onTapVoiceButton,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(30),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            color: Colors.black26,
            child: Center(
              child: Obx(
                () => SizedBox(
                  width: 30,
                  height: 30,
                  child: Image.asset(
                    Images.acoustic,
                    fit: BoxFit.contain,
                    width: 30,
                    height: 30,
                    color: controller.isLocalAudioMuted
                        ? Colors.white
                        : CupertinoTheme.of(context).primaryColor,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
    return Obx(() {
      // sonar 有bug 所以这么写
      const radius = 60.0;
      return controller.isLocalAudioMuted
          ? Container(
              margin: const EdgeInsets.all(radius / 3.0),
              width: radius,
              height: radius,
              child: button,
            )
          : Sonar(
              radius: radius,
              waveColor: CupertinoTheme.of(context).primaryColor,
              child: button,
            );
    });
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
}
