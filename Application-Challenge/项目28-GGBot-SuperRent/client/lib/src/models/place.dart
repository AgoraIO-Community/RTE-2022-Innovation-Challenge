import 'package:g_json/g_json.dart';

typedef Place = JSON;

extension PlaceX on JSON {
  String get name => this['name'].stringValue;
  String get address => this['address'].stringValue;
}
