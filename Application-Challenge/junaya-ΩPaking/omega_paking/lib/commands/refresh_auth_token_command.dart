import 'package:flutter/src/widgets/framework.dart';
import 'package:omega_paking/_internal/utils/string.dart';
import 'package:omega_paking/commands/abstract_command.dart';
import 'package:omega_paking/services/auth.dart';
import 'package:omega_paking/services/result.dart';

class RefreshAuthTokensCommand extends AbstractCommand {
  RefreshAuthTokensCommand(BuildContext context) : super(context);

  Future<bool> execute({bool onlyIfExpired = false}) async {
    if (StringUtils.isEmpty(authModel.refreshToken)) return true;

    //Don't bother calling refresh if it's already authenticated
    if (onlyIfExpired && !authModel.isExpired) return true;

    //Query server, see if we can get a new auth token
    ServiceResult<AuthResults> result = await AuthService().refresh(authModel.refreshToken);
    //If the request succeeded, inject the model with the latest authToken and write to disk
    if (result.success) {
      authModel.accessToken = result.content?.accessToken ?? "";
      // authModel.setExpiry(result.content?.expiresIn ?? 0);
      authModel.scheduleSave();
    }
    return result.success;
  }
}
