import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:super_rent/src/services/user.dart';

class LiveChatController extends GetxController {
  final String conversationId;
  final DateTime begin;

  late EMConversation conversation;

  LiveChatController(this.conversationId, this.begin);

  types.User get user => _user;
  late types.User _user;

  EMChatManager get _chatManager => EMClient.getInstance.chatManager;
  UserService get _us => Get.find<UserService>();

  @override
  void onInit() {
    super.onInit();

    _setupConversation();
  }

  void _setupConversation() async {
    conversation = (await _chatManager.getConversation(
      conversationId,
      type: EMConversationType.ChatRoom,
    ))!;
  }
}
