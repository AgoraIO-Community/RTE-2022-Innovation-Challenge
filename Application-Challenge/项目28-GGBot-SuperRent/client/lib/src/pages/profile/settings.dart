import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/services/account.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
        child: Center(
      child: CupertinoButton(
        child: const Text("logout"),
        onPressed: () {
          Get.find<AccountService>().logout();
        },
      ),
    ));
  }
}
