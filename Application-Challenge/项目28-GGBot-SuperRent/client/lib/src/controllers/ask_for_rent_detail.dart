import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_keyboard_visibility/flutter_keyboard_visibility.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:intl/intl.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/house_type.dart';
import 'package:super_rent/src/services/account.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/em_chatmanger_listener.dart';
import 'package:super_rent/src/utils/images.dart';

import '../services/user.dart';
import '../utils/time.dart';

extension Post on LCObject {
  bool get findRoommate => this['findRoommate'] as bool;

  LCUser get poster => this['poster'] as LCUser;

  List<LCObject> get compounds => (this['compounds'] as List).cast<LCObject>();
}

class RentDetailMode {
  final String imageName;
  final String key;
  final String value;

  RentDetailMode(this.imageName, this.key, this.value);
}

class AskForRentDetailController extends GetxController
    with EMChatManagerDefaultListener {
  final LCObject post;
  LCUser get poster => post.poster;

  AccountService get accountService => Get.find<AccountService>();

  String get avatarUrl => poster['avatar'];
  bool get posterIsMyself =>
      poster.objectId == accountService.currentUser?.objectId;
  String get name => posterIsMyself ? "我" : poster['nickname'];
  bool get isMale => poster['gender'] == 1;
  String get timeStatus {
    if (posterIsMyself) {
      return "刚刚来过";
    }
    final date = poster['lastLoggedInAt'] as DateTime;
    return "${timeDescriptionFromNow(date)}来过";
  }

  String get locationTitle {
    final firstCompound = post.compounds.first;
    var title = firstCompound["name"] + "附近";
    return title + (post.findRoommate ? "找室友" : "求租");
  }

  String get requirements {
    return post['otherRequirements'] ?? '没有要求';
  }

  List<String> get tags {
    return [
      post.findRoommate ? "#无房找室友" : "求租",
      "#${post['price']}元/月",
    ];
  }

  List<RentDetailMode> get detail {
    return [
      RentDetailMode(Images.rentPrice, "租金：", "${post['price']}元/月"),
      RentDetailMode(Images.houseType, "户型：",
          HouseType.values[post["houseType"] as int].name),
      RentDetailMode(
        Images.availableRentDate,
        "可入住日期：",
        DateFormat("M月dd日").format(DateTime.now()),
      ),
    ];
  }

  late StreamSubscription<bool> keyboardSubscription;

  bool get keyboardIsOpened => _keyboardIsOpened.value;
  late Rx<bool> _keyboardIsOpened;

  EMChatManager get chatManager => EMClient.getInstance.chatManager;
  EMConversation? conversation;

  final comments = <EMMessage>[].obs;
  final commentController = TextEditingController();

  String? chatRoomId;

  final commentFocusNode = FocusNode();

  String get commentPlaceholder => _replayMessageNickName.value.isNotEmpty
      ? "回复: $_replayMessageNickName: "
      : "点击开始评论...";
  final _replayMessageNickName = "".obs;
  EMMessage? _willReplayMessage;

  bool get isFavorite => _isFavorite.value;
  final _isFavorite = false.obs;

  AskForRentDetailController(this.post);

  @override
  void onInit() {
    super.onInit();
    final keyboardVisibilityController = KeyboardVisibilityController();
    _keyboardIsOpened = keyboardVisibilityController.isVisible.obs;
    keyboardSubscription =
        keyboardVisibilityController.onChange.listen((visible) {
      _keyboardIsOpened(visible);
      if (!visible && commentController.text.isEmpty) {
        _willReplayMessage = null;
        _replayMessageNickName("");
      }
    });
  }

  @override
  void onReady() {
    super.onReady();

    _setupChatRoom();

    // 查询一下有没有 fav 这条post
    LCQuery("Favorite").whereEqualTo("post", post).count().then(
          (value) => _isFavorite(value == 1),
        );
  }

  void _setupChatRoom() async {
    chatRoomId = post['chatRoomID'];
    if (chatRoomId == null) {
      await Future.delayed(const Duration(seconds: 2));
      await post.fetch(includes: ["poster"], keys: ["chatRoomID"]);
      chatRoomId = post['chatRoomID'];
    }

    // 聊天室暂未创建， 延迟2s后尝试加载
    if (chatRoomId == null) {
      toast(warning: "初始化聊天室失败");
      return;
    }

    // 188222037622786
    conversation = await chatManager.getConversation(
      chatRoomId!,
      type: EMConversationType.ChatRoom,
    );

    // 拉取历史记录
    await chatManager.fetchHistoryMessages(
      conversationId: conversation!.id,
      pageSize: 100,
      type: EMConversationType.ChatRoom,
    );

    // 监听新的记录
    chatManager.addChatManagerListener(this);

    // 加载本地的消息
    conversation
        ?.loadMessages(
      loadCount: 500,
      direction: EMSearchDirection.Up,
    )
        .then((value) async {
      await Get.find<UserService>()
          .load(value.map((e) => e.from!).toList(growable: false));
      for (final m in value) {
        _insertMessage(m);
      }
    });

    // 加入群聊, 就可以试试收到消息了
    await EMClient.getInstance.chatRoomManager.joinChatRoom(chatRoomId!);
  }

  void _insertMessage(EMMessage m) {
    String? replayMsgId = m.attributes?['replayMsgId']?.toString();
    if (replayMsgId != null) {
      final index = comments.indexWhere((m) => m.msgId == replayMsgId);
      assert(index != -1);
      comments.insert(index + 1, m);
    } else {
      comments.insert(0, m);
    }
  }

  void favAction() async {
    final query = LCQuery("Favorite").whereEqualTo("post", post);
    if (isFavorite) {
      final fav = await query.first();
      await fav?.delete();
      _isFavorite(false);
    } else {
      final fav = LCObject("Favorite");
      fav['post'] = post;
      await fav.save(query: query);
      _isFavorite(true);
      toast(succeed: "已收藏");
    }
  }

  replayMessage(EMMessage m, EMUserInfo? userInfo) {
    commentFocusNode.requestFocus();
    _replayMessageNickName(userInfo?.nickName ?? "");
    _willReplayMessage = m;
  }

  @override
  void onClose() {
    keyboardSubscription.cancel();
    if (chatRoomId != null) {
      EMClient.getInstance.chatRoomManager.leaveChatRoom(chatRoomId!);
    }
    chatManager.removeChatManagerListener(this);
    super.onClose();
  }

  @override
  void onMessagesDelivered(List<EMMessage> messages) {
    debugPrint(messages.toString());
  }

  @override
  void onMessagesReceived(List<EMMessage> messages) {
    for (final m in messages) {
      if (m.from == chatRoomId) {
        _insertMessage(m);
      }
    }
  }

  void sendComment(String content) async {
    if (content.isEmpty || chatRoomId == null) {
      return;
    }

    final msg = EMMessage.createTxtSendMessage(
      targetId: chatRoomId!,
      content: content,
      chatType: ChatType.ChatRoom,
    );

    if (_willReplayMessage != null) {
      msg.attributes = {
        "replayMsgId": _willReplayMessage!.msgId,
        "replayNickName": _replayMessageNickName.value,
      };
    }

    msg.setMessageStatusCallBack(
      MessageStatusCallBack(
        onSuccess: () {
          _insertMessage(msg);
        },
        onError: ((error) {
          debugPrint(error.toString());
        }),
      ),
    );

    await EMClient.getInstance.chatManager.sendMessage(msg);

    _willReplayMessage = null;
    _replayMessageNickName("");
    commentController.text = "";
  }
}
