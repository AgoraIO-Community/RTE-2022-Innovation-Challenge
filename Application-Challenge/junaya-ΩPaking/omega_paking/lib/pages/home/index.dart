import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/components/resposive.dart';
import 'package:omega_paking/_internal/components/scrolling/styled_listview.dart';
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
      floatingActionButtonAnimator: FloatingActionButtonAnimator.scaling,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<AppModel>().toggleTheme();
        },
        child: const Icon(Icons.settings, color: Colors.white,),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: const [
                  ChannelWidge(),
                  SizedBox(width: 16.0),
                  ChannelWidge(),
                ],
              ),
              Row(
                children: const [
                  ChannelWidge(),
                  SizedBox(width: 16.0),
                  ChannelWidge(),
                ],
              ),
              Row(
                children: const [
                  ChannelWidge(),
                  SizedBox(width: 16.0),
                  ChannelWidge(),
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
          ChannelWidge(),
          ChannelWidge(),
          ChannelWidge(),
          ChannelWidge(),
          ChannelWidge(),
        ],
      )
    );
  }
}