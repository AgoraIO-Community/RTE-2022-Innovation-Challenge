import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/pages/home/index.dart';
import 'package:omega_paking/styles.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            const Text('Login'),
            ElevatedButton(
              child: const Text("Login"),
              onPressed: () async {
                Navigator.push<void>(context, PageRoutes.fade(() => HomePage(), Durations.slow.inMilliseconds * .001));
              },
            ),
          ],
        ),
      ),
    );
  }
}