import 'dart:io';

import 'package:desktop_window/desktop_window.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:omega_paking/_internal/utils/string.dart';
import 'package:omega_paking/commands/abstract_command.dart';
import 'package:omega_paking/commands/refresh_auth_token_command.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/services/result.dart';

class BootstrapCommand extends AbstractCommand {
  BootstrapCommand(BuildContext context) : super(context);

  Future<bool> execute() async {
    /// Let the splash view sit for a bit. Mainly for aesthetics and to ensure a smooth intro animation.
    await Future.delayed(const Duration(milliseconds: 1500));
    
    /// Define default locale
    Intl.defaultLocale = 'en_US';

    /// Set minimal Window size
    DesktopWindow.setMinWindowSize(const Size(480, 600));

    /// Handle version upgrades
    if (appModel.version != AppModel.kCurrentVersion) {
      appModel.upgradeToVersion(AppModel.kCurrentVersion);
    }

    /// Load saved data into necessary models
    bool errorLoadingData = false;
    await authModel.load().catchError((e, s) {
      print("[BootstrapCommand] Error loading AuthModel: $s");
      errorLoadingData = true;
    });

    /// Reset models if there are any errors, or if the app version has been updated
    if (errorLoadingData) {
      authModel.reset();
    }

    /// ////////////////////////////////////////////////////////////////////////

    /// After we've loaded the models, kickoff an auth-token refresh, our old one is likely expired.
    bool signInError = false;
    if (authModel.hasAuthKey) {
      /// Try and refresh authKey and Contacts.
      bool authSuccess;
      if (kIsWeb) {
        // On web, perform a silentSignIn to refresh the OAuth token
        // authSuccess = await WebSignInCommand(context).execute(silentSignIn: true);
        authSuccess = true;
      } else {
        // On desktop, refresh the authToken manually
        // TODO refresh
        // authSuccess = await RefreshAuthTokensCommand(context).execute();
        authSuccess = true;
      }
      // Check auth
      signInError = !authSuccess;
    }

    return !signInError && authModel.hasAuthKey;
  }
}
