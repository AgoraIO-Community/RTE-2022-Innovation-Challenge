import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class AbstractModel extends ChangeNotifier {
  String _fileName = 'app';

  void reset([bool notify = true]) {
    copyFromJson({});
    if (notify) notifyListeners();
    scheduleSave();
  }

  void notify() => notifyListeners();

  //Make sure that we don't spam the file systems, cap saves to a max frequency
  bool _isSaveScheduled = false;

  //[SB] This is a helper method
  void scheduleSave() async {
    if (_isSaveScheduled) return;
    _isSaveScheduled = true;
    await Future.delayed(const Duration(seconds: 1));
    save();
    _isSaveScheduled = false;
  }

  //Loads a string from disk, and parses it into ourselves.
  Future<void> load() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String str = prefs.getString(_fileName) ?? '{}';
    copyFromJson(jsonDecode(str));
  }

  Future<void> save() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(_fileName, jsonEncode(toJson()));
  }

  //Enable file serialization, remember to override the to/from serialization methods as well
  void enableSerialization(String fileName) {
    _fileName = fileName;
  }

  Map<String, dynamic> toJson() {
    // This should be over-ridden in concrete class to enable serialization
    throw UnimplementedError();
  }

  dynamic copyFromJson(Map<String, dynamic> json) {
    // This should be over-ridden in concrete class to enable serialization
    throw UnimplementedError();
  }

  List<T> toList<T>(dynamic json, dynamic Function(dynamic) fromJson) {
    final List<T> list = (json as Iterable?)?.map((e) {
      return e == null ? e : fromJson(e) as T?;
    }).where((e) => e != null).whereType<T>().toList() ?? [];

    return list;
  }
}

