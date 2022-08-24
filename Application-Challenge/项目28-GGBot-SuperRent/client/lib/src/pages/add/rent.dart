import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_multi_formatter/flutter_multi_formatter.dart';
import 'package:flutter_radio_group/flutter_radio_group.dart';
import 'package:get/get.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:super_rent/src/controllers/add/rent.dart';
import 'package:super_rent/src/models/agency_fee.dart';
import 'package:super_rent/src/models/house.dart';
import 'package:super_rent/src/models/other_fee.dart';
import 'package:super_rent/src/models/place.dart';
import 'package:super_rent/src/models/service_fee.dart';
import 'package:super_rent/src/pages/common/baidu_map.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/widget.dart';

import '../../controllers/add/add_address.dart';
import '../../models/rent_type.dart';
import '../../widgets/button.dart';
import '../../widgets/group_choice.dart';
import 'add_address.dart';

class RentPage extends GetWidget<RentController> {
  const RentPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("发布房源"),
        border: null,
        transitionBetweenRoutes: false,
      ),
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Obx(
                () => ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  children: [
                    _buildPickAddress(context),
                    controller.place.value == null
                        ? primaryButton(
                            context,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(CupertinoIcons.add, size: 15),
                                Text("添加房源所在小区")
                              ],
                            ),
                            onTap: () => _pickAddress(context),
                          )
                        : _buildCommunity(context),
                    sectionTitle("房源信息"),
                    _buildRentTypeItem(context),
                    _buildMonthlyRentItem(context),
                    _buildAgencyItem(context),
                    _buildServiceFeeItem(context),
                    _buildOtherFeeItem(context),
                    _buildAreaItem(context),
                    _buildInputNumberItem(
                      context,
                      title: '卧室数量',
                      value: controller.bedRoomCount,
                      unit: "室",
                    ),
                    _buildInputNumberItem(
                      context,
                      title: '客厅数量',
                      value: controller.livingRoomCount,
                      unit: "厅",
                    ),
                    _buildInputNumberItem(
                      context,
                      title: '卫生间数量',
                      value: controller.bathRoomCount,
                      unit: "卫",
                    ),
                    _buildInputArea(context,
                        title: "房源描述",
                        v: controller.description,
                        isRequired: true),
                    sectionTitle("联系信息"),
                    _buildContactPhoneItem(context),
                    _buildIsHiddenPhone(context),
                    _buildHouseOwnerTypeItem(context),
                    _buildInputArea(context,
                        title: "个人简介", v: controller.personalProfile),
                    sectionTitle("设施和要求"),
                    _buildChooseChipItem(context,
                        title: "宠物",
                        options: HouseX.pets,
                        value: controller.pet),
                    _buildChooseChipItem(context,
                        title: "做饭",
                        options: HouseX.cooks,
                        value: controller.cook),
                    _buildChooseChipItem(
                      context,
                      title: "电梯",
                      options: HouseX.elevators,
                      value: controller.elevator,
                    ),
                    _buildChooseChipItem(
                      context,
                      title: "租客性别",
                      options: HouseX.tenantGenders,
                      value: controller.tenantGender,
                    ),
                    _buildChooseChipItem(
                      context,
                      title: "是否独卫",
                      options: HouseX.individualBathrooms,
                      value: controller.individualBathroom,
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
            _buildFooter(context),
          ],
        ),
      ),
    );
  }

  void _pickAddress(BuildContext context) {
    Get.put(AddAddressController());
    showCupertinoModalBottomSheet<Place>(
      context: Get.context!,
      builder: (context) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.8,
          child: const AddAddressPage(),
        );
      },
    ).then((value) {
      if (value != null) {
        controller.place(value);
      }
      Get.delete<AddAddressController>();
    });
  }

  Widget _buildPickAddress(BuildContext context) {
    return Row(
      children: [
        Expanded(child: sectionTitle("小区信息")),
        if (controller.place.value != null)
          Padding(
            padding: const EdgeInsets.only(top: 32),
            child: CupertinoButton(
              onPressed: () => _pickAddress(context),
              child: const Text("重选小区"),
            ),
          ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: CupertinoColors.opaqueSeparator, width: 0.0),
        ),
      ),
      width: double.infinity,
      padding: const EdgeInsets.only(top: 16, left: 16, right: 16),
      alignment: Alignment.center,
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: secondaryButton(
              context,
              child: const Text("预览"),
              onTap: controller.preview,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: primaryButton(
              context,
              child: const Text("发布"),
              onTap: controller.publish,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommunity(BuildContext context) {
    Place place = controller.place.value!;
    return GestureDetector(
      onTap: () {
        final l = place["location"];
        Get.to(
          () => BaiduMap(
              latitude: l["lat"].ddoubleValue,
              longitude: l["lng"].ddoubleValue),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.green.shade900,
              Colors.green,
              Colors.green.shade900,
            ],
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "${place["city"].string}，${place["district"].string}",
                    style: const TextStyle(
                      fontSize: 14,
                      color: CupertinoColors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    place.name,
                    style: const TextStyle(
                      color: CupertinoColors.systemBackground,
                      fontWeight: FontWeight.bold,
                      fontSize: 23.0,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.location_on, color: Colors.white)
          ],
        ),
      ),
    );
  }

  Widget _buildRentTypeItem(BuildContext context) {
    return _buildItem(
      context,
      title: "出租方式",
      valueWidget: Text(
        controller.rentType.value?.name ?? "请选择",
        style: TextStyle(
          color: controller.rentType.value == null
              ? CupertinoColors.placeholderText
              : null,
        ),
      ),
      onTap: () {
        showPicker<RentType>(Get.context!,
            data: RentType.values, fn: (r) => r.name).then((value) {
          if (value != null) {
            controller.rentType(value);
          }
        });
      },
    );
  }

  Widget _buildMonthlyRentItem(BuildContext context) {
    return _buildItem(
      context,
      title: "月租金",
      valueWidget: Text(controller.monthlyRentStr ?? "请输入",
          style: TextStyle(
            color: controller.monthlyRentStr == null
                ? CupertinoColors.placeholderText
                : null,
          )),
      onTap: () {
        final price = 0.0.obs;
        showCupertinoModalBottomSheet(
          context: Get.context!,
          builder: (context) {
            return Obx(
              () => confirmPageScaffold(
                context,
                title: "",
                children: [
                  inputTextPad(
                    title: "月租金：",
                    inputFormatters: [
                      MoneyInputFormatter(
                        mantissaLength: 0,
                        leadingSymbol: "¥",
                        onValueChange: price,
                      )
                    ],
                  ),
                ],
                onConfirm: price.value > 0.0
                    ? () {
                        controller.monthlyRent(price.value);
                        Get.back();
                      }
                    : null,
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAgencyItem(BuildContext context) {
    final hasAgencyFee = controller.agencyFee.value != null;
    return _buildItem(
      context,
      title: "中介费",
      valueWidget: Text(
        hasAgencyFee ? controller.agencyFee.value!.toString() : "请填写",
        style: TextStyle(
            color: hasAgencyFee
                ? CupertinoColors.label
                : CupertinoColors.placeholderText),
      ),
      onTap: () {
        //
        final af = controller.agencyFee.value;
        final hasAgencyFee = Rx<int?>(af == null ? null : (af.has ? 0 : 1));
        final agencyFeeType = Rx<int?>(af?.type);
        final agencyFee = Rx<double?>(af?.value);

        showCupertinoModalBottomSheet(
          context: Get.context!,
          builder: (context) => Obx(
            () {
              final canConfirm = hasAgencyFee.value == 1 ||
                  (agencyFeeType.value == 0 || agencyFeeType.value == 1) ||
                  (agencyFee.value != null && agencyFee.value! > 1);

              return confirmPageScaffold(
                context,
                title: "中介费",
                onConfirm: canConfirm
                    ? () {
                        Get.back(result: hasAgencyFee.value);
                        if (agencyFee.value != null && agencyFee.value! > 1) {
                          controller
                              .agencyFee(AgencyFee.value(agencyFee.value!));
                        } else if (agencyFeeType.value == 0 ||
                            agencyFeeType.value == 1) {
                          controller.agencyFee(AgencyFee(agencyFeeType.value));
                        } else {
                          controller.agencyFee(AgencyFee.free());
                        }
                      }
                    : null,
                children: [
                  requiredTitle("是否收取中介费"),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: GroupChoiceChip(
                        childCount: 2,
                        titleFn: (v) => v == 0 ? "收取" : "不收",
                        onChange: (v) {
                          hasAgencyFee(v);
                          // null 不会出发变化
                          agencyFeeType(-1);
                          agencyFee(-1);
                        },
                        value: hasAgencyFee.value,
                      ),
                    ),
                  ),
                  Obx(
                    () => AnimatedCrossFade(
                      duration: const Duration(milliseconds: 180),
                      firstChild: requiredTitle("中介费"),
                      secondChild: const SizedBox(height: 0),
                      crossFadeState: hasAgencyFee.value == 0
                          ? CrossFadeState.showFirst
                          : CrossFadeState.showSecond,
                    ),
                  ),
                  Obx(
                    () => AnimatedCrossFade(
                      duration: const Duration(milliseconds: 180),
                      firstChild: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: GroupChoiceChip(
                          childCount: 3,
                          titleFn: (i) => i == 0
                              ? "一月租金"
                              : i == 1
                                  ? "半月租金"
                                  : "其他",
                          value: agencyFeeType.value,
                          onChange: (v) {
                            agencyFeeType(v);
                            // null 不会出发变化
                            agencyFee(-1);
                          },
                        ),
                      ),
                      secondChild: const SizedBox(height: 0),
                      crossFadeState: hasAgencyFee.value == 0
                          ? CrossFadeState.showFirst
                          : CrossFadeState.showSecond,
                    ),
                  ),
                  Obx(
                    () => AnimatedCrossFade(
                      duration: const Duration(milliseconds: 180),
                      firstChild: inputTextPad(
                        title: "其他金额",
                        inputFormatters: [
                          MoneyInputFormatter(
                            mantissaLength: 0,
                            leadingSymbol: "¥",
                            onValueChange: agencyFee,
                          )
                        ],
                      ),
                      secondChild: const SizedBox(height: 0),
                      crossFadeState: agencyFeeType.value == 2
                          ? CrossFadeState.showFirst
                          : CrossFadeState.showSecond,
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildServiceFeeItem(BuildContext context) {
    final hasServiceFee = controller.serviceFee.value != null;

    return _buildItem(
      context,
      title: "服务费",
      valueWidget: Text(
        hasServiceFee ? controller.serviceFee.value!.description : "请填写",
        style: TextStyle(
          color: hasServiceFee
              ? CupertinoColors.label
              : CupertinoColors.placeholderText,
        ),
      ),
      onTap: () {
        final sf = controller.serviceFee.value;
        final hasServiceFee =
            Rx<int?>(sf == null ? null : (sf.has == true ? 0 : 1));
        final serviceFeeType = Rx<int?>(sf?.type);
        final serviceFeePayment = Rx<int>(sf?.payType ?? -1);
        final serviceFee = Rx<double?>(sf?.value);

        showCupertinoModalBottomSheet(
          context: Get.context!,
          builder: (context) => Obx(
            () {
              final canConfirm = hasServiceFee.value == 1 ||
                  (serviceFeeType.value == 0 || serviceFeeType.value == 1) ||
                  (serviceFee.value != null &&
                      serviceFee.value! > 1 &&
                      serviceFeePayment.value != -1);
              return confirmPageScaffold(context,
                  title: "服务费",
                  children: [
                    requiredTitle("收否收取服务费"),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: GroupChoiceChip(
                          childCount: 2,
                          titleFn: (i) => i == 0 ? "收取" : "不收",
                          onChange: hasServiceFee,
                          value: hasServiceFee.value,
                        ),
                      ),
                    ),
                    Obx(
                      () => AnimatedCrossFade(
                        duration: const Duration(milliseconds: 180),
                        firstChild: requiredTitle("服务费"),
                        secondChild: const SizedBox(height: 0),
                        crossFadeState: hasServiceFee.value == 0
                            ? CrossFadeState.showFirst
                            : CrossFadeState.showSecond,
                      ),
                    ),
                    Obx(
                      () => AnimatedCrossFade(
                        duration: const Duration(milliseconds: 180),
                        firstChild: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: GroupChoiceChip(
                            childCount: 3,
                            titleFn: (i) => i == 0
                                ? "一月租金"
                                : i == 1
                                    ? "半月租金"
                                    : "其他",
                            value: serviceFeeType.value,
                            onChange: (v) {
                              serviceFeeType(v);
                              // null 不会出发变化
                              serviceFee(-1);
                              serviceFeePayment(-1);
                            },
                          ),
                        ),
                        secondChild: const SizedBox(height: 0),
                        crossFadeState: hasServiceFee.value == 0
                            ? CrossFadeState.showFirst
                            : CrossFadeState.showSecond,
                      ),
                    ),
                    Obx(
                      () => AnimatedCrossFade(
                        duration: const Duration(milliseconds: 180),
                        firstChild: FlutterRadioGroup(
                          titles: const ["按年", "按月", "一次性"],
                          orientation: RGOrientation.HORIZONTAL,
                          activeColor: CupertinoTheme.of(context).primaryColor,
                          defaultSelected: serviceFeePayment.value,
                          onChanged: serviceFeePayment,
                        ),
                        secondChild: const SizedBox(height: 0),
                        crossFadeState: serviceFeeType.value == 2
                            ? CrossFadeState.showFirst
                            : CrossFadeState.showSecond,
                      ),
                    ),
                    Obx(
                      () => AnimatedCrossFade(
                        duration: const Duration(milliseconds: 180),
                        firstChild: inputTextPad(
                          title: "其他金额",
                          placeholder: "请输入中介费",
                          inputFormatters: [
                            MoneyInputFormatter(
                              mantissaLength: 0,
                              leadingSymbol: MoneySymbols.YEN_SIGN,
                              onValueChange: serviceFee,
                            )
                          ],
                        ),
                        secondChild: const SizedBox(height: 0),
                        crossFadeState: serviceFeeType.value == 2
                            ? CrossFadeState.showFirst
                            : CrossFadeState.showSecond,
                      ),
                    ),
                  ],
                  onConfirm: canConfirm
                      ? () {
                          if (hasServiceFee.value == 1) {
                            controller.serviceFee(ServiceFee(has: false));
                          } else if (serviceFeeType.value == 0 ||
                              serviceFeeType.value == 1) {
                            controller.serviceFee(
                                ServiceFee(type: serviceFeeType.value));
                          } else {
                            controller.serviceFee(ServiceFee(
                                type: 2,
                                payType: serviceFeePayment.value,
                                value: serviceFee.value));
                          }
                          Get.back();
                        }
                      : null);
            },
          ),
        );
      },
    );
  }

  Widget _buildOtherFeeItem(BuildContext context) {
    final other = controller.otherFee.value;
    return _buildItem(
      context,
      title: "其他费用",
      valueWidget: Text(
        other != null ? other.description : "请填写",
        style: TextStyle(
            color: other != null
                ? CupertinoColors.label
                : CupertinoColors.placeholderText),
      ),
      onTap: () {
        final of = controller.otherFee.value;
        final elFee = Rx<double?>(of?.el);
        final netFee = Rx<double?>(of?.net);
        final waterFee = Rx<double?>(of?.water);
        final otherFee = Rx<double?>(of?.other);

        currencyTextFieldBuilder(Rx<double?> value, {bool autofocus = false}) {
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: CupertinoTextField(
                autofocus: true,
                decoration: null,
                controller: TextEditingController(
                  text: value.value != null
                      ? "${value.toStringAsFixed(0)}元/月"
                      : null,
                ),
                placeholder: "预估金额",
                style: const TextStyle(
                  fontSize: 25,
                  fontWeight: FontWeight.w400,
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  MoneyInputFormatter(
                    mantissaLength: 0,
                    trailingSymbol: "元/月",
                    onValueChange: value,
                  ),
                ],
              ),
            ),
          );
        }

        showCupertinoModalBottomSheet(
            context: Get.context!,
            builder: (context) {
              return CupertinoPageScaffold(
                  child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              "*若无需缴纳费用，请填0元/月",
                              style: TextStyle(
                                fontSize: 14.0,
                                color: CupertinoColors.secondaryLabel,
                              ),
                            ),
                          ),
                          Obx(() {
                            final canConfirm = (elFee.value ?? 0) > 0 &&
                                (netFee.value ?? 0) > 0 &&
                                (waterFee.value ?? 0) > 0;
                            return CupertinoButton(
                                onPressed: canConfirm
                                    ? () {
                                        controller.otherFee(
                                          OtherFee(
                                              el: elFee.value!,
                                              water: waterFee.value!,
                                              net: netFee.value!,
                                              other: otherFee.value),
                                        );
                                        Get.back();
                                      }
                                    : null,
                                child: const Text("确认"));
                          })
                        ],
                      ),
                      _buildItem(
                        context,
                        title: "水费",
                        valueWidget: currencyTextFieldBuilder(
                          waterFee,
                          autofocus: true,
                        ),
                      ),
                      _buildItem(
                        context,
                        title: "电费",
                        valueWidget: currencyTextFieldBuilder(elFee),
                      ),
                      _buildItem(
                        context,
                        title: "网费",
                        valueWidget: currencyTextFieldBuilder(netFee),
                      ),
                      _buildItem(
                        context,
                        title: "其他费用",
                        isRequired: false,
                        valueWidget: currencyTextFieldBuilder(otherFee),
                      )
                    ],
                  ),
                ),
              ));
            });
      },
    );
  }

  Widget _buildAreaItem(BuildContext context) {
    final a = controller.area.value;
    return _buildItem(
      context,
      title: "房间面积",
      valueWidget: Text(
        a == null ? "请填写" : "${a.toStringAsFixed(0)} m²",
        style: TextStyle(
            color: a == null
                ? CupertinoColors.placeholderText
                : CupertinoColors.label),
      ),
      onTap: () {
        final v = Rx<double?>(controller.area.value);
        showCupertinoModalBottomSheet(
          context: Get.context!,
          builder: (context) {
            return confirmPageScaffold(
              context,
              title: "",
              children: [
                inputTextPad(
                  title: "房屋面积",
                  inputFormatters: [
                    MoneyInputFormatter(
                      mantissaLength: 0,
                      onValueChange: v,
                    )
                  ],
                )
              ],
              onConfirm: () {
                if ((v.value ?? 0) > 0) {
                  controller.area(v.value);
                  Get.back();
                } else {
                  toast(warning: "请输入房间面积");
                }
              },
            );
          },
        );
      },
    );
  }

  Widget _buildContactPhoneItem(BuildContext context) {
    final tv = Rx<String?>(null);
    return _buildInputItem(
      context,
      title: "手机号",
      isRequired: false,
      valueWidget: Text(
        controller.contactPhone.value ?? "请填写",
        style: TextStyle(
            color: controller.contactPhone.value == null
                ? CupertinoColors.placeholderText
                : CupertinoColors.label),
      ),
      keyboardType: TextInputType.phone,
      onChanged: tv,
      onConfirm: () {
        if (tv.value != null) {
          controller.contactPhone(tv.value);
        }
        Get.back();
      },
    );
  }

  Widget _buildIsHiddenPhone(BuildContext context) {
    return _buildItem(
      context,
      title: "隐藏我的联系方式",
      isRequired: false,
      valueWidget: CupertinoSwitch(
        activeColor: CupertinoTheme.of(context).primaryColor,
        value: controller.isHiddenContactPhone.value,
        onChanged: controller.isHiddenContactPhone,
      ),
    );
  }

  Widget _buildHouseOwnerTypeItem(BuildContext context) {
    description(int? value) {
      return value == null
          ? "请填写"
          : value == 0
              ? "代理"
              : value == 1
                  ? "业主"
                  : "租客";
    }

    return _buildItem(
      context,
      title: "我是此房源的",
      valueWidget: Text(
        description(controller.houseOwnerType.value),
        style: TextStyle(
          color: controller.houseOwnerType.value == null
              ? CupertinoColors.placeholderText
              : CupertinoColors.label,
        ),
      ),
      onTap: () {
        showPicker(
          Get.context!,
          selectedData: controller.houseOwnerType.value,
          data: [0, 1, 2],
          fn: description,
        ).then((value) => controller.houseOwnerType(value));
      },
    );
  }

  Widget _buildInputArea(BuildContext context,
      {required String title, required Rx<String> v, bool isRequired = false}) {
    return GestureDetector(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: isRequired
                ? Text.rich(
                    TextSpan(children: [
                      TextSpan(text: title),
                      const TextSpan(
                        text: " *",
                        style: TextStyle(color: CupertinoColors.systemRed),
                      )
                    ]),
                  )
                : Text(title),
          ),
          Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: CupertinoColors.opaqueSeparator,
                width: 0.0,
              ),
              borderRadius: BorderRadius.circular(6),
            ),
            height: 100,
            padding: const EdgeInsets.all(8.0),
            alignment: Alignment.topLeft,
            child: Text(
              v.value,
              style: const TextStyle(),
            ),
          )
        ],
      ),
      onTap: () {
        final c = TextEditingController(text: v.value);
        showCupertinoModalBottomSheet<String>(
          context: Get.context!,
          builder: (context) {
            return confirmPageScaffold(context, title: title, children: [
              Expanded(
                child: Align(
                  alignment: Alignment.topLeft,
                  child: CupertinoTextField(
                    autofocus: true,
                    decoration: null,
                    maxLines: 50,
                    controller: c,
                    placeholder: "添加$title",
                  ),
                ),
              ),
            ], onConfirm: () {
              Get.back(result: c.text);
            });
          },
        ).then(
          (value) {
            if (value != null) v(value);
          },
        );
      },
    );
  }

  Widget _buildInputNumberItem(
    BuildContext context, {
    required String title,
    required Rx<int?> value,
    required String unit,
  }) {
    final tv = Rx<double?>(value.value?.toDouble());
    return _buildInputItem(context,
        title: title,
        valueWidget: Text(
          value.value == null
              ? "请填写"
              : "${value.value!} ${unit.substring(0, 1)}",
          style: TextStyle(
              color: value.value == null
                  ? CupertinoColors.placeholderText
                  : CupertinoColors.label),
        ),
        inputFormatters: [
          MoneyInputFormatter(
            mantissaLength: 0,
            onValueChange: tv,
          ),
        ], onConfirm: () {
      if (tv.value != null) {
        value(tv.value?.toInt());
      }
      Get.back();
    });
  }

  Widget _buildInputItem(
    BuildContext context, {
    required String title,
    required Widget valueWidget,
    List<TextInputFormatter>? inputFormatters,
    TextInputType keyboardType = TextInputType.number,
    VoidCallback? onConfirm,
    ValueChanged<String>? onChanged,
    bool isRequired = true,
  }) {
    return _buildItem(context,
        title: title,
        valueWidget: valueWidget,
        isRequired: isRequired, onTap: () {
      showCupertinoModalBottomSheet(
        context: Get.context!,
        builder: (context) {
          return confirmPageScaffold(context,
              title: "",
              children: [
                inputTextPad(
                  title: title,
                  inputFormatters: inputFormatters,
                  keyboardType: keyboardType,
                  onChanged: onChanged,
                ),
              ],
              onConfirm: onConfirm);
        },
      );
    });
  }

  Widget _buildChooseChipItem(
    BuildContext context, {
    required String title,
    required List<String> options,
    required Rx<int?> value,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
        GroupChoiceChip(
          childCount: options.length,
          titleFn: (i) => options[i],
          value: value.value,
          onChange: value,
        ),
      ],
    );
  }

  Widget _buildItem(BuildContext context,
      {required String title,
      required Widget valueWidget,
      VoidCallback? onTap,
      bool isRequired = true}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(border: bottomBorder()),
        height: 50,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            isRequired
                ? Text.rich(
                    TextSpan(children: [
                      TextSpan(text: title),
                      const TextSpan(
                        text: "*",
                        style: TextStyle(color: CupertinoColors.systemRed),
                      )
                    ]),
                  )
                : Text(title),
            valueWidget
          ],
        ),
      ),
    );
  }

  Widget requiredTitle(String text) {
    return Container(
      height: 40,
      decoration: BoxDecoration(border: bottomBorder()),
      alignment: Alignment.centerLeft,
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(text: text),
            const TextSpan(
              text: "*",
              style: TextStyle(color: CupertinoColors.systemRed),
            ),
          ],
        ),
        textAlign: TextAlign.start,
      ),
    );
  }

  Widget inputTextPad(
      {required String title,
      List<TextInputFormatter>? inputFormatters,
      TextInputType keyboardType = TextInputType.number,
      ValueChanged<String>? onChanged,
      String? placeholder}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      height: 85,
      child: Row(children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(width: 4),
        Expanded(
          child: CupertinoTextField(
            autofocus: true,
            placeholder: placeholder ?? "请输入$title",
            decoration: null,
            keyboardType: keyboardType,
            onChanged: onChanged,
            style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w400),
            placeholderStyle: const TextStyle(
              fontSize: 25,
              color: CupertinoColors.placeholderText,
            ),
            inputFormatters: inputFormatters,
          ),
        )
      ]),
    );
  }
}
