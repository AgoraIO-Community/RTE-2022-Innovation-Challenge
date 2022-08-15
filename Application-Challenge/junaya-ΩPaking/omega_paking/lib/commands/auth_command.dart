import 'package:flutter/src/widgets/framework.dart';
import 'package:omega_paking/_internal/utils/string.dart';
import 'package:omega_paking/commands/abstract_command.dart';
import 'package:omega_paking/services/auth.dart';
import 'package:omega_paking/services/result.dart';

class AuthTokensCommand extends AbstractCommand {
  AuthTokensCommand(BuildContext context) : super(context);

  Future<bool> register(String nickname, String email, String password) async {
    // if (StringUtils.isEmpty(authModel.refreshToken)) return true;

    //Query server, see if we can get a new auth token
    ServiceResult<AuthResults> result = await AuthService().register(nickname, email, password);
    //If the request succeeded, inject the model with the latest authToken and write to disk
    if (result.success) {
      authModel.accessToken = result.content?.accessToken ?? "";
      // authModel.setExpiry(result.content?.expiresIn ?? 0);
      authModel.scheduleSave();
    }
    return result.success;
  }

  Future<bool> login(String email, String password) async {
    // if (StringUtils.isEmpty(authModel.refreshToken)) return true;

    //Query server, see if we can get a new auth token
    ServiceResult<AuthResults> result = await AuthService().login(email, password);
    //If the request succeeded, inject the model with the latest authToken and write to disk
    if (result.success) {
      authModel.accessToken = result.content?.accessToken ?? "";
      // authModel.setExpiry(result.content?.expiresIn ?? 0);
      authModel.scheduleSave();
    }
    return result.success;
  }
}
