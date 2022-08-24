import 'package:flutter_multi_formatter/flutter_multi_formatter.dart';

class AgencyFee {
  final bool has;
  // 0: 1个月 1: 半个月 2: 其他
  final int? type;

  final double? value;

  AgencyFee(this.type, [this.has = true, this.value]);

  Map toJson() {
    return {
      "has": has,
      if (type != null) "type": type,
      if (value != null) "value": value!.toInt(),
    };
  }

  AgencyFee.value(double price)
      : value = price,
        has = true,
        type = 2;

  AgencyFee.free()
      : has = false,
        type = null,
        value = null;

  @override
  String toString() {
    if (value != null && value! > 0) {
      return MoneySymbols.YEN_SIGN + value!.toStringAsFixed(0);
    }
    if (!has) {
      return "无中介费";
    }

    if (type! == 0) {
      return "1个月租金";
    }
    return "半个月租金";
  }
}
