import 'package:flutter_multi_formatter/flutter_multi_formatter.dart';

class ServiceFee {
  final bool has;
  // 0: 1个月 1: 半个月 2: 其他
  final int? type;

  // 0: 按年 1: 按月 2:一次性
  final int? payType;
  final double? value;

  ServiceFee({this.has = true, this.type, this.payType, this.value});

  dynamic toJson() {
    return {
      'has': has,
      if (type != null) 'type': type,
      if (payType != null) 'payType': payType,
      if (value != null) 'value': value!.toInt(),
    };
  }

  String get description {
    if (!has) return "无服务费";

    if (type == 0) return "1个月租金";
    if (type == 1) return "半个月租金";

    var valueStr = MoneySymbols.YEN_SIGN + (value ?? 0).toStringAsFixed(0);

    if (payType == 0) {
      valueStr += "/年";
    } else if (payType == 1) {
      valueStr += "/月";
    } else if (payType == 2) {
      valueStr += "/一次性";
    }

    return valueStr;
  }
}
