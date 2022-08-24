import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/controllers/ask_for_rent_detail.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/utils/images.dart';
import 'package:super_rent/src/utils/time.dart';

import '../controllers/house.dart';
import '../pages/details/ask_for_rent.dart';
import '../pages/details/house.dart';
import 'empty.dart';

Widget buildPostListItem(BuildContext context, LCObject post) {
  final address = post['compounds'][0]['name'];
  final user = post['poster'] as LCUser;
  final date = user['lastLoggedInAt'] as DateTime;

  final tags = [
    post.findRoommate ? "#无房找室友" : "#求租",
    "#$address",
    "#${post['price']}元/月",
  ];

  return GestureDetector(
    behavior: HitTestBehavior.opaque,
    onTap: () {
      Get.to(
        () => const AskForRentDetailPage(),
        binding: BindingsBuilder.put(
          () => AskForRentDetailController(post),
        ),
      );
    },
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            CupertinoIcons.text_bubble_fill,
            color: Colors.orangeAccent,
            size: 20,
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                address + "附近找室友",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Wrap(
                  spacing: 5,
                  runAlignment: WrapAlignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: Image.network(
                        user['avatar'],
                        width: 20,
                      ),
                    ),
                    Text(
                      user['nickname'] ?? "神秘人",
                      style: const TextStyle(
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      "${timeDescriptionFromNow(date)}来过",
                      style: const TextStyle(
                        fontSize: 14,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    )
                  ],
                ),
              ),
              Wrap(
                spacing: 10,
                children: [
                  ...tags.map(
                    (e) => Container(
                      decoration: BoxDecoration(
                        color: CupertinoColors.secondarySystemBackground,
                        borderRadius: BorderRadius.circular(2.0),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8.0, vertical: 2.0),
                        child: Text(
                          e,
                          style: const TextStyle(
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          )
        ],
      ),
    ),
  );
}

Widget buildHouseItem(BuildContext context, House house) {
  final url = house.medias.isEmpty
      ? Images.housePlaceholder
      : house.medias.first["url"].stringValue;
  return GestureDetector(
    behavior: HitTestBehavior.opaque,
    onTap: () => Get.to(
      () => const HouseDetailPage(),
      binding: BindingsBuilder.put(
        () => HouseDetailController(house),
      ),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
          ),
          padding: const EdgeInsets.only(bottom: 8.0),
          child: AspectRatio(
            aspectRatio: 1.5,
            child: Stack(
              children: [
                Positioned.fill(
                  child: CachedNetworkImage(
                    imageUrl: url,
                    fit: BoxFit.fitWidth,
                  ),
                ),
                Positioned(
                  left: 0,
                  bottom: 0,
                  width: 60,
                  height: 25,
                  child: Container(
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: Colors.black45,
                      borderRadius:
                          BorderRadius.only(topRight: Radius.circular(8.0)),
                    ),
                    child: Text(
                      "${house.rentType} · ${house.bedroom}",
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Row(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.blue.shade900,
                    Colors.blue,
                    Colors.blue.shade900,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(2.0),
              ),
              padding:
                  const EdgeInsets.symmetric(horizontal: 2.0, vertical: 1.0),
              child: const Text(
                "房东直租",
                style: TextStyle(fontSize: 10, color: Colors.white),
              ),
            ),
            const SizedBox(width: 4.0),
            Flexible(
              child: Text(
                house.compoundAddress,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 4.0),
          child: Text.rich(
            TextSpan(
              children: [
                WidgetSpan(
                  child: Icon(
                    Icons.location_on_outlined,
                    color: CupertinoColors.label,
                    size: 15,
                  ),
                ),
                TextSpan(text: "距离4号线地铁站500米", style: TextStyle(fontSize: 12))
              ],
            ),
            textAlign: TextAlign.start,
          ),
        ),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: "¥ ",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: CupertinoTheme.of(context).primaryColor,
                ),
              ),
              TextSpan(
                text: house.monthlyRent.toStringAsFixed(0),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: CupertinoTheme.of(context).primaryColor,
                ),
              ),
            ],
          ),
        ),
        Row(
          children: [
            Container(
              width: 30,
              clipBehavior: Clip.antiAlias,
              margin: const EdgeInsets.only(top: 8.0, right: 8.0),
              decoration: BoxDecoration(
                color: CupertinoColors.secondarySystemGroupedBackground,
                borderRadius: BorderRadius.circular(15),
              ),
              child: CachedNetworkImage(
                imageUrl: house.creator['avatar'],
              ),
            ),
            const Icon(
              Icons.check_box_rounded,
              size: 15,
              color: Colors.green,
            ),
            const Text(
              "支持实时视频带看",
              style: TextStyle(
                color: CupertinoColors.secondaryLabel,
                fontSize: 12,
              ),
            )
          ],
        )
      ],
    ),
  );
}

Widget buildHouseListItem(BuildContext context, House house,
    {VoidCallback? onTap}) {
  final url = house.medias.isEmpty
      ? Images.housePlaceholder
      : house.medias.first["url"].stringValue;
  return GestureDetector(
    behavior: HitTestBehavior.opaque,
    onTap: onTap ??
        () {
          Get.to(
            () => const HouseDetailPage(),
            binding: BindingsBuilder.put(
              () => HouseDetailController(house),
            ),
          );
        },
    child: SizedBox(
      height: 80,
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: CupertinoColors.systemGroupedBackground,
            ),
            clipBehavior: Clip.antiAlias,
            child: AspectRatio(
              aspectRatio: 1.5,
              child: CachedNetworkImage(
                imageUrl: url,
                fit: BoxFit.fitWidth,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
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
                Text(
                  "${house.type} ${house.compoundAddress}",
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Wrap(
                  spacing: 10,
                  children: ["实时带看", "近地铁", "可养宠物"]
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
                            style: const TextStyle(
                              fontSize: 10,
                            ),
                          ),
                        ),
                      )
                      .toList(growable: false),
                ),
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: "¥${house.monthlyRent.toStringAsFixed(0)}",
                      ),
                      const TextSpan(
                        text: "/月",
                        style: TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    ),
  );
}

Widget buildPostList(BuildContext context, List<LCObject> posts,
    {ScrollPhysics? physics}) {
  return Obx(
    () => posts.isEmpty
        ? const Empty()
        : ListView.separated(
            physics: physics,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemBuilder: (BuildContext context, int index) {
              final post = posts[index];
              return buildPostListItem(context, post);
            },
            itemCount: posts.length,
            separatorBuilder: (BuildContext context, int index) {
              return const Divider();
            },
          ),
  );
}

Widget buildHouseList(BuildContext context, List<House> houses,
    {ScrollPhysics? physics}) {
  return Obx(
    () => houses.isEmpty
        ? const Empty()
        : ListView.separated(
            physics: physics,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            itemBuilder: (BuildContext context, int index) {
              final house = houses[index];
              return buildHouseListItem(context, house);
            },
            itemCount: houses.length,
            separatorBuilder: (BuildContext context, int index) {
              return const Divider();
            },
          ),
  );
}
