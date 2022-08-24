import 'package:flutter/cupertino.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/instance_manager.dart';
import 'package:get/route_manager.dart';

import 'controllers/splash.dart';
import 'pages/splash.dart';
import 'utils/color.dart';

class App extends StatefulWidget {
  const App({Key? key}) : super(key: key);

  @override
  State<App> createState() => _AppState();
}

// 像一个扎着俩冲天辫的小女孩
class _AppState extends State<App> {
  @override
  Widget build(BuildContext context) {
    return GetCupertinoApp(
      theme: const CupertinoThemeData(
        brightness: Brightness.light,
        primaryColor: Color(primaryColorHex),
        barBackgroundColor: CupertinoColors.secondarySystemBackground,
        scaffoldBackgroundColor: CupertinoColors.systemBackground,
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: "/",
      getPages: [
        GetPage(
          name: "/",
          page: () => const Splash(),
          binding: BindingsBuilder.put(() => SplashController()),
          transition: Transition.fade,
        ),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate
      ],
    );
  }
}
