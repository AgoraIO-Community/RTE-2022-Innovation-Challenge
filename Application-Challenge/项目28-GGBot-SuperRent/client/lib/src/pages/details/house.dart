import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:super_rent/src/controllers/message/live.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/models/media.dart';
import 'package:super_rent/src/pages/message/chat.dart';
import 'package:super_rent/src/pages/message/live.dart';
import 'package:super_rent/src/widgets/media.dart';

import '../../controllers/house.dart';
import '../../models/easemob.dart';
import '../../utils/images.dart';
import '../common/baidu_map.dart';

class HouseDetailPage extends GetWidget<HouseDetailController> {
  const HouseDetailPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    House h = controller.house;
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text("房源详情"),
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          child: Text(controller.isMyHouse ? "直播带看" : "邀请在线带看"),
          onPressed: () {
            if (controller.isMyHouse) {
              Get.to(
                const LivePage(),
                binding:
                    BindingsBuilder.put(() => LiveController(controller.house)),
              );
            } else {
              Get.to(
                ChatPage(
                  controller.house.creator.emUsername,
                  house: controller.house,
                  sendLiveRequest: true,
                ),
              );
            }
          },
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                children: [
                  _buildMediasItem(context),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Wrap(
                      spacing: 10,
                      children: h.tags
                          .map(
                            (t) => Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 2, horizontal: 4),
                              decoration: BoxDecoration(
                                color: CupertinoColors.systemGroupedBackground,
                                borderRadius: BorderRadius.circular(4.0),
                              ),
                              child: Text(
                                t,
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.blue.shade900,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          )
                          .toList(growable: false),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 16),
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: "¥${h.monthlyRent.toStringAsFixed(0)}",
                            style: const TextStyle(
                                fontSize: 30, fontWeight: FontWeight.w500),
                          ),
                          const TextSpan(text: "/月"),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 16.0, top: 8.0),
                    child: Text(
                      h.compoundAddress,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 16.0),
                    child: Text(h.subAddress),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: controller.infos
                          .map(
                            (e) => Row(
                              children: [
                                Icon(e[0], color: Colors.blueGrey),
                                Text(
                                  e[1],
                                  style: const TextStyle(
                                    color: Colors.blueGrey,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                )
                              ],
                            ),
                          )
                          .toList(growable: false),
                    ),
                  ),
                  _buildHighlightBlock(context),
                  _buildLocationBLock(context),
                  _buildTrafficBlock(context),
                  _buildDescriptionBlock(context),
                  _buildPriceBlock(context),
                  _buildOwnerItem(context),
                  // _buildComments(context),
                ],
              ),
            ),
            Container(
              height: 80,
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(
                      color: CupertinoColors.opaqueSeparator, width: 0.0),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '¥${controller.house.monthlyRent.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 25,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text("月租金"),
                    ],
                  ),
                  const Spacer(),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    onPressed: controller.favAction,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                          color: CupertinoColors.secondarySystemBackground,
                          borderRadius: BorderRadius.circular(8)),
                      child: Obx(
                        () => Icon(
                          controller.isFavorite
                              ? Icons.favorite
                              : Icons.favorite_border,
                          color: Colors.pink,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  CupertinoButton.filled(
                    child: const Text("消息"),
                    onPressed: () => Get.to(
                      ChatPage(
                        controller.house.creator.emUsername,
                        house: controller.house,
                      ),
                    ),
                  )
                  // primaryButton(context, child: const Text("消息")),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOwnerItem(BuildContext context) {
    return _buildBlock(
      context,
      title: "房主",
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Stack(
                children: [
                  ClipOval(
                    child: Image.network(
                      controller.house.creator['avatar'],
                      width: 90,
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    width: 20,
                    height: 20,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.green.shade400,
                        border: Border.all(color: CupertinoColors.white),
                        borderRadius: BorderRadius.circular(10.0),
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
                          controller.house.creator['nickname']!,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          decoration: BoxDecoration(
                            color: controller.house.creator.isMale
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
                                controller.house.creator.isMale
                                    ? Images.male
                                    : Images.female,
                                color: Colors.white,
                                width: 10,
                              ),
                              Text(
                                controller.house.creator.isMale ? "男" : "女",
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
                    const SizedBox(height: 8),
                    const Text(
                      "来随心租20天，处女座",
                      style: TextStyle(
                        fontSize: 14,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text("真诚交友，也希望能得到真诚相待"),
        ],
      ),
    );
  }

  Widget _buildPriceBlock(BuildContext context) {
    final data = <List>[
      [
        Icons.currency_yen,
        "租金",
        "${controller.house.monthlyRent.toStringAsFixed(0)}元/月"
      ],
      [
        Icons.supervised_user_circle_sharp,
        "中介费",
        controller.agencyFee,
      ],
      [
        Icons.currency_exchange_sharp,
        "服务费",
        controller.serviceFee,
      ],
      [
        Icons.rotate_90_degrees_cw_rounded,
        "其他费用",
        controller.otherFee,
      ],
    ];
    return _buildCardBlock(context, title: "费用明细", data: data);
  }

  Widget _buildDescriptionBlock(BuildContext context) {
    return _buildBlock(context,
        title: "房间描述", content: Text("${controller.house['description']}"));
  }

  Widget _buildTrafficBlock(BuildContext context) {
    final data = <List>[
      [Icons.subway_rounded, "地铁1号线 人民广场南站 向南500米"],
      [Icons.bus_alert, "公交2号线 大溪河站"],
      [Icons.bus_alert, "公交1号线 苹果园站"]
    ];
    return _buildCardBlock(context, title: "通勤信息[mock]", data: data);
  }

  Widget _buildLocationBLock(BuildContext context) {
    return _buildBlock(
      context,
      title: "小区位置",
      content: GestureDetector(
        onTap: () {
          final location = controller.house.compound["location"];
          Get.to(
            () => BaiduMap(
              latitude: location["latitude"],
              longitude: location["longitude"],
            ),
          );
        },
        child: AspectRatio(
          aspectRatio: 1.5,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: SizedBox(
              width: 500,
              child: Image.network(
                controller.house.locationPath,
                fit: BoxFit.fitWidth,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHighlightBlock(BuildContext context) {
    final data = <List>[
      [Icons.pets, "可养宠物/宠物可议"],
      [Icons.restaurant_menu, "可做饭"],
      [Icons.bathtub_rounded, "独卫"],
      [Icons.currency_yen_rounded, "无中介费/服务费"],
      [Icons.person, "男女不限"],
    ];
    return _buildCardBlock(context, data: data, title: "房子亮点");
  }

  Widget _buildCardBlock(BuildContext context,
      {required List<List> data, required String title}) {
    return _buildBlock(
      context,
      title: title,
      content: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          border: Border.all(color: CupertinoColors.opaqueSeparator),
          borderRadius: BorderRadius.circular(6.0),
        ),
        child: Wrap(
          direction: Axis.horizontal,
          runSpacing: 8,
          children: [
            ...data.map(
              (e) => Row(
                children: [
                  Icon(
                    e[0],
                    color: Colors.blueGrey,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  if (e.length > 2)
                    SizedBox(
                      width: 100,
                      child: Text(
                        e[1],
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.blueGrey),
                      ),
                    ),
                  Expanded(
                    child: Text(
                      e[e.length > 2 ? 2 : 1],
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.blueGrey),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlock(BuildContext context,
      {required String title, required Widget content}) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          content,
        ],
      ),
    );
  }

  Widget _buildMediasItem(BuildContext context) {
    Widget content;
    if (controller.medias.isEmpty) {
      content = CachedNetworkImage(
        imageUrl: Images.housePlaceholder,
        fit: BoxFit.cover,
      );
    } else {
      final medias = controller.medias.asMap();
      content = PageView(
        children: medias.keys
            .map((k) => _buildMediaItem(context, medias[k]!, k))
            .toList(growable: false),
      );
    }

    return AspectRatio(
      aspectRatio: 1.5,
      child: content,
    );
  }

  Widget _buildMediaItem(BuildContext context, RentMedia item, int index) {
    final d = DateTime.fromMillisecondsSinceEpoch(item.timestamp);
    const style = TextStyle(
      color: Colors.black,
      fontWeight: FontWeight.bold,
      shadows: <Shadow>[
        Shadow(
          offset: Offset(0.5, 0.5),
          blurRadius: 3.0,
          color: Colors.white,
        ),
      ],
    );
    Widget content = Stack(
      children: [
        Positioned.fill(
          child: CachedNetworkImage(
            imageUrl: item.imagePath,
            fit: BoxFit.cover,
          ),
        ),
        if (item.isVideo)
          const Positioned.fill(
            child: Center(
              child: Icon(
                Icons.play_circle_outline,
                color: Colors.black45,
                size: 30,
              ),
            ),
          ),
        Positioned(
          left: 8,
          bottom: 8,
          child: Text(
            "${index + 1} / ${controller.medias.length}",
            style: style,
          ),
        ),
        Positioned(
          right: 8.0,
          bottom: 8.0,
          child: Text(
            DateFormat("yyyy-MM-dd").format(d),
            style: style,
          ),
        ),
      ],
    );

    return Hero(
      key: ValueKey(item),
      tag: item.imagePath,
      child: GestureDetector(
        onTap: () => openMediasGallery(context, controller.medias, item),
        child: content,
      ),
    );
  }
}
