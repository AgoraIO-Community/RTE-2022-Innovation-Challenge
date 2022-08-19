import 'package:flutter/material.dart';

class StyledScrollPhysics extends AlwaysScrollableScrollPhysics {}

class SideBarLayout extends StatelessWidget {

  late ScrollController scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      physics: StyledScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      controller: scrollController,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Side btn'),
        ],
      )
    );
  }
}