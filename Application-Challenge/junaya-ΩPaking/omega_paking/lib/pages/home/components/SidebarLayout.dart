import 'package:flutter/material.dart';
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
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                      Text('Side btn'),
                      SizedBox(height: 8.0),
                    ],
                  )
              ),
            ),
            Expanded(
              flex: 1,
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: () {},
                    child: Row(
                      children: [
                        const Icon(Icons.settings, color: Colors.white,),
                        const SizedBox(width: 4.0),
                        const Text('Settings'),
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