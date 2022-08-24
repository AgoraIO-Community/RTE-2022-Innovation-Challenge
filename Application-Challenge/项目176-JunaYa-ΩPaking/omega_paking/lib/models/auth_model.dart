
import 'package:omega_paking/_internal/utils/date.dart';
import 'package:omega_paking/_internal/utils/string.dart';
import 'package:omega_paking/models/abstract_model.dart';

class AuthModel extends AbstractModel {
  String? refreshToken;
  String? email;
  String? token;
  DateTime _expiry = DateTime.utc(2099);

  AuthModel() {
    // enableSerialization("auth.dat");
    enableSerialization("auth");
  }

  //Helper method to quickly lookup last known auth state, does not mean user is necessarily verified, the auth token may be expired.
  bool get hasAuthKey => !StringUtils.isEmpty(_accessToken);

  bool get isExpired => expiry.isBefore(DateTime.now());

  DateTime get expiry => _expiry;

  bool get isAuthenticated => !isExpired && hasAuthKey;

  //Using a setExpiry() method instead of a setter, because it's a bit weird to have different values (int for set vs DateTime for get).
  //Setting it with int makes more sense because the auth result returns expiry time in seconds.
  //Getting it with DateTime makes more sense because it's easier to deal with and check against.
  void setExpiry(int seconds) {
    _expiry = DateTime.now().add(Duration(seconds: seconds));
  }

  /////////////////////////////////////////////////////////////////////
  // Access Token
  String? _accessToken;

  String get accessToken => _accessToken ?? "";

  set accessToken(String value) {
    _accessToken = value;
    notifyListeners();
  }

  @override
  void reset([bool notify = true]) {
    _accessToken = null;
    refreshToken = null;
    token = null;
    email = null;
    _expiry = DateTime.utc(2099);
    super.reset(notify);
  }

  /////////////////////////////////////////////////////////////////////
  // Define serialization methods

  @override
  void copyFromJson(Map<String, dynamic> json) {
    this
      .._accessToken = json["_accessToken"]
      ..refreshToken = json["refreshToken"]
      ..token = json["token"]
      ..email = json["email"]
      .._expiry = json["_expiry"] != null ? DateTime.parse(json["_expiry"]) : Dates.epoch;
  }

  @override
  Map<String, dynamic> toJson() => {
    "_accessToken": _accessToken,
    "refreshToken": refreshToken,
    "token": token,
    "email": email,
    "_expiry": _expiry.toString()
  };
}
