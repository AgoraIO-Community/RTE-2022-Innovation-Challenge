import 'package:flutter/material.dart';

class Response extends StatelessWidget {
  final Widget? mobile;
  final Widget? tablet;
  final Widget? desktop;

  const Response({
    Key? key,
    required this.mobile,
    this.tablet,
    this.desktop,
  }) : super(key: key);

  static bool isMobile(BuildContext context) =>
    MediaQuery.of(context).size.width < 576;

  static bool isTablet(BuildContext context) =>
    MediaQuery.of(context).size.width >= 576 &&
    MediaQuery.of(context).size.width <= 992;
  
  static bool isDesktop(BuildContext context) =>
    MediaQuery.of(context).size.width > 992;

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    if (size.width > 992) {
      return desktop!;
    } else if (size.width > 576) {
      return tablet!;
    } else {
      return mobile!;
    }
  }


}