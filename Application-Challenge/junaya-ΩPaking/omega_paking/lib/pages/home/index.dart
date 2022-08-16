import 'package:flutter/material.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {

  @override
  void initState() {
    super.initState();
  }

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
      body: Center(
        child: Text('Home Page1'),
      ),
      floatingActionButtonAnimator: FloatingActionButtonAnimator.scaling,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<AppModel>().toggleTheme();
        },
        child: Icon(Icons.add),
      ),
    );
  }
}