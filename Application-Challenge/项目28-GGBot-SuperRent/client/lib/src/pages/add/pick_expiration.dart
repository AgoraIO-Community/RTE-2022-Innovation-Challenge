import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/widgets/group_choice.dart';

class PickExpiration extends StatefulWidget {
  const PickExpiration({Key? key}) : super(key: key);

  @override
  State<PickExpiration> createState() => _PickExpirationState();
}

class _PickExpirationState extends State<PickExpiration> {
  int? selected;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: CupertinoColors.systemBackground,
          borderRadius: BorderRadius.circular(8.0),
        ),
        height: 250,
        width: MediaQuery.of(context).size.width - 32,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                CupertinoButton(
                  child: const Icon(
                    CupertinoIcons.clear,
                    color: CupertinoColors.label,
                  ),
                  onPressed: () {
                    Get.back();
                  },
                ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 32.0),
              child: Text(
                "请选择帖子有效期",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GroupChoiceChip(
                maxWidth: 70,
                childCount: 3,
                titleFn: (i) => i == 0
                    ? '3天'
                    : i == 1
                        ? '7天'
                        : '1个月',
                value: selected,
                onChange: (int? value) {
                  setState(
                    () {
                      selected = value;
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  bottom: 20, left: 16, right: 16, top: 20),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  primary: CupertinoTheme.of(context).primaryColor,
                  fixedSize: Size(Get.size.width - 32, 44),
                  elevation: 0,
                ),
                onPressed: selected == null
                    ? null
                    : () => Get.back(
                          result: selected == 0
                              ? 3
                              : selected == 1
                                  ? 7
                                  : 31,
                        ),
                child: const Text("确定发布"),
              ),
            )
          ],
        ),
      ),
    );
  }
}
