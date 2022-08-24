import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:im_flutter_sdk/im_flutter_sdk.dart';
import 'package:super_rent/src/controllers/ask_for_rent_detail.dart';
import 'package:super_rent/src/pages/common/baidu_map.dart';
import 'package:super_rent/src/pages/message/chat.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/services/user.dart';
import 'package:super_rent/src/utils/images.dart';
import 'package:super_rent/src/utils/widget.dart';
import 'package:super_rent/src/widgets/button.dart';

import '../../controllers/profile/user_detail.dart';
import '../../models/easemob.dart';
import '../../services/leancloud.dart';
import '../../utils/time.dart';
import '../profile/detail.dart';

class AskForRentDetailPage extends GetWidget<AskForRentDetailController> {
  const AskForRentDetailPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        middle: Text(controller.post.findRoommate ? "无房找室友" : "找房"),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                children: [
                  Container(
                    decoration: BoxDecoration(border: bottomBorder()),
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Row(
                      children: [
                        Stack(
                          children: [
                            ClipOval(
                              child: Image.network(
                                controller.avatarUrl,
                                width: 40,
                              ),
                            ),
                            Positioned(
                              right: 0,
                              bottom: 0,
                              width: 10,
                              height: 10,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.green.shade400,
                                  border:
                                      Border.all(color: CupertinoColors.white),
                                  borderRadius: BorderRadius.circular(5.0),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    controller.name,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: controller.isMale
                                          ? Colors.blue
                                          : Colors.pink,
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 3,
                                      vertical: 1,
                                    ),
                                    child: Row(
                                      children: [
                                        Image.asset(
                                          controller.isMale
                                              ? Images.male
                                              : Images.female,
                                          color: Colors.white,
                                          width: 10,
                                        ),
                                        Text(
                                          controller.isMale ? "男" : "女",
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 8,
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                controller.timeStatus,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.secondaryLabel,
                                ),
                              ),
                            ],
                          ),
                        ),
                        primaryButton(
                          context,
                          child: const Text("私信"),
                          fixedSize: const Size(60, 30),
                          onTap: () => Get.to(
                            ChatPage(
                              controller.poster.emUsername,
                              post: controller.post,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Text(
                      controller.locationTitle,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Text(
                    controller.requirements,
                    style: const TextStyle(
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    children: [
                      ...controller.tags.map(
                        (e) => Container(
                          decoration: BoxDecoration(
                            color: CupertinoColors.secondarySystemBackground,
                            borderRadius: BorderRadius.circular(2.0),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6.0, vertical: 4.0),
                            child: Text(
                              e,
                              style: const TextStyle(
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.only(top: 32.0, bottom: 16),
                    child: Text(
                      "期望居住地",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ...controller.post.compounds.map(
                    (c) => SizedBox(
                      height: 30,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            c['name'],
                            style: const TextStyle(fontSize: 14.0),
                          ),
                          CupertinoButton(
                            padding: EdgeInsets.zero,
                            child: Row(children: const [
                              Text(
                                "查看地图",
                                style: TextStyle(fontSize: 14.0),
                              ),
                              Icon(Icons.location_on, size: 20)
                            ]),
                            onPressed: () {
                              final location = c["location"];
                              Get.to(
                                () => BaiduMap(
                                  latitude: location["latitude"],
                                  longitude: location["longitude"],
                                ),
                              );
                            },
                          )
                        ],
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(top: 32.0, bottom: 16),
                    child: Text(
                      "详细信息",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ...controller.detail.map(
                    (m) => SizedBox(
                      height: 30,
                      child: Row(
                        children: [
                          Image.asset(
                            m.imageName,
                            width: 16,
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 100,
                            child: Text(
                              m.key,
                              style: const TextStyle(
                                fontSize: 14,
                              ),
                            ),
                          ),
                          Text(
                            m.value,
                            style: const TextStyle(
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Divider(),
                  const Padding(
                    padding: EdgeInsets.only(top: 32.0, bottom: 16),
                    child: Text(
                      "评论",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Obx(
                    () => AnimatedCrossFade(
                      duration: const Duration(milliseconds: 180),
                      crossFadeState: controller.comments.isEmpty
                          ? CrossFadeState.showFirst
                          : CrossFadeState.showSecond,
                      firstChild: const Text("暂无评论"),
                      secondChild: Column(children: [
                        ...controller.comments.map(_buildComment)
                      ]),
                    ),
                  )
                ],
              ),
            ),
            Container(
              height: 60,
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: CupertinoColors.opaqueSeparator,
                    width: 0.0,
                  ),
                ),
              ),
              child: Obx(
                () => Row(
                  children: [
                    const SizedBox(width: 16),
                    Expanded(
                      child: SizedBox(
                        height: 40,
                        child: Obx(
                          () => CupertinoTextField(
                            focusNode: controller.commentFocusNode,
                            controller: controller.commentController,
                            onSubmitted: controller.sendComment,
                            decoration: BoxDecoration(
                              color: CupertinoColors.systemGroupedBackground,
                              borderRadius: BorderRadius.circular(2),
                            ),
                            placeholder: controller.commentPlaceholder,
                          ),
                        ),
                      ),
                    ),
                    ..._buildActionButtons(context),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  List<Widget> _buildActionButtons(BuildContext context) {
    if (controller.keyboardIsOpened) {
      return [
        CupertinoButton(
          onPressed: () {
            FocusManager.instance.primaryFocus?.unfocus();
            controller.sendComment(controller.commentController.text);
          },
          child: const Icon(Icons.send_rounded),
        )
      ];
    }
    return [
      const SizedBox(width: 8),
      _buildActionButton(
        context,
        icon: Obx(
          () => Icon(
            controller.isFavorite ? Icons.favorite : Icons.favorite_border,
          ),
        ),
        onPressed: controller.favAction,
      ),
      const SizedBox(width: 8),
      _buildActionButton(
        context,
        icon: const Icon(Icons.share),
        onPressed: () => toast(warning: "试运营暂不支持分享"),
      ),
      const SizedBox(width: 16),
    ];
  }

  Widget _buildActionButton(BuildContext context,
      {required Widget icon, VoidCallback? onPressed}) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onPressed,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
            color: CupertinoColors.secondarySystemBackground,
            borderRadius: BorderRadius.circular(8)),
        child: icon,
      ),
    );
  }

  Widget _buildComment(EMMessage message) {
    String? replayMsgId = message.attributes?['replayMsgId']?.toString();
    String? replayNickName = message.attributes?['replayNickName'];

    return Container(
      margin: EdgeInsets.only(left: replayMsgId != null ? 40 : 0.0),
      decoration: BoxDecoration(
        border: bottomBorder(),
      ),
      child: FutureBuilder<EMUserInfo>(
        builder: (context, snapshot) {
          var nickName =
              "·${timeDescriptionFromNow(DateTime.fromMillisecondsSinceEpoch(message.serverTime))}";
          nickName =
              "${snapshot.data?.nickName ?? ""}${replayNickName != null ? " 回复 $replayNickName" : ""}$nickName";
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () async {
                      final tc = loading();
                      final r = await API.findUser(message.from!);
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
                    child: ClipOval(
                      child: snapshot.data?.avatarUrl != null
                          ? Image.network(
                              snapshot.data!.avatarUrl!,
                              width: 30,
                            )
                          : Container(
                              color: CupertinoColors.systemGroupedBackground,
                              width: 30,
                            ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      nickName,
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.label.withOpacity(0.6),
                      ),
                    ),
                  ),
                  CupertinoButton(
                    onPressed: () =>
                        controller.replayMessage(message, snapshot.data),
                    child: Text(
                      "回复",
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.label.withOpacity(0.6),
                      ),
                    ),
                  )
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(left: 38.0, bottom: 20),
                child: Text((message.body as EMTextMessageBody).content),
              )
            ],
          );
        },
        future: Get.find<UserService>().fetchUserInfo(message.from!),
      ),
    );
  }
}
