import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:super_rent/src/models/add_mode.dart';

class AddPage extends StatefulWidget {
  // -1 点击背景
  final ValueChanged<AddMode?> onTap;

  const AddPage({Key? key, required this.onTap}) : super(key: key);

  @override
  State<AddPage> createState() => _AddPageState();
}

class _AddPageState extends State<AddPage> with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 500));
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();

    final curved =
        CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack);
    _animation = Tween(begin: 0.0, end: 1.0).animate(curved);

    _controller.forward();
  }

  void _closeWithMode(AddMode? mode) {
    _controller.reverse().then((value) => widget.onTap(mode));
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        _closeWithMode(null);
      },
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) => BackdropFilter(
          filter: ImageFilter.blur(
              sigmaX: _animation.value * 15, sigmaY: _animation.value * 10),
          child: child,
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              ...AddMode.supportModes.map((m) => _buildMenuItem(context, m)),
              const SizedBox(height: 20),
              _wrapAnimation(_buildCloseButton(context)),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  Widget _wrapAnimation(Widget child) {
    return SlideTransition(
      position: Tween(begin: const Offset(0, 1), end: Offset.zero)
          .animate(_animation),
      child: FadeTransition(
        opacity: _animation,
        child: child,
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, AddMode am) {
    final menu = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircleAvatar(
          radius: 30.0,
          backgroundColor: am.color,
          child: Image.asset(am.imageName,
              width: 30, color: CupertinoColors.white),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              am.title,
              style: const TextStyle(
                fontSize: 18.0,
                color: CupertinoColors.label,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              am.subTitle,
              style: const TextStyle(
                color: CupertinoColors.secondaryLabel,
                fontSize: 16.0,
              ),
            ),
          ],
        )
      ],
    );

    return GestureDetector(
      onTap: () => _closeWithMode(am),
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 20),
        child: _wrapAnimation(menu),
      ),
    );
  }

  Widget _buildCloseButton(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        _closeWithMode(null);
      },
      style: ElevatedButton.styleFrom(
        shape: const CircleBorder(),
        primary: Colors.white,
        padding: EdgeInsets.zero,
        minimumSize: const Size(50, 50),
        maximumSize: const Size(50, 50),
      ),
      child: const Icon(
        Icons.close,
        color: Colors.black,
        size: 30,
      ),
    );
  }
}
