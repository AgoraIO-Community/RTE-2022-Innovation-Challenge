import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/pages/chat/index.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

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
      appBar: AppBar(
        title: Text('Home'),
      ),
      backgroundColor: theme.bg2,
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        physics: StyledScrollPhysics(),
        controller: state.scrollController,
        child: Column(
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.push<void>(context, PageRoutes.fade(() => ChatPage(), Durations.slow.inMilliseconds * .001));
              },
              child: const Text('Default Channel'),
            ),
          ],
        ),
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