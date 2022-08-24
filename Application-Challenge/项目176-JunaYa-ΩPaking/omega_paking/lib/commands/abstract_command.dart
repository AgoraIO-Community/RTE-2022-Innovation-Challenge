import 'package:flutter/material.dart';
import 'package:omega_paking/commands/refresh_auth_token_command.dart';
import 'package:omega_paking/globals.dart';
import 'package:omega_paking/models/app_model.dart';
import 'package:omega_paking/models/auth_model.dart';
import 'package:omega_paking/services/result.dart';
import 'package:provider/provider.dart';

abstract class AbstractCommand {
  static BuildContext? _lastKnownRoot;

  /// Provide all commands access to the global context & navigator
  late BuildContext context;

  NavigatorState? get rootNav => AppGlobals.nav;

  AbstractCommand(BuildContext c) {
    /// Get root context
    /// If we're passed a context that is known to be root, skip the lookup, it will throw an error otherwise.
    context = (c == _lastKnownRoot) ? c : Provider.of(c, listen: false);
    _lastKnownRoot = context;
  }

  T getProvided<T>() => Provider.of<T>(context, listen: false);

  /// Convenience lookup methods for all commands to share
  ///
  /// Models
  AuthModel get authModel => getProvided();

  AppModel get appModel => getProvided();

}

/// //////////////////////////////////////////////////////////////////
/// MIX-INS
/// //////////////////////////////////////////////////////////////////

mixin CancelableCommandMixin on AbstractCommand {
  bool isCancelled = false;

  bool cancel() => isCancelled = true;
}

mixin AuthorizedServiceCommandMixin on AbstractCommand {
  bool ignoreErrors = false;

  /// Runs a service that refreshes Auth if needed, and checks for errors on completion
  Future<ServiceResult<T>> executeAuthServiceCmd<T>(Future<ServiceResult<T>> Function() cmd) async {
    /// Bail early if we're offline
    if (!appModel.isOnline) {
      // Dialogs.show(OkCancelDialog(
      //   title: "No Connection",
      //   message: "It appears your device is offline. Please check your connection and try again.",
      //   onOkPressed: () => rootNav?.pop(),
      // ));
    }

    /// Refresh token if needed
    await RefreshAuthTokensCommand(context).execute(onlyIfExpired: true);

    /// Execute command
    ServiceResult<T> r = await cmd();

    /// Check for errors
    if (!ignoreErrors) {
      // ShowServiceErrorCommand(context).execute(r.response);
    }

    return r;
  }
}
