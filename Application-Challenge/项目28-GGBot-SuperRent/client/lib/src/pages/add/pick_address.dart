import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_baidu_mapapi_base/flutter_baidu_mapapi_base.dart';
import 'package:flutter_baidu_mapapi_map/flutter_baidu_mapapi_map.dart';
import 'package:get/route_manager.dart';
import 'package:super_rent/src/services/toast.dart';

class GradientCheatingBorder extends Border {
  final Gradient gradient;

  const GradientCheatingBorder({
    required this.gradient,
    BorderSide top = BorderSide.none,
    BorderSide right = BorderSide.none,
    BorderSide bottom = BorderSide.none,
    BorderSide left = BorderSide.none,
  }) : super(top: top, right: right, bottom: bottom, left: left);

  const GradientCheatingBorder.fromBorderSide(BorderSide side,
      {required this.gradient})
      : super.fromBorderSide(side);

  factory GradientCheatingBorder.all({
    Color color = const Color(0xFF000000),
    double width = 1.0,
    BorderStyle style = BorderStyle.solid,
    required Gradient gradient,
  }) {
    final BorderSide side =
        BorderSide(color: color, width: width, style: style);
    return GradientCheatingBorder.fromBorderSide(side, gradient: gradient);
  }

  @override
  void paint(Canvas canvas, Rect rect,
      {TextDirection? textDirection,
      BoxShape shape = BoxShape.rectangle,
      BorderRadius? borderRadius}) {
    canvas.drawRect(
      rect,
      Paint()
        ..shader = gradient.createShader(rect)
        ..style = PaintingStyle.fill,
    );

    super.paint(
      canvas,
      rect,
      textDirection: textDirection,
      shape: shape,
      borderRadius: borderRadius,
    );
  }
}

class PickAddress extends StatefulWidget {
  const PickAddress({Key? key}) : super(key: key);

  @override
  State<PickAddress> createState() => _PickAddressState();
}

class _PickAddressState extends State<PickAddress> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 1)).then(
      (value) => toast(warning: "试运营暂不支持地图选点"),
    );
    Future.delayed(const Duration(seconds: 5)).then(
      (value) => Get.back(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      resizeToAvoidBottomInset: false,
      child: Stack(
        children: [
          Positioned.fill(
            child: BMFMapWidget(
              mapOptions: BMFMapOptions(
                mapType: BMFMapType.Standard,
                zoomLevel: 18,
              ),
              onBMFMapCreated: (controller) {},
            ),
          ),
          Positioned.fill(
            child: Container(
              alignment: Alignment.center,
              color: Colors.black.withOpacity(0.5),
            ),
          )
        ],
      ),
    );
  }
}
