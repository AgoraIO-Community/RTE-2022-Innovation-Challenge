import 'package:leancloud_storage/leancloud.dart';

class RentError extends Error {
  final int code;
  final String readableMessage;

  RentError(this.code, this.readableMessage);

  RentError.known([this.readableMessage = "未知错误"]) : code = -1;

  @override
  String toString() {
    return readableMessage;
  }

  static RentError lc(dynamic err) {
    if (err is LCException) {
      return RentError(err.code, err.message ?? "服务器未知错误请稍后再试[${err.code}]");
    }
    if (err is ArgumentError) {
      return RentError(-1, err.message);
    }

    return RentError.known(err.toString());
  }
}
