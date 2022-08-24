import 'package:get/get.dart';

class AddController extends GetxController {
  int get mode => _mode.value;

  late final RxInt _mode;

  AddController(int mode) {
    _mode = mode.obs;
  }
}
