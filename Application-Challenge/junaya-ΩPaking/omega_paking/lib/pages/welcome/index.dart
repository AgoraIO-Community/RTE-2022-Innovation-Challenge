import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
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
      body: Center(
        child: Text('WelcomePage'),
      ),
    );
  }

}