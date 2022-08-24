import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/components/no_glow_scroll_behavior.dart';
import 'package:omega_paking/commands/bootstrap_command.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/models/auth_model.dart';
import 'package:omega_paking/pages/welcome/index.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';
import 'package:omega_paking/globals.dart';
import  'package:omega_paking/pages/login/index.dart';
import  'package:omega_paking/pages/welcome/index.dart';


void main() {
  /// Initialize models, negotiate dependencies
  runApp(
    MultiProvider(
      providers: [
        /// MODELS
        ChangeNotifierProvider.value(value: AppModel()),
        ChangeNotifierProvider(create: (context) => AuthModel()),

        /// ROOT CONTEXT, Allows Commands to retrieve a 'safe' context that is not tied to any one view. Allows them to work on async tasks without issues.
        Provider<BuildContext>(create: (c) => c),
      ],
      child: MainApp()
    )
  );
}

class MainApp extends StatefulWidget {
  @override
  _MainAppState createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  final GlobalKey<WelcomePageState> _welcomePageKey = GlobalKey();

  bool _settingLoaded = false;

  @override
  void initState() {
    context.read<AppModel>().load().then((value) async {
      setState(() => _settingLoaded = true);

      bool isSignedIn = await BootstrapCommand(context).execute();
      WelcomePageState? welcomePage = _welcomePageKey.currentState;

      print(welcomePage);
      if (isSignedIn == true) {
        welcomePage?.refreshDataAndLoadApp();
      } else {
        welcomePage?.showPanel(true);
      }

    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {

    if (!_settingLoaded) return Container(color: Colors.white);

    ThemeType themeType = context.select<AppModel, ThemeType>((value) => value.theme);
    AppTheme theme = AppTheme.fromType(themeType);

    if (kIsWeb && !AppModel.enableShadowsOnWeb) {
      Shadows.enabled = false;
    }
    
    final botToastBuilder = BotToastInit();

    return Provider.value(
      value: theme,
      child: MaterialApp(
        title: 'Omega Paking',
        navigatorKey: AppGlobals.rootNavKey,

        theme: theme.themeData,
        
        home: WelcomePage(key: _welcomePageKey),

        navigatorObservers: [BotToastNavigatorObserver()],

        builder: BotToastInit(),
        
        // builder: (_, navigator) {
        //   if (navigator == null) return Container();
        //   // Wrap root page in a builder, so we can make initial responsive tweaks based on MediaQuery
        //   return Builder(builder: (c) {
        //     //Responsive: Reduce size of our gutter scale when we're below a certain size
        //     // Insets.gutterScale = c.size?.width < PageBreaks.TabletPortrait ? .5 : 1;
        //     navigator = botToastBuilder(context, navigator); 
        //     return navigator;
        //     // return ScrollConfiguration(
        //     //   behavior: NoGlowScrollBehavior(),
        //     //   child: navigator,
        //     // );
        //   });
        // },
      ),
    );
  }
}