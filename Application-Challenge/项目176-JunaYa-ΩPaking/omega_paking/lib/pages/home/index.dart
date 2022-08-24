import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/components/resposive.dart';
import 'package:omega_paking/_internal/components/scrolling/styled_listview.dart';
import 'package:omega_paking/_internal/components/spacing.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/pages/chat/index.dart';
import 'package:omega_paking/pages/home/components/SidebarLayout.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

import 'components/Channel.dart';

class StyledScrollPhysics extends AlwaysScrollableScrollPhysics {}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  @override
  void initState() {
    scrollController = ScrollController();
    super.initState();
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  late ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return Provider.value(
      value: this,
      child: _HomePageStateView(),
    );
  }
}

class _HomePageStateView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    _HomePageState state = context.watch();
    AppTheme theme = context.watch();
    return Scaffold(
      backgroundColor: theme.bg2,
      body: Response(
        mobile: _WrapperView(),
        tablet: _WrapperDesktopView(),
        desktop: _WrapperDesktopView(),
      ),
    );
  }
}

class _WrapperDesktopView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    _HomePageState state = context.watch();
    return LayoutBuilder(builder: (_, constraints) {
      return Row(
      children: [
        SideBarLayout(),
        SingleChildScrollView(
          scrollDirection: Axis.vertical,
          physics: StyledScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          controller: state.scrollController,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ChannelWidge('My Live', 'assets/images/img1.jpg', true),
                  const HSpace(16),
                  ChannelWidge('Reading Live', 'assets/images/img2.jpg', false),
                ],
              ),
              Row(
                children: [
                  ChannelWidge('Math Live', 'assets/images/img3.jpg', false),
                  const HSpace(16),
                  ChannelWidge('Science Live', 'assets/images/img4.jpg', false),
                ],
              ),
              Row(
                children: [
                  ChannelWidge('Go Live', 'assets/images/img5.jpg', false),
                  const HSpace(16),
                  ChannelWidge('Writing Live', 'assets/images/img6.jpg', false),
                ],
              ),
            ],
          )
        ),
      ]
    );
    });
  }
}

class _WrapperView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    _HomePageState state = context.watch();
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      physics: StyledScrollPhysics(),
      controller: state.scrollController,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ChannelWidge('My Live', 'assets/images/img1.jpg', true),
              const HSpace(16),
              ChannelWidge('My Live', 'assets/images/img2.jpg', false),
            ],
          ),
          Row(
            children: [
              ChannelWidge('My Live', 'assets/images/img3.jpg', false),
              const HSpace(16),
              ChannelWidge('My Live', 'assets/images/img4.jpg', false),
            ],
          ),
          Row(
            children: [
              ChannelWidge('My Live', 'assets/images/img5.jpg', false),
              const HSpace(16),
              ChannelWidge('My Live', 'assets/images/img6.jpg', false),
            ],
          ),
        ],
      )
    );
  }
}