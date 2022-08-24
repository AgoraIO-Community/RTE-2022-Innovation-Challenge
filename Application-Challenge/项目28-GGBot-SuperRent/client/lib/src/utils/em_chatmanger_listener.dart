import 'package:im_flutter_sdk/im_flutter_sdk.dart';

mixin EMChatManagerDefaultListener implements EMChatManagerListener {
  @override
  void onCmdMessagesReceived(List<EMMessage> messages) {
    // TODO: implement onCmdMessagesReceived
  }

  @override
  void onConversationRead(String from, String to) {
    // TODO: implement onConversationRead
  }

  @override
  void onConversationsUpdate() {
    // TODO: implement onConversationsUpdate
  }

  @override
  void onGroupMessageRead(List<EMGroupMessageAck> groupMessageAcks) {
    // TODO: implement onGroupMessageRead
  }

  @override
  void onMessageReactionDidChange(List<EMMessageReactionEvent> list) {
    // TODO: implement onMessageReactionDidChange
  }

  @override
  void onMessagesDelivered(List<EMMessage> messages) {
    // TODO: implement onMessagesDelivered
  }

  @override
  void onMessagesRead(List<EMMessage> messages) {
    // TODO: implement onMessagesRead
  }

  @override
  void onMessagesRecalled(List<EMMessage> messages) {
    // TODO: implement onMessagesRecalled
  }

  @override
  void onMessagesReceived(List<EMMessage> messages) {
    // TODO: implement onMessagesReceived
  }

  @override
  void onReadAckForGroupMessageUpdated() {
    // TODO: implement onReadAckForGroupMessageUpdated
  }
}
