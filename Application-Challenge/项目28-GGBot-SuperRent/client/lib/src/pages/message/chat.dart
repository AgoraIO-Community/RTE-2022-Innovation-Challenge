import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:g_json/g_json.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:super_rent/src/controllers/home/house_list.dart';
import 'package:super_rent/src/controllers/message/live.dart';
import 'package:super_rent/src/controllers/message/watch_live.dart';
import 'package:super_rent/src/controllers/profile/user_detail.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/pages/home/house_list.dart';
import 'package:super_rent/src/pages/message/live.dart';
import 'package:super_rent/src/pages/message/watch_live.dart';
import 'package:super_rent/src/pages/profile/detail.dart';
import 'package:super_rent/src/services/leancloud.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/em_chatmanger_listener.dart';
import 'package:super_rent/src/utils/widget.dart';
import 'package:super_rent/src/widgets/button.dart';
import 'package:super_rent/src/widgets/empty.dart';
import 'package:super_rent/src/widgets/post.dart';

import '../../controllers/house.dart';
import '../../models/easemob.dart';
import '../../services/account.dart';
import '../../services/user.dart';
import '../../utils/images.dart';
import '../details/house.dart';

const _messageLoadCount = 10;

class ChatPage extends StatefulWidget {
  final String conversationId;
  final House? house;
  final LCObject? post;
  final bool sendLiveRequest;

  const ChatPage(
    this.conversationId, {
    this.house,
    this.post,
    this.sendLiveRequest = false,
    Key? key,
  }) : super(key: key);

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> with EMChatManagerDefaultListener {
  late EMConversation conversation;

  types.User get user => _user;
  late types.User _user;

  EMChatManager get _chatManager => EMClient.getInstance.chatManager;
  UserService get _us => Get.find<UserService>();

  final _messages = <types.Message>[];

  var _hasMoreMessage = false;
  var _isLoading = false;

  EMUserInfo? _participatorInfo;

  final _messageFutures = <String, Future>{};

  bool get isSuperRentChinaGroup =>
      widget.conversationId == superRentChinaGroupId;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      resizeToAvoidBottomInset: false,
      navigationBar: CupertinoNavigationBar(
        border: null,
        middle: Text(isSuperRentChinaGroup
            ? "随心租全国社群"
            : _participatorInfo?.nickName ?? ""),
        backgroundColor: CupertinoColors.systemBackground,
        trailing: !isSuperRentChinaGroup
            ? IconButton(
                icon: const Icon(
                  CupertinoIcons.ellipsis_circle,
                  size: 26,
                ),
                onPressed: () async {
                  final tc = loading();
                  final r = await API.findUser(widget.conversationId);
                  tc.dismiss();
                  if (r.isError) {
                    toast(error: r.asError.toString());
                    return;
                  }
                  Get.to(
                    const UserDetailPage(),
                    binding: BindingsBuilder.put(
                        () => UserDetailController(r.asValue!.value)),
                  );
                },
              )
            : null,
      ),
      child: Column(
        children: [
          if (widget.post != null) _buildSendHouseBanner(context),
          if (widget.house != null) _buildRequestLiveBanner(context),
          Expanded(
            child: Chat(
              messages: _messages,
              user: _user,
              onSendPressed: _onSendPressed,
              showUserAvatars: true,
              showUserNames: true,
              inputOptions: const InputOptions(),
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              scrollPhysics: const AlwaysScrollableScrollPhysics(),
              onAttachmentPressed: _onAttachmentPressed,
              isLastPage: !_hasMoreMessage,
              onEndReached: _onEndReached,
              emptyState: null,
              customMessageBuilder: _customMessageBuilder,
              onAvatarTap: (user) async {
                final tc = loading();
                final r = await API.findUser(user.id);
                tc.dismiss();
                if (r.isError) {
                  toast(error: "获取用户信息失败");
                  return;
                }
                Get.to(() => const UserDetailPage(),
                    binding: BindingsBuilder.put(
                        () => UserDetailController(r.asValue!.value)));
              },
              theme: DefaultChatTheme(
                  // backgroundColor: CupertinoColors.systemGroupedBackground,
                  inputBackgroundColor: CupertinoTheme.of(context).primaryColor,
                  attachmentButtonIcon: const Icon(
                    Icons.more_vert_rounded,
                    color: Colors.white,
                  )
                  // inputBackgroundColor: CupertinoColors.systemGrey4,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    final u = Get.find<AccountService>().currentUser!;
    _user = types.User(
      id: '${u['emUid']}',
      createdAt: u.createdAt!.millisecondsSinceEpoch,
      updatedAt: u.updatedAt!.millisecondsSinceEpoch,
      firstName: u['nickname']!,
      lastName: "",
      imageUrl: u['avatar'],
      role: types.Role.user,
    );
    _setup();
  }

  void _setup() async {
    // 查一下聊天参与者的信息
    _us.fetchUserInfo(widget.conversationId).then((value) => setState(() {
          _participatorInfo = value;
        }));
    final type = isSuperRentChinaGroup
        ? EMConversationType.ChatRoom
        : EMConversationType.Chat;
    // 从服务器同步一下历史消息
    _chatManager.fetchHistoryMessages(
      conversationId: widget.conversationId,
      type: type,
    );

    // 监听新消息
    _chatManager.addChatManagerListener(this);

    final c =
        await _chatManager.getConversation(widget.conversationId, type: type);
    assert(c != null);

    c?.markAllMessagesAsRead();

    conversation = c!;

    // 触发刷新message
    _loadMessage();

    if (widget.sendLiveRequest) {
      _liveRequest();
    }

    if (isSuperRentChinaGroup) {
      EMClient.getInstance.startCallback();
    }
  }

  @override
  void dispose() {
    _chatManager.removeChatManagerListener(this);
    super.dispose();
  }

  // 用户从帖子详情页发起私信，此时需要给用户发送房源
  Widget _buildSendHouseBanner(BuildContext context) {
    assert(widget.post != null);
    final post = widget.post!;
    final compounds = (post['compounds'] as List).cast<LCObject>();

    return Container(
      height: 60,
      color: CupertinoColors.systemBackground,
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                compounds.first['name'],
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text.rich(
                TextSpan(
                  children: [
                    const TextSpan(text: "¥", style: TextStyle(fontSize: 10)),
                    TextSpan(
                      text: "${post['price']}/月",
                      style: const TextStyle(fontSize: 14),
                    )
                  ],
                ),
              ),
            ],
          ),
          const Spacer(),
          SizedBox(
            height: 40,
            child: CupertinoButton.filled(
              borderRadius: BorderRadius.circular(20),
              padding: const EdgeInsets.symmetric(horizontal: 12.0),
              onPressed: _suggestHouse,
              child: const Text("发送房源", style: TextStyle(fontSize: 14)),
            ),
          ),
        ],
      ),
    );
  }

  // 用户从房源详情页发起私信，此时可以请求马上开启带看
  Widget _buildRequestLiveBanner(BuildContext context) {
    assert(widget.house != null);
    final house = widget.house!;
    final url = house.medias.isEmpty
        ? Images.housePlaceholder
        : house.medias.first["url"].stringValue;
    return Container(
      height: 60,
      color: CupertinoColors.systemBackground,
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            margin: const EdgeInsets.all(4.0),
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: CachedNetworkImage(imageUrl: url),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                house.compoundAddress,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text.rich(
                TextSpan(
                  children: [
                    const TextSpan(text: "¥", style: TextStyle(fontSize: 10)),
                    TextSpan(
                      text: "${house.monthlyRent.toStringAsFixed(0)}/月",
                      style: const TextStyle(fontSize: 14),
                    )
                  ],
                ),
              ),
            ],
          ),
          const Spacer(),
          SizedBox(
            height: 40,
            child: CupertinoButton.filled(
              borderRadius: BorderRadius.circular(20),
              padding: const EdgeInsets.symmetric(horizontal: 12.0),
              onPressed: _liveRequest,
              child: const Text("邀请在线看房", style: TextStyle(fontSize: 14)),
            ),
          ),
        ],
      ),
    );
  }

  void _loadMessage() async {
    var startMessageId = '';
    if (_messages.isNotEmpty) {
      startMessageId = _messages.last.id;
    }

    // 获取消息
    final emMessages = await conversation.loadMessages(
      loadCount: _messageLoadCount,
      startMsgId: startMessageId,
      direction: EMSearchDirection.Up,
    );
    // 首先批量拉去一下用户信息
    await _us.load(Set<String>.from(emMessages.map((e) => e.from!))
        .toList(growable: false));

    _hasMoreMessage = emMessages.length == _messageLoadCount;
    _isLoading = false;

    for (final m in emMessages.reversed) {
      _messages.add(await _assembleReceivedMessage(m));
    }

    // 触发更新
    setState(() {});
  }

  Future<types.Message> _assembleReceivedMessage(EMMessage m) async {
    final userInfo = await _us.fetchUserInfo(m.from!);

    final author = types.User(
      id: userInfo.userId,
      imageUrl: userInfo.avatarUrl,
      firstName: userInfo.nickName,
    );

    return m.convert(author)
      ..copyWith(
        showStatus: false,
        status: types.Status.seen,
        createdAt: m.serverTime,
      );
  }

  Future<void> _onEndReached() async {
    if (_isLoading || !_hasMoreMessage) {
      return;
    }
    _isLoading = true;
    return _loadMessage();
  }

  void _onAttachmentPressed() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return SafeArea(
          child: CupertinoActionSheet(
            actions: [
              CupertinoActionSheetAction(
                onPressed: () {
                  Navigator.of(context).pop();
                  _suggestHouse();
                },
                child: const Text("发送房源"),
              ),
              CupertinoActionSheetAction(
                  onPressed: () {
                    Navigator.of(context).pop();
                    toast(succeed: "请从您发布的房源详情页发起带看");
                  },
                  child: const Text("邀请直播带看")),
            ],
            cancelButton: CupertinoActionSheetAction(
              child: const Text("取消"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ),
        );
      },
    );
  }

  void _onSendPressed(types.PartialText partialText) {
    final msg = EMMessage.createTxtSendMessage(
      targetId: widget.conversationId,
      content: partialText.text,
      chatType: isSuperRentChinaGroup ? ChatType.ChatRoom : ChatType.Chat,
    );

    msg.attributes = {
      "em_apns_ext": {
        "em_alert_title": _user.firstName,
        "em_alert_subTitle": "",
        "em_alert_body": partialText.text,
        "conversationId": msg.conversationId,
      }
    };

    _sendMessage(msg);
  }

  EMMessage _assembleHouseMessage(List<House> sendingHouses) {
    final msg = EMMessage.createCustomSendMessage(
      targetId: widget.conversationId,
      event: "house_card",
      params: {
        "houseIds": sendingHouses.map((e) => e.objectId!).join(","),
      },
    );

    msg.attributes = {
      "em_apns_ext": {
        "em_alert_title": "房源推荐",
        "em_alert_subTitle": "",
        "em_alert_body": "${_user.firstName}向您推荐了他的房源",
        "conversationId": msg.conversationId,
      }
    };

    return msg;
  }

  Widget _customMessageBuilder(types.Message message,
      {required int messageWidth}) {
    if (message.metadata == null) {
      return const Text("unsupported");
    }

    final event = message.metadata!['event'];
    if (event == 'house_card') {
      return _houseCardMessageBuilder(message, messageWidth: messageWidth);
    } else if (event == 'request_live_card') {
      return _requestLiveMessageBuilder(message, messageWidth: messageWidth);
    }
    return const Text("unsupported");
  }

  Widget _houseCardMessageBuilder(types.Message message,
      {required int messageWidth}) {
    final p = message.metadata!;
    final houseIds = p['houseIds'].toString().split(",");
    assert(houseIds.isNotEmpty);

    var future = _messageFutures[message.id];
    if (future == null) {
      future = LCQuery("House")
          .include('compound')
          .include('creator')
          .whereContainedIn("objectId", houseIds)
          .find();
      _messageFutures[message.id] = future;
    }

    return Container(
      color: CupertinoColors.systemGroupedBackground,
      width: messageWidth * 0.8,
      child: Column(
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 8.0, bottom: 2.0),
            child: Text(
              "房源推荐",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          const Text(
            "这些是我挑选的适合你的房源",
            style:
                TextStyle(fontSize: 14, color: CupertinoColors.secondaryLabel),
          ),
          const Divider(),
          FutureBuilder<List<LCObject>?>(
            key: ValueKey(message.id),
            builder: (context, data) {
              if (data.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.only(bottom: 12.0),
                  child: CupertinoActivityIndicator(animating: true),
                );
              }
              String? message;
              if (data.hasError) {
                message = "加载推荐房源失败";
              }
              final houses = data.data ?? [];
              if (houses.isEmpty) {
                message = "无推荐房源";
              }
              if (message != null) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Text(
                    message,
                    style: const TextStyle(
                      color: CupertinoColors.secondaryLabel,
                    ),
                  ),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: ((context, index) {
                  final house = houses[index];
                  final url = house.medias.isEmpty
                      ? Images.housePlaceholder
                      : house.medias.first["url"].stringValue;
                  return GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      Get.to(
                        () => const HouseDetailPage(),
                        binding: BindingsBuilder.put(
                          () => HouseDetailController(house),
                        ),
                      );
                    },
                    child: SizedBox(
                      child: Row(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(4),
                              color: CupertinoColors.systemGroupedBackground,
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: CachedNetworkImage(
                              imageUrl: url,
                              fit: BoxFit.cover,
                              width: 60,
                              height: 60,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                house.subAddress,
                                style: const TextStyle(
                                  color: CupertinoColors.secondaryLabel,
                                  fontSize: 12,
                                ),
                              ),
                              const Text(
                                "合租 3卧3卫 锦秋花园",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              Text.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text:
                                          "¥${house.monthlyRent.toStringAsFixed(0)}",
                                    ),
                                    const TextSpan(
                                      text: "/月",
                                      style: TextStyle(fontSize: 10),
                                    ),
                                  ],
                                ),
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  );
                }),
                itemCount: houses.length,
                separatorBuilder: (BuildContext context, int index) =>
                    const Divider(),
              );
            },
            future: future as Future<List<LCObject>?>,
          ),
          primaryButton(
            context,
            child: const Text("查看更多"),
            onTap: () => Get.to(
              const HouseListPage(),
              binding: BindingsBuilder.put(
                () => HouseListController(),
              ),
            ),
            fixedSize: Size(messageWidth * 0.6, 40),
          ),
          const SizedBox(height: 8.0),
        ],
      ),
    );
  }

  Widget _requestLiveMessageBuilder(types.Message message,
      {required int messageWidth}) {
    final data = JSON(message.metadata!);
    final sentByMe = message.author.id == _user.id;

    return GestureDetector(
      onTap: () async {
        final tc = loading();
        final house =
            LCObject.createWithoutData("House", data['houseId'].stringValue);
        await house.fetch(includes: ["compound", "creator"]);
        if (sentByMe) {
          Get.to(
            const WatchLivePage(),
            binding: BindingsBuilder.put(() => WatchLiveController(house)),
          );
        } else {
          Get.to(
            const LivePage(),
            binding: BindingsBuilder.put(() => LiveController(house)),
          )?.then((value) => tc.dismiss());
        }
        Future.delayed(const Duration(milliseconds: 500))
            .then((value) => tc.dismiss());
      },
      child: Container(
        color: CupertinoColors.systemBackground,
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4.0),
                  child: CachedNetworkImage(
                    width: 50,
                    imageUrl: Images.housePlaceholder,
                  ),
                ),
                const SizedBox(width: 8.0),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(data['address'].stringValue),
                    Text(
                      '¥${data['price'].stringValue}',
                      style: const TextStyle(
                          color: CupertinoColors.secondaryLabel, fontSize: 14),
                    ),
                  ],
                ),
              ],
            ),
            Container(
              height: 8,
              width: 150,
              margin: const EdgeInsets.only(bottom: 8.0),
              decoration: BoxDecoration(border: bottomBorder()),
            ),
            Text(
              sentByMe ? "邀请房东在线带看" : "租客邀请在线带",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  // 发送消息到环信
  void _sendMessage(EMMessage message) {
    final typesMessage = message.convert(_user)
      ..copyWith(
        showStatus: true,
        status: types.Status.sending,
        createdAt: message.localTime,
      );

    // 更新消息发送状态
    updateMessageStatus(types.Status status) {
      final index = _messages.indexOf(typesMessage);
      final newMessage = typesMessage.copyWith(status: status);
      setState(() {
        _messages[index] = newMessage;
      });
    }

    message.setMessageStatusCallBack(
      MessageStatusCallBack(
        onSuccess: () => updateMessageStatus(types.Status.sent),
        onDeliveryAck: () => updateMessageStatus(types.Status.delivered),
        onError: (err) => updateMessageStatus(types.Status.error),
        onReadAck: (() => updateMessageStatus(types.Status.seen)),
      ),
    );

    setState(() {
      _messages.insert(0, typesMessage);
    });

    // 环信发出去
    EMClient.getInstance.chatManager.sendMessage(message);
  }

  // 请求看房
  void _liveRequest() {
    final message = assembleRequestLiveMessage(widget.house!);
    _sendMessage(message);
  }

  // 向租客推荐房源
  void _suggestHouse() async {
    final tc = loading();

    // 去加载当前这个用户的所有房源
    final houses = await LCQuery("House")
        .include('compound')
        .include('creator')
        .whereEqualTo("creator", Get.find<AccountService>().currentUser)
        .find();
    final selectableHouses = (houses ?? []).selectable;
    tc.dismiss();

    showCupertinoModalBottomSheet(
        context: context,
        builder: (context) {
          return SafeArea(
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Text(
                                "请选择要发送的房源",
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 6.0),
                              Text(
                                "*及时清理下架房源，可提高您的信誉积分哦～",
                                style: TextStyle(
                                    fontSize: 12,
                                    color: CupertinoColors.secondaryLabel),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => Get.back(),
                          icon: const Icon(
                            Icons.close,
                            color: CupertinoColors.label,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: selectableHouses.isEmpty
                        ? const Empty()
                        : ListView.separated(
                            padding: const EdgeInsets.all(16.0),
                            itemBuilder: ((context, index) {
                              final sh = selectableHouses[index];
                              return GestureDetector(
                                onTap: sh.isSelected.toggle,
                                child: Row(
                                  children: [
                                    Obx(
                                      () => Icon(
                                        sh.isSelected.isTrue
                                            ? Icons.check_box_outlined
                                            : Icons.check_box_outline_blank,
                                      ),
                                    ),
                                    const SizedBox(width: 8.0),
                                    Expanded(
                                      child: buildHouseListItem(
                                        context,
                                        sh.house,
                                        onTap: sh.isSelected.toggle,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            cacheExtent: 100,
                            itemCount: selectableHouses.length,
                            separatorBuilder:
                                (BuildContext context, int index) =>
                                    const Divider(),
                          ),
                  ),
                  if (selectableHouses.isNotEmpty)
                    Obx(() {
                      return primaryButton(
                        context,
                        child: const Text("确认推荐"),
                        fixedSize: const Size(200, 44),
                        onTap: selectableHouses
                                .where((sh) => sh.isSelected.isTrue)
                                .isEmpty
                            ? null
                            : () {
                                final message = _assembleHouseMessage(
                                  selectableHouses
                                      .where((element) =>
                                          element.isSelected.isTrue)
                                      .map((e) => e.house)
                                      .toList(growable: false),
                                );
                                _sendMessage(message);
                                Get.back();
                              },
                      );
                    }),
                ],
              ),
            ),
          );
        });
  }

  // 环信消息回调
  // 新消息回调
  @override
  void onMessagesReceived(List<EMMessage> messages) async {
    for (final m in messages) {
      await conversation.markMessageAsRead(m.msgId);
      // _chatManager.sendMessageReadAck(m);
      final msg = await _assembleReceivedMessage(m);
      setState(() {
        _messages.insert(0, msg);
      });
    }
  }
}

extension TypesMessage on EMMessage {
  // 模型转换
  types.Message convert(types.User author) {
    types.Message typesMessage;
    final body = this.body;
    if (body is EMTextMessageBody) {
      typesMessage = types.TextMessage(
        author: author,
        id: msgId,
        text: body.content,
      );
    } else if (body is EMCustomMessageBody) {
      typesMessage = types.CustomMessage(
        author: author,
        id: msgId,
        metadata: {
          if (body.params != null) ...body.params!,
          "event": body.event,
        },
      );
    } else {
      typesMessage = types.UnsupportedMessage(
        author: author,
        id: msgId,
      );
    }
    return typesMessage;
  }
}

class SelectableHouse {
  final House house;
  final RxBool isSelected;

  SelectableHouse(this.house, this.isSelected);

  SelectableHouse.selected(this.house) : isSelected = true.obs;
}

extension Selectable on List<House> {
  List<SelectableHouse> get selectable =>
      map((e) => SelectableHouse.selected(e)).toList(growable: false);
}
