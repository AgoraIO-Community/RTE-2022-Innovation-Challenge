import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/services/location.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/city_code.dart';
import 'package:super_rent/src/utils/widget.dart';

class CityPicker extends StatefulWidget {
  const CityPicker({Key? key}) : super(key: key);

  @override
  State<CityPicker> createState() => _CityPickerState();
}

class _CityPickerState extends State<CityPicker> {
  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text("城市选择"),
        border: null,
        backgroundColor: CupertinoColors.systemBackground,
      ),
      child: ListView(
        children: [
          GestureDetector(
            onTap: () {
              toast(warning: '试运营期仅支持热门城市');
            },
            child: Container(
              alignment: Alignment.centerLeft,
              decoration: BoxDecoration(
                border: bottomBorder(),
              ),
              height: 60,
              child: const Padding(
                padding: EdgeInsets.only(left: 16.0),
                child: Text(
                  "搜索城市名称",
                  style: TextStyle(
                    color: CupertinoColors.placeholderText,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
          const Padding(
            padding: EdgeInsets.only(left: 16.0),
            child: Text(
              "热门城市",
              style: TextStyle(fontSize: 18.0),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 16.0, top: 16.0),
            child: Wrap(
              spacing: 8.0,
              children: City.hot
                  .asMap()
                  .entries
                  .map((c) => GestureDetector(
                        onTap: () {
                          final city = c.value;
                          final location = City.hotLocations[c.key];
                          Get.find<LocationService>()
                              .updateCity(city, location);
                          Get.back();
                        },
                        child: Container(
                          alignment: Alignment.center,
                          width: 60,
                          height: 44,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(
                                color: CupertinoColors.opaqueSeparator,
                                width: 0),
                          ),
                          child: Text(c.value.name),
                        ),
                      ))
                  .toList(growable: false),
            ),
          ),
        ],
      ),
    );
  }
}
