class OtherFee {
  // 电费
  final double el;

  // 水费
  final double water;

  // 网费
  final double net;

  //
  final double? other;

  OtherFee(
      {required this.el, required this.water, required this.net, this.other});

  dynamic toJson() {
    return {
      "el": el.toInt(),
      "water": water.toInt(),
      "net": net.toInt(),
      if (other != null) "other": other!.toInt(),
    };
  }

  String get description {
    var str = "水电网费¥${(el + water + net).toStringAsFixed(0)}/月, ";
    final o = other ?? 0;
    if (o == 0) {
      str += "无其他费用";
    } else {
      str += "其他¥${o.toStringAsFixed(0)}/月";
    }
    return str;
  }
}
