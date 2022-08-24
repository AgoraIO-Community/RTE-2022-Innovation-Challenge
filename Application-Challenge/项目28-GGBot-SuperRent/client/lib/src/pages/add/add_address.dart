import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/add/add_address.dart';
import 'package:super_rent/src/pages/add/pick_address.dart';
import 'package:super_rent/src/utils/widget.dart';

import '../../models/place.dart';

class AddAddressPage extends GetWidget<AddAddressController> {
  const AddAddressPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
        automaticallyImplyLeading: false,
        automaticallyImplyMiddle: false,
        middle: const Text("添加地址"),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: Get.back,
          child: const Icon(CupertinoIcons.clear),
        ),
      ),
      child: Obx(() => ListView(
            children: [
              CupertinoTextField(
                controller: controller.textEditingController,
                placeholder: "搜索小区",
                onChanged: controller.searchTextOnChange,
                padding: const EdgeInsets.only(
                    left: 16, top: 6, right: 6, bottom: 6),
                suffix: CupertinoButton(
                  onPressed: () {
                    Get.to(() => const PickAddress());
                  },
                  child: Row(
                    children: const [
                      Text("地图"),
                      Icon(CupertinoIcons.map, size: 16)
                    ],
                  ),
                ),
              ),
              AnimatedCrossFade(
                duration: const Duration(milliseconds: 180),
                firstChild: Container(
                  height: 40,
                  alignment: Alignment.center,
                  child: const CupertinoActivityIndicator(),
                ),
                secondChild: const SizedBox(height: 0),
                crossFadeState: controller.searching
                    ? CrossFadeState.showFirst
                    : CrossFadeState.showSecond,
              ),
              ...controller.places.map((p) => _buildAddressItem(context, p))
            ],
          )),
    );
  }

  Widget _buildAddressItem(BuildContext context, Place place) {
    return GestureDetector(
      onTap: () {
        Get.back(result: place);
      },
      child: Container(
        height: 60,
        padding: const EdgeInsets.only(left: 16.0),
        decoration: BoxDecoration(
          border: bottomBorder(),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                const Icon(
                  CupertinoIcons.location_solid,
                  color: Colors.black,
                  size: 16,
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(left: 8.0),
                    child: Text(
                      place.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                const SizedBox(width: 24, height: 16),
                Expanded(
                  child: Text(
                    place.address,
                    style: const TextStyle(
                      fontSize: 14,
                      color: CupertinoColors.secondaryLabel,
                    ),
                    overflow: TextOverflow.ellipsis,
                    softWrap: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
