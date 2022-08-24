import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:super_rent/src/controllers/message/conversation.dart';
import 'package:super_rent/src/controllers/message/get_house_controller.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/services/user.dart';
import 'package:super_rent/src/utils/em_chatmanger_listener.dart';

class LiveChatMessage {
  final GlobalKey key;
  final RentUserInfo user;
  final String content;
  final Rx<double> opacity;

  LiveChatMessage(this.key, this.user, this.content, this.opacity);

  RenderBox? get renderBox {
    final box = key.currentContext?.findRenderObject();
    if (box != null) {
      return box as RenderBox;
    }
    return null;
  }
}

mixin ChatMixin on GetXHouseController {
  List<LiveChatMessage> get messages => _messages;
  final _messages = <LiveChatMessage>[].obs;

  final messageScrollController = ScrollController();
  final messageListKey = GlobalKey(debugLabel: "message_list_view");

  late final double listViewHeight;

  late final LiveChatListener _emListener;

  @override
  void onInit() {
    super.onInit();

    messageScrollController.addListener(() {
      debugPrint(messageScrollController.position.pixels.toString());
      _updateOpacity();
    });

    _emListener = LiveChatListener(
        memberExited: ((u) => _insertMessage(LiveChatMessage(GlobalKey(),
            EMUserInfoX.system, "[${u.nickName}] 离开了频道", 1.0.obs))),
        memberJoined: ((u) => _insertMessage(LiveChatMessage(GlobalKey(),
            EMUserInfoX.system, "[${u.nickName}] 加入了频道", 1.0.obs))),
        receiveMessages: (messages) {
          for (final m in messages) {
            _insertEMMessage(m);
          }
        });

    EMClient.getInstance.startCallback();
    EMClient.getInstance.chatManager.addChatManagerListener(_emListener);
    EMClient.getInstance.chatRoomManager
        .addChatRoomManagerListener(_emListener);
    EMClient.getInstance.chatRoomManager.joinChatRoom(house.chatRoomId);
  }

  Future<void> leaveChatRoom() async {
    return EMClient.getInstance.chatRoomManager.leaveChatRoom(house.chatRoomId);
  }

  @override
  void onClose() {
    super.onClose();
    EMClient.getInstance.chatManager.removeChatManagerListener(_emListener);
    EMClient.getInstance.chatRoomManager
        .removeChatRoomManagerListener(_emListener);
  }

  @override
  void onReady() {
    super.onReady();

    final renderBox =
        messageListKey.currentContext?.findRenderObject() as RenderBox;
    listViewHeight = renderBox.size.height;
  }

  void sendWelcomeMessage(String welcomeMessage) async {
    _insertMessage(
      LiveChatMessage(GlobalKey(), EMUserInfoX.system, welcomeMessage, 1.0.obs),
    );
  }

  void sendTextMessage(String content) async {
    final msg = EMMessage.createTxtSendMessage(
      targetId: house.chatRoomId,
      content: content,
      chatType: ChatType.ChatRoom,
    );

    EMClient.getInstance.chatManager.sendMessage(msg);

    _insertEMMessage(msg);
  }

  void _insertEMMessage(EMMessage message) async {
    final body = message.body;
    if (body is EMTextMessageBody) {
      final user = await Get.find<UserService>().fetchUserInfo(message.from!);
      _insertMessage(LiveChatMessage(GlobalKey(), user, body.content, 1.0.obs));
    }
  }

  void _insertMessage(LiveChatMessage message) {
    _messages.insert(0, message);
    if (messageScrollController.hasClients) {
      _updateOpacity();
    }
  }

  void _updateOpacity() {
    // 不能滚动
    for (var i = 0; i < _messages.length; i++) {
      final renderBox = _messages[i].renderBox;

      if (i != 0 && renderBox != null) {
        //
        final height = _messages
            .sublist(0, i + 1)
            .map((element) => element.renderBox?.size.height ?? 0)
            .reduce((value, element) => value + element);
        final offset =
            listViewHeight - (height - messageScrollController.position.pixels);
        var opacity = offset / listViewHeight;
        opacity = opacity < 0
            ? 0.0
            : opacity > 1.0
                ? 1.0
                : opacity;
        _messages[i].opacity(opacity);
      }
    }
  }
}

Widget buildLiveChatMessageItem(BuildContext context, LiveChatMessage message) {
  return Obx(() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Opacity(
        key: message.key,
        opacity: message.opacity.value,
        child: Padding(
          padding: const EdgeInsets.only(top: 10.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(30),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
              child: Container(
                color: Colors.black26,
                padding: const EdgeInsets.only(
                    left: 4, top: 4, bottom: 4, right: 30),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    ClipOval(
                      child: SizedBox(
                        width: 50,
                        height: 50,
                        child: Image.network(message.user.avatarUrl!),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "${message.user.nickName ?? "系统消息"}:",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            message.content,
                            style: const TextStyle(color: Colors.white70),
                            maxLines: 2,
                            softWrap: true,
                            overflow: TextOverflow.clip,
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
}

typedef EMUserInfoBlock = void Function(EMUserInfo u);

class LiveChatListener extends EMChatRoomManagerListener
    with EMChatManagerDefaultListener {
  UserService get _us => Get.find<UserService>();
  final EMUserInfoBlock? memberJoined;
  final EMUserInfoBlock? memberExited;
  final ValueChanged<List<EMMessage>>? receiveMessages;

  LiveChatListener(
      {this.memberJoined, this.memberExited, this.receiveMessages});

  @override
  void onMessagesReceived(List<EMMessage> messages) {
    receiveMessages?.call(messages);
  }

  @override
  void onAdminAddedFromChatRoom(String roomId, String admin) {
    // TODO: implement onAdminAddedFromChatRoom
  }

  @override
  void onAdminRemovedFromChatRoom(String roomId, String admin) {
    // TODO: implement onAdminRemovedFromChatRoom
  }

  @override
  void onAllChatRoomMemberMuteStateChanged(String roomId, bool isAllMuted) {
    // TODO: implement onAllChatRoomMemberMuteStateChanged
  }

  @override
  void onAllowListAddedFromChatRoom(String roomId, List<String> members) {
    // TODO: implement onAllowListAddedFromChatRoom
  }

  @override
  void onAllowListRemovedFromChatRoom(String roomId, List<String> members) {
    // TODO: implement onAllowListRemovedFromChatRoom
  }

  @override
  void onAnnouncementChangedFromChatRoom(String roomId, String announcement) {
    // TODO: implement onAnnouncementChangedFromChatRoom
  }

  @override
  void onChatRoomDestroyed(String roomId, String? roomName) {
    // TODO: implement onChatRoomDestroyed
  }

  @override
  void onMemberExitedFromChatRoom(
      String roomId, String? roomName, String participant) {
    _us.fetchUserInfo(participant).then((value) => memberExited?.call(value));
  }

  @override
  void onMemberJoinedFromChatRoom(String roomId, String participant) {
    _us.fetchUserInfo(participant).then((value) => memberJoined?.call(value));
  }

  @override
  void onMuteListAddedFromChatRoom(
      String roomId, List<String> mutes, String? expireTime) {
    // TODO: implement onMuteListAddedFromChatRoom
  }

  @override
  void onMuteListRemovedFromChatRoom(String roomId, List<String> mutes) {
    // TODO: implement onMuteListRemovedFromChatRoom
  }

  @override
  void onOwnerChangedFromChatRoom(
      String roomId, String newOwner, String oldOwner) {
    // TODO: implement onOwnerChangedFromChatRoom
  }

  @override
  void onRemovedFromChatRoom(
      String roomId, String? roomName, String? participant) {
    // TODO: implement onRemovedFromChatRoom
  }
}
