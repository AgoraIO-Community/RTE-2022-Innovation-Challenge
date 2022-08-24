import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:intl/intl.dart';
import 'package:super_rent/src/services/user.dart';
import 'package:super_rent/src/utils/em_chatmanger_listener.dart';

extension EMUserInfoX on EMUserInfo {
  static EMUserInfo system = EMUserInfo.fromJson({
    "userId": "19900328",
    "nickName": "系统通知",
    // 之所以用线上的是方便后期更新
    "avatarUrl":
        "https://rent-file.rainbowbridge.top/jPNPNFbdoL67UYPsWJkmJkBAzsIgBPoN/system_avatar.png",
  });
}

extension EMMessageX on EMMessage {
  String get preview {
    if (body is EMTextMessageBody) {
      return (body as EMTextMessageBody).content;
    } else if (body is EMImageMessageBody) {
      return "[图片]";
    } else if (body is EMVideoMessageBody) {
      return "[视频]";
    } else if (body is EMFileMessageBody) {
      return "[文件]";
    } else if (body is EMCustomMessageBody) {
      final customBody = body as EMCustomMessageBody;
      if (customBody.event == "house_card") {
        return '[房源推荐]';
      } else if (customBody.event == 'request_live_card') {
        return '${customBody.params?['address']} 带看邀请 ⏺️';
      } else {
        return '不支持的自定义消息 [${customBody.event}]';
      }
    } else {
      return "[暂不支持预览]";
    }
  }

  String get timestamp {
    final now = DateTime.now();
    final date = DateTime.fromMillisecondsSinceEpoch(serverTime);

    if (DateUtils.isSameDay(now, date)) {
      return DateFormat("hh:mm").format(date);
    }

    if (DateUtils.isSameDay(now.subtract(const Duration(days: -1)), date)) {
      return DateFormat("昨天 hh:mm").format(date);
    }

    if (date.difference(now) < const Duration(days: 7)) {
      return DateFormat.EEEE("zh").format(date);
    }

    return DateFormat("MM月dd日").format(date);
  }
}

class ConversationListModel {
  final EMConversation conversation;
  final EMUserInfo userInfo;
  final EMMessage? lastMessage;

  final int unreadCount;

  ConversationListModel(
      this.conversation, this.userInfo, this.lastMessage, this.unreadCount);

  String? get url {
    final body = lastMessage?.body;
    if (body is EMCustomMessageBody) {
      return body.params?["url"];
    }
    return null;
  }
}

class ConversationController extends GetxController
    with EMChatManagerDefaultListener {
  EMChatManager get _chatManager => EMClient.getInstance.chatManager;

  List<ConversationListModel> get models => _models;
  final _models = <ConversationListModel>[].obs;

  UserService get _us => Get.find<UserService>();

  @override
  void onReady() {
    super.onReady();

    _refreshConversationList();
    _chatManager.addChatManagerListener(this);
  }

  @override
  void onClose() {
    super.onClose();
    _chatManager.removeChatManagerListener(this);
  }

  @override
  void refresh() {
    _refreshConversationList();
  }

  void _refreshConversationList() async {
    final conversations = await _chatManager.loadAllConversations();
    await _us.load(conversations.map((e) => e.id).toList(growable: false));
    _models.clear();
    for (final c in conversations) {
      if (c.type == EMConversationType.Chat) {
        final userInfo = await _us.fetchUserInfo(c.id);
        final lastMessage = await c.latestMessage();
        _models.add(ConversationListModel(
          c,
          userInfo,
          lastMessage,
          await c.unreadCount(),
        ));
      }
    }
  }

  void _updateConversationModel(List<EMMessage> messages) async {
    for (final m in messages) {
      final index =
          _models.indexWhere((p0) => p0.conversation.id == m.conversationId);
      if (index != -1) {
        final model = _models[index];
        _models[index] = ConversationListModel(
          model.conversation,
          model.userInfo,
          m,
          await model.conversation.unreadCount(),
        );
      }
    }
  }

  Future<bool> deleteConversation(String conversationId) async {
    return _chatManager.deleteConversation(conversationId);
  }

  Future<bool> markAllMessagesAsRead(int index) async {
    final model = _models[index];
    await model.conversation.markAllMessagesAsRead();

    _models[index] = ConversationListModel(
        model.conversation, model.userInfo, model.lastMessage, 0);

    return true;
  }

  @override
  void onMessagesReceived(List<EMMessage> messages) {
    // 更新last message
    _updateConversationModel(messages);
  }

  @override
  void onMessagesDelivered(List<EMMessage> messages) {
    // 更新last message
    _updateConversationModel(messages);
  }
}
