import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';

Border bottomBorder() {
  return const Border(
      bottom: BorderSide(color: CupertinoColors.opaqueSeparator, width: 0.0));
}

Widget sectionTitle(String text,
    {double topPadding = 32.0, bool isRequired = true}) {
  return Padding(
    padding: EdgeInsets.only(top: topPadding),
    child: Container(
      alignment: Alignment.centerLeft,
      height: 40,
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: text,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 18.0,
              ),
            ),
            if (!isRequired) const TextSpan(text: "(选填)")
          ],
        ),
      ),
    ),
  );
}

Widget buildChoiceChip(BuildContext context, String text,
    {required bool selected, required ValueChanged<bool> onSelected}) {
  final primaryColor = CupertinoTheme.of(context).primaryColor;
  return ChoiceChip(
    backgroundColor: CupertinoColors.systemGroupedBackground,
    selectedColor: primaryColor.withOpacity(0.2),
    shape: selected
        ? StadiumBorder(
            side: BorderSide(color: primaryColor, width: 1.0),
          )
        : null,
    label: SizedBox(
      height: 36.0,
      child: Center(
        child: Text(
          text,
          style: TextStyle(
            fontSize: 16.0,
            color: selected ? primaryColor : CupertinoColors.label,
          ),
        ),
      ),
    ),
    selected: selected,
    onSelected: onSelected,
  );
}

typedef NamedFn<T> = String Function(T obj);

Future<T?> showPicker<T>(BuildContext context,
    {required List<T> data, T? selectedData, required NamedFn<T> fn}) {
  FocusManager.instance.primaryFocus?.unfocus();
  var selected = 0;
  if (selectedData != null) {
    selected = data.indexOf(selectedData);
  }

  final controller = FixedExtentScrollController(
    initialItem: selected,
  );

  return showCupertinoModalBottomSheet<T>(
    context: context,
    builder: (ctx) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          CupertinoButton(
            onPressed: () {
              Get.back(result: data[selected]);
            },
            child: const Text("确认"),
          ),
          SizedBox(
            height: 180,
            child: CupertinoPicker.builder(
              itemExtent: 50.0,
              scrollController: controller,
              onSelectedItemChanged: (index) {
                selected = index;
              },
              itemBuilder: (context, index) {
                final t = data[index];
                return Center(child: Text(fn(t)));
              },
              childCount: data.length,
            ),
          ),
        ],
      );
    },
  );
}

Widget confirmPageScaffold(BuildContext context,
    {required String title,
    required List<Widget> children,
    MainAxisSize mainAxisSize = MainAxisSize.min,
    VoidCallback? onConfirm}) {
  return CupertinoPageScaffold(
    child: SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          mainAxisSize: mainAxisSize,
          children: [
            SizedBox(
              height: 44,
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    onPressed: onConfirm,
                    child: const Text("确定"),
                  ),
                ],
              ),
            ),
            ...children,
          ],
        ),
      ),
    ),
  );
}
