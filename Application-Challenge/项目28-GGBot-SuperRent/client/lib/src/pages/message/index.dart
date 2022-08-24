import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_swipe_action_cell/core/cell.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/pages/message/chat.dart';
import 'package:super_rent/src/widgets/empty.dart';

import '../../controllers/message/conversation.dart';

class ConversationPage extends GetWidget<ConversationController> {
  const ConversationPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("消息"),
        border: null,
      ),
      child: SafeArea(
        child: Align(
          alignment: Alignment.center,
          child: Obx(
            () => controller.models.isEmpty
                ? const Empty(message: '暂时没有新消息')
                : ListView.separated(
                    itemCount: controller.models.length,
                    itemBuilder: _buildConversationItem,
                    separatorBuilder: (BuildContext context, int index) {
                      return const Divider(
                        height: 0.0,
                      );
                    },
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildConversationItem(BuildContext context, int index) {
    final m = controller.models[index];

    return SwipeActionCell(
      key: ValueKey(index),
      trailingActions: [
        SwipeAction(
          onTap: (handler) {
            controller
                .deleteConversation(m.conversation.id)
                .then((value) => handler(value));
          },
          title: "删除",
          color: CupertinoColors.systemRed,
          nestedAction: SwipeNestedAction(title: "确认删除"),
        ),
        SwipeAction(
          title: "标为已读",
          onTap: (CompletionHandler handler) async {
            controller
                .markAllMessagesAsRead(index)
                .then((value) => handler(false));
          },
          color: Colors.blue,
        ),
      ],
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          Get.to(() => ChatPage(m.conversation.id))?.then(
            (value) => controller.refresh(),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            children: [
              SizedBox(
                width: 50,
                height: 50,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: m.userInfo.avatarUrl == null
                          ? const CircleAvatar(
                              backgroundColor:
                                  CupertinoColors.systemGroupedBackground,
                            )
                          : ClipOval(
                              child: Image.network(
                                m.userInfo.avatarUrl!,
                                width: 50,
                              ),
                            ),
                    ),
                    if (m.unreadCount > 0)
                      Positioned(
                        top: 0,
                        right: 0,
                        child: Container(
                          width: 20,
                          height: 20,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: CupertinoColors.systemRed,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            "${m.unreadCount}",
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            m.userInfo.nickName ?? "未知用户",
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (m.lastMessage != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4.0, bottom: 4.0),
                        child: Text(
                          m.lastMessage!.preview,
                          style: const TextStyle(),
                        ),
                      ),
                    if (m.lastMessage != null)
                      Text(
                        m.lastMessage!.timestamp,
                        style: const TextStyle(
                          color: CupertinoColors.secondaryLabel,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
              ),
              if (m.url != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(4.0),
                  child: CachedNetworkImage(
                    imageUrl: m.url!,
                    width: 80,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
