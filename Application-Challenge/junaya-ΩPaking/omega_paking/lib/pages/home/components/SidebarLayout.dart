import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/models/auth_model.dart';
import 'package:omega_paking/pages/login/index.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

class StyledScrollPhysics extends AlwaysScrollableScrollPhysics {}

class SideBarLayout extends StatelessWidget {

  SideBarLayout({Key? key}) : super(key: key);
  
  late ScrollController scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    AppTheme theme = context.watch();
    return Provider.value(
      value: this,
      child: Container(
        height: double.infinity,
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: theme.bg2,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(0, 8),
              spreadRadius: 9,
            ),
          ],
        ),
        child: Column(
          children: [
            Expanded(
              flex: 4,
              child: SingleChildScrollView(
                scrollDirection: Axis.vertical,
                physics: StyledScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                controller: scrollController,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text('TODO'),
                    SizedBox(height: 8.0),
                  ],
                )
              ),
            ),
            Expanded(
              flex: 1,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                    onPressed: () {},
                    child: Row(
                      children: const [
                        Icon(Icons.settings, color: Colors.white,),
                      ],
                    )
                  ),
                  const SizedBox(height: 8.0),
                  Switch(value: context.read<AppTheme>().isDark, onChanged: (bool v) {
                    context.read<AppModel>().toggleTheme();
                  }),
                  const SizedBox(height: 8.0),
                  ElevatedButton(
                    onPressed: () {
                      context.read<AuthModel>().reset();
                      Navigator.push<void>(context, PageRoutes.fade(() => LoginPage(), Durations.slow.inMilliseconds * .001));
                    },
                    child: Row(
                      children: const [
                        Icon(Icons.logout, color: Colors.white,),
                      ],
                    )
                  ),
                ],
              ),
            )
          ]
        )
      )
    );
  }
}