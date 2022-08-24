import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/controllers/add/ask_for_rent.dart';
import 'package:super_rent/src/models/house_type.dart';
import 'package:super_rent/src/models/place.dart';
import 'package:super_rent/src/utils/widget.dart';
import 'package:super_rent/src/widgets/button.dart';

class AskForRentPage extends GetWidget<AskForRentController> {
  const AskForRentPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        border: null,
        middle: Text("求租贴"),
        transitionBetweenRoutes: false,
      ),
      resizeToAvoidBottomInset: true,
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.only(left: 20, top: 16),
                children: [
                  sectionTitle("求租位置", topPadding: 16),
                  Obx(
                    () => Wrap(
                      spacing: 8.0,
                      runSpacing: 8.0,
                      children: [
                        ...controller.places.map(
                          (p) => _buildAddressChip(
                            context,
                            label: p.name,
                            onTap: () {
                              controller.removePlace(p);
                            },
                          ),
                        ),
                        _buildAddressChip(
                          context,
                          onTap: () => controller.addAddress(context),
                        ),
                      ],
                    ),
                  ),
                  sectionTitle("预算多少"),
                  _buildItemContainer(
                    Row(children: [
                      SizedBox(
                        width: 130,
                        child: CupertinoTextField(
                          decoration: null,
                          placeholder: "请输入你的预算",
                          onChanged: controller.expectedPrice,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const Text("元/月")
                    ]),
                  ),
                  sectionTitle("求租房型"),
                  _buildItemContainer(
                    GestureDetector(
                      onTap: () => controller.pickHouseType(),
                      child: Row(
                        children: [
                          Expanded(
                            child: Obx(
                              () {
                                final hasValue = controller.houseType != null;
                                return Text(
                                  hasValue
                                      ? controller.houseType!.name
                                      : "请选择求租房型",
                                  style: TextStyle(
                                    color: hasValue
                                        ? CupertinoColors.label
                                        : CupertinoColors.placeholderText,
                                  ),
                                );
                              },
                            ),
                          ),
                          const Icon(
                            CupertinoIcons.chevron_right,
                            color: CupertinoColors.placeholderText,
                          ),
                          const SizedBox(width: 16),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(border: bottomBorder()),
                    padding: const EdgeInsets.only(bottom: 15),
                    child: Row(
                      children: [
                        Expanded(
                          child: sectionTitle("同时找室友", isRequired: false),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 32.0, right: 16),
                          child: Obx(
                            () => CupertinoSwitch(
                              activeColor:
                                  CupertinoTheme.of(context).primaryColor,
                              value: controller.findRoommate.value,
                              onChanged: controller.findRoommate,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  sectionTitle("其他要求", isRequired: false),
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: CupertinoTextField(
                      padding: EdgeInsets.zero,
                      decoration: null,
                      placeholder: "请输入其他求租要求",
                      onChanged: controller.otherRequirements,
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
            Container(
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(
                      color: CupertinoColors.opaqueSeparator, width: 0.0),
                ),
              ),
              width: double.infinity,
              padding: const EdgeInsets.only(top: 16),
              alignment: Alignment.center,
              child: primaryButton(
                context,
                child: const Text("发布"),
                fixedSize: Size(MediaQuery.of(context).size.width * 0.8, 46),
                onTap: () => controller.publish(context),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildAddressChip(BuildContext context,
      {String? label, required VoidCallback onTap}) {
    final isAdder = label == null;
    return ActionChip(
      backgroundColor: CupertinoColors.systemGroupedBackground,
      padding: const EdgeInsets.only(left: 2, right: 4),
      label: SizedBox(
        height: 40,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isAdder) const Icon(CupertinoIcons.add, size: 20),
            Text(
              label ?? " 添加地址",
              style: TextStyle(
                color: CupertinoTheme.of(context).primaryColor,
              ),
            ),
            if (!isAdder) const Icon(CupertinoIcons.clear, size: 12),
          ],
        ),
      ),
      onPressed: onTap,
    );
  }

  Widget _buildItemContainer(Widget child) {
    return Container(
      decoration: BoxDecoration(
        border: bottomBorder(),
      ),
      height: 50,
      child: child,
    );
  }
}
