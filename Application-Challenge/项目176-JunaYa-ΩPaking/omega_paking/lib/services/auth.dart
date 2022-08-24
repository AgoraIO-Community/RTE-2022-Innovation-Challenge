import 'dart:convert';

import 'package:omega_paking/_internal/http_client.dart';
import 'package:omega_paking/_internal/utils/rest.dart';
import 'package:omega_paking/_internal/utils/string.dart';
import 'package:omega_paking/services/result.dart';

class AuthService {
  final String REGISTER_URL = 'http://localhost:3000/register';
  final String LOGIN_URL = "http://localhost:3000/login";

  AuthService();

  Future<ServiceResult<AuthResults>> refresh(String? refreshToken) async =>
    await refresh_token(refreshToken);

  Future<ServiceResult<AuthResults>> register(String name, String email , String password ) async {
    Map<String, String> params = {};
    params.putIfAbsent("name", () => name);
    params.putIfAbsent("email", () => email);
    params.putIfAbsent("password", () => password);
    print('parms $params');
    HttpResponse response = await HttpClient.post(
      REGISTER_URL,
      headers: {
        "Content-Type": "application/json"
        // "Authorization": "Bearer $accessToken"
      },
      body: jsonEncode(params));
    print("Response: ${response.statusCode} ${response.success} / ${response.body}");
    AuthResults? results;
    if (response.success) {
      Map<String, dynamic> userAccess = jsonDecode(response.body);
      results = AuthResults(
        accessToken: userAccess["access_token"],
        tokenType: userAccess["token_type"],
      );
    }
    
    return ServiceResult(results, response);
  }

  Future<ServiceResult<AuthResults>> login(String email, String password) async {
    Map<String, String> params = {};
    params.putIfAbsent("email", () => email);
    params.putIfAbsent("password", () => password);

    HttpResponse response = await HttpClient.post(
      "$LOGIN_URL",
      headers: {
        "Content-Type": "application/json"
      },
      body: jsonEncode(params),
    );
    print("Response: ${response.statusCode} / ${response.body}");
    AuthResults? results;
    if (response.success) {
      Map<String, dynamic> userAccess = jsonDecode(response.body);
      results = AuthResults(
        accessToken: userAccess["access_token"],
        tokenType: userAccess["token_type"],
      );
    }
    return ServiceResult(results, response);
  }

  Future<ServiceResult<AuthResults>> refresh_token(String? token) async {
    Map<String, String> params = {};

    HttpResponse response = await HttpClient.post("$LOGIN_URL?${RESTUtils.encodeParams(params)}");
    print("Response: ${response.statusCode} / ${response.body}");
    AuthResults? results;
    if (response.success) {
      Map<String, dynamic> userAccess = jsonDecode(response.body);
      results = AuthResults(
        accessToken: userAccess["access_token"],
        tokenType: userAccess["token_type"],
      );
    }
    return ServiceResult(results, response);
  }
}

class AuthResults {
  final String accessToken;
  // final int expiresIn;
  // final String? refreshToken;
  final String tokenType;
  // final String idToken;
  late Map<String, dynamic> profile;

  String get email => _email;
  late String _email;

  AuthResults(
      {required this.accessToken,
      // required this.expiresIn,
      // required this.refreshToken,
      required this.tokenType,
      // required this.idToken,
      }) {
    // profile = jsonDecode(getProfileFromToken(idToken));
    // _email = profile["email"];
  }

  String getProfileFromToken(String idToken) {
    List<String> parts = idToken.split(".");
    var decoder = Base64Codec();
    String payload = decoder.normalize(parts[1]);
    return utf8.decode(decoder.decode(payload));
  }
}
