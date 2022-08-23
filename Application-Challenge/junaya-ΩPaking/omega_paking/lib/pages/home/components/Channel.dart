import 'package:bot_toast/bot_toast.dart';
import 'package:desktop_window/desktop_window.dart';
import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/commands/bootstrap_command.dart';
import 'package:omega_paking/pages/chat/index.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

class ChannelWidge extends StatelessWidget {
  String title;
  String cover;
  bool isLive;

  ChannelWidge(this.title, this.cover, this.isLive, {Key? key}) : super(key: key);

  
  @override
  Widget build(BuildContext context) {
    AppTheme theme = context.watch();
    return Provider.value(
      value: this,
      child: Container(
        padding: const EdgeInsets.all(16.0),
        margin: const EdgeInsets.only(bottom: 16.0),
        decoration: BoxDecoration(
          color: theme.bg1,
          borderRadius: const BorderRadius.all(Radius.circular(24.0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w500),),
            const SizedBox(height: 8.0),
            Container(
              width: 124,
              height: 124,
              clipBehavior: Clip.antiAlias,
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: theme.accent2,
                borderRadius: const BorderRadius.all(Radius.circular(62.0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 4),
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: Container(
                width: 86,
                height: 86,
                clipBehavior: Clip.antiAlias,
                decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(62.0)),
              ),
                child: Image.asset(cover, fit: BoxFit.cover),
              ),
            ),
            const SizedBox(height: 8.0),
            ElevatedButton(
              onPressed: () {
                print('pressed $isLive');
                if (isLive == true) {
                  Navigator.push<void>(context, PageRoutes.fade(() => ChatPage(), Durations.slow.inMilliseconds * .001));
                  DesktopWindow.setFullScreen(true);
                } else {
                  BotToast.showText(text: "This channel is not live");
                }
              },
              child: const Text('Enter'),
            ),
          ],
        ),
      )
    );
  }
}