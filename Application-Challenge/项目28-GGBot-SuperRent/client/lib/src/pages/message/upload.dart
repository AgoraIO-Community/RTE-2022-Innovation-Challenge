import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:reorderable_grid_view/reorderable_grid_view.dart';
import 'package:super_rent/src/controllers/message/upload.dart';
import 'package:super_rent/src/widgets/empty.dart';
import 'package:super_rent/src/widgets/media.dart';

import '../../models/media.dart';
import '../../widgets/button.dart';

class LiveUploadPage extends GetWidget<LiveUploadController> {
  const LiveUploadPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        middle: Text("上传截图与录像"),
      ),
      backgroundColor: CupertinoColors.systemBackground,
      child: SafeArea(
        child: Obx(
          () => controller.items.isEmpty
              ? const Center(
                  child: Empty(
                    message: "无需上传资料，请直接返回",
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ReorderableGridView.count(
                        crossAxisCount: 2,
                        crossAxisSpacing: 8.0,
                        mainAxisSpacing: 8.0,
                        padding: const EdgeInsets.symmetric(
                          vertical: 16,
                          horizontal: 16,
                        ),
                        onReorder: (int oldIndex, int newIndex) {
                          final element = controller.items.removeAt(oldIndex);
                          controller.items.insert(newIndex, element);
                        },
                        children: controller.items
                            .asMap()
                            .keys
                            .map((k) =>
                                _buildItem(context, controller.items[k], k))
                            .toList(growable: false),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      height: 50,
                      child: primaryButton(
                        context,
                        child: const Text("确认上传"),
                        onTap: controller.upload,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildItem(BuildContext context, RentMedia item, int index) {
    Widget image;
    if (item.isVideo) {
      image = CachedNetworkImage(imageUrl: item.imagePath);
    } else {
      image = Image(
        image: FileImage(File(item.imagePath)),
        fit: BoxFit.contain,
      );
    }

    Widget content = Stack(
      children: [
        Positioned.fill(
          child: image,
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
          right: 0,
          width: 60,
          height: 60,
          child: Align(
            alignment: Alignment.topRight,
            child: GestureDetector(
              onTap: item.ignore.toggle,
              child: Icon(
                item.ignore.isTrue
                    ? CupertinoIcons.eye_slash
                    : CupertinoIcons.eye_solid,
                color: item.ignore.isTrue
                    ? Colors.black45
                    : CupertinoTheme.of(context).primaryColor,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 0,
          child: Text("$index"),
        ),
      ],
    );

    return Hero(
      key: ValueKey(item.imagePath),
      tag: item.imagePath,
      child: GestureDetector(
        onTap: () => openMediasGallery(context, controller.items, item),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.all(8.0),
          decoration: BoxDecoration(
            color: item.ignore.isTrue
                ? CupertinoColors.separator
                : CupertinoColors.systemGroupedBackground,
            borderRadius: BorderRadius.circular(4.0),
          ),
          child: content,
        ),
      ),
    );
  }
}
