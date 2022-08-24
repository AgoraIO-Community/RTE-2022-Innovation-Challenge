import 'package:flutter/cupertino.dart';
import 'package:flutter_baidu_mapapi_base/flutter_baidu_mapapi_base.dart';
import 'package:flutter_baidu_mapapi_map/flutter_baidu_mapapi_map.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/services/toast.dart';

import '../../widgets/button.dart';

class BaiduMap extends StatelessWidget {
  final double latitude;
  final double longitude;

  const BaiduMap({Key? key, required this.latitude, required this.longitude})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: BMFMapWidget(
            mapOptions: BMFMapOptions(
              mapType: BMFMapType.Standard,
              zoomLevel: 18,
              center: BMFCoordinate(
                latitude,
                longitude,
              ),
            ),
            onBMFMapCreated: (controller) {
              toast(warning: "地图暂不支持更多操作");
            },
          ),
        ),
        Positioned(
          top: 100,
          left: 100,
          right: 100,
          child: secondaryButton(
            context,
            fixedSize: const Size(100, 44),
            child: const Text("返回"),
            onTap: () => Get.back(),
          ),
        )
      ],
    );
  }
}
