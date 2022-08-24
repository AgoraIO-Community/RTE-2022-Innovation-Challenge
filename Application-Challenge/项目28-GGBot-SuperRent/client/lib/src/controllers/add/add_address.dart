import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:super_rent/src/services/leancloud.dart';
import 'package:super_rent/src/services/location.dart';

import '../../models/place.dart';

class AddAddressController extends GetxController {
  //
  List<Place> get places => _places;
  final _places = <Place>[].obs;

  final _searchText = "".obs;
  final lc = Get.find<LocationService>();

  final textEditingController = TextEditingController();

  late final Worker _searchWorker;

  bool get searching => _searching.value;
  final _searching = false.obs;

  void searchTextOnChange(String searchText) {
    if (!textEditingController.value.isComposingRangeValid) {
      if (textEditingController.text.isNotEmpty &&
          textEditingController.text != _searchText.value) {
        _searchText(textEditingController.text);
      }
    }
  }

  @override
  void onInit() {
    super.onInit();

    _searchWorker = debounce<String>(
      _searchText,
      (text) async {
        _searching(true);
        final r = await API.searchPlace(text, lc.city.code, lc.location);
        _searching(false);
        if (r.isValue) {
          _places.assignAll(r.asValue!.value.listValue);
        }
      },
      time: const Duration(milliseconds: 300),
    );
  }

  @override
  void onReady() {
    super.onReady();
    _searchText("");
  }

  @override
  void dispose() {
    super.dispose();
    _searchWorker.dispose();
  }
}
