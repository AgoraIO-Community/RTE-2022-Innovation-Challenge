import 'package:animated_toggle_switch/animated_toggle_switch.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/instance_manager.dart';
import 'package:get/route_manager.dart';
import 'package:super_rent/src/controllers/add/rent.dart';
import 'package:super_rent/src/models/add_mode.dart';
import 'package:super_rent/src/pages/add/ask_for_rent.dart';
import 'package:super_rent/src/pages/add/record_house.dart';
import 'package:super_rent/src/pages/add/rent.dart';

import '../../controllers/add/ask_for_rent.dart';

class AddContainerPage extends StatefulWidget {
  final AddMode mode;
  const AddContainerPage(this.mode, {Key? key}) : super(key: key);

  @override
  State<AddContainerPage> createState() => _AddContainerPageState();
}

class _AddContainerPageState extends State<AddContainerPage> {
  late AddMode _mode;

  @override
  void initState() {
    super.initState();
    _mode = widget.mode;
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      resizeToAvoidBottomInset: false,
      child: SafeArea(
        child: Column(
          children: [
            AnimatedToggleSwitch<AddMode>.size(
              current: _mode,
              values: AddMode.supportModes,
              indicatorColor: CupertinoTheme.of(context).primaryColor,
              iconBuilder: ((m, size) {
                final isSelected = m == _mode;
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      m.imageName,
                      width: size.width,
                      color: isSelected ? Colors.white : Colors.black,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      m.title,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.black,
                      ),
                    ),
                  ],
                );
              }),
              onChanged: (m) {
                setState(() {
                  _mode = m;
                  Get.offAllNamed(_mode.router, id: 1);
                });
              },
              indicatorSize: const Size(100, double.infinity),
              borderWidth: 0.0,
              borderColor: Colors.transparent,
              colorBuilder: (m) => m.color,
              selectedIconSize: const Size(23, 23),
            ),
            Expanded(
              child: Navigator(
                key: Get.nestedKey(1),
                initialRoute: widget.mode.router,
                onGenerateRoute: (settings) {
                  if (settings.name == AddMode.routerAskForRent) {
                    return GetPageRoute(
                      page: () => const AskForRentPage(),
                      binding:
                          BindingsBuilder.put(() => AskForRentController()),
                      transition: Transition.fadeIn,
                    );
                  }
                  if (settings.name == AddMode.routerRent) {
                    return GetPageRoute(
                      page: () => const RentPage(),
                      binding: BindingsBuilder.put(() => RentController()),
                      transition: Transition.fadeIn,
                    );
                  }
                  return GetPageRoute(
                    page: () => RecordHousePage(),
                    binding: BindingsBuilder.put(() => AskForRentController()),
                    transition: Transition.fadeIn,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
