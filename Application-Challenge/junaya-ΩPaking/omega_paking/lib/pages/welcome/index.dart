import 'dart:async';

import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/pages/login/index.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

class WelcomePage extends StatefulWidget {
  final bool initialPanelOpen;
  const WelcomePage({Key? key, this.initialPanelOpen = false}) : super(key: key);

  @override
  WelcomePageState createState() => WelcomePageState();
}

class WelcomePageState extends State<WelcomePage> {
  bool get isLoading => _isLoading;
  bool _isLoading = false;
  set isLoading(bool value) => setState(() => _isLoading = value);

  bool showContent = false;

  Future<void> loadInfo() async {
    isLoading = true;
    await Future.delayed(const Duration(seconds: 2));
    isLoading = false;
  }

    /// Allows someone else to tell us to open the panel
  void showPanel(value) => setState(() => showContent = value);

  void refreshDataAndLoadApp() async {
    /// Load initial contacts
    isLoading = true;
    /// Show main app view
    Navigator.push<void>(context, PageRoutes.fade(() => LoginPage(), Durations.slow.inMilliseconds * .001));
  }

  @override
  void initState() {
    showContent = widget.initialPanelOpen;
    loadInfo();
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Provider.value(value: this, child: WelcomePageStateView());
  }
}

class WelcomePageStateView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    WelcomePageState state = context.watch();
    AppTheme theme = context.watch();
    return Scaffold(
      backgroundColor: theme.bg1,
      body: TweenAnimationBuilder<double>(
        duration: Durations.slow,
        tween: Tween(begin: 0, end: 1),
        builder: (context, value, child) => Opacity(
          opacity: value,
          child: Center(
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(
                  color: theme.accent1,
                  alignment: Alignment.center,
                  child: const Text('Welcome OmegaPaking'),
                ),
                Container(
                  color: theme.bg2,
                  margin: const EdgeInsets.only(bottom: 100),
                  width: 400,
                  height: 100,
                  alignment: Alignment.bottomCenter,
                  child: ElevatedButton(
                    child: const Text("Start"),
                    onPressed: () async {
                      Navigator.push<void>(context, PageRoutes.fade(() => LoginPage(), Durations.slow.inMilliseconds * .001));
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}