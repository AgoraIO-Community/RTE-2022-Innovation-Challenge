import 'package:g_json/g_json.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/rent_type.dart';
import 'package:super_rent/src/utils/baidu_ak.dart';

typedef House = LCObject;

extension LCUserLive on LCUser {
  bool get isMale => this['gender'] == 1;
  int get uid => this['emUid'];
  LCUser get creator => this['creator'];
}

extension HouseLive on House {
  String get channel => objectId!;
  String get chatRoomId => this['chatRoomID'];
}

extension HouseX on House {
  // 宠物
  static final pets = ["不可养宠", '可养猫', '可养狗', '宠物可议'];
  // 做饭
  static final cooks = ['可做饭', '不可做饭'];
  // 电梯
  static final elevators = ['有电梯', '无电梯'];
  // 租客性别
  static final tenantGenders = ['男女不限', '仅限男', '仅限女'];
  // 独卫
  static final individualBathrooms = ['独卫', '非独卫'];

  List<String> get tags {
    final j = JSON(this);
    final tags = <String>[];

    //
    if (!j[['agencyFee', 'has']].booleanValue) {
      tags.add('无中介费');
    }

    if (!j[['serviceFee', 'has']].booleanValue) {
      tags.add('无服务费');
    }

    tags.add(pets[j['pet'].integerValue]);
    tags.add(cooks[j['cook'].integerValue]);
    tags.add(elevators[j['elevator'].integerValue]);
    tags.add(individualBathrooms[j['individualBathrooms'].integerValue]);

    return tags;
  }

  double get monthlyRent => this['monthlyRent'];

  LCObject get compound => this['compound'];

  LCUser get creator => this['creator'];

  String get compoundAddress {
    String name = compound['name'];
    String tag = compound['tag'];

    return "${name.replaceAll("小区", "")}($tag)";
  }

  String get subAddress => "${compound['province']} · ${compound['district']}";

  static final NUMBERS = <int, String>{
    1: "一",
    2: "两",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
    10: "十"
  };

  String get type {
    var type = "";
    int bedroom = this['bedroom'];
    type = "${NUMBERS[bedroom] ?? "多"}室";

    int livingRoomCount = this['livingRoom'];
    type += " · ${NUMBERS[livingRoomCount] ?? "多"}厅";

    return type;
  }

  String get bathRoom => "${NUMBERS[this['bathRoom']] ?? "多"}卫";
  String get bedroom => "${NUMBERS[this['bedroom']] ?? "多"}室";

  num get area => num.tryParse(this['area']) ?? 0.0;

  String get locationPath {
    var base =
        "https://api.map.baidu.com/staticimage/v2?ak=${BaiduAk.value}&mcode=top.rainbowbridge.app.rent.superRent";

    base += "&width=1024&height=1024&zoom=18&dpiType=ph&scale=1";
    final l = compound['location'];
    base += "&center=${l['longitude']},${l['latitude']}";
    base += "&markers=$compoundAddress|${l['longitude']},${l['latitude']}";
    return base;
  }

  // 截图与录屏
  List<JSON> get medias => JSON(this['medias'])
      .listValue
      .where((element) => !element['ignore'].booleanValue)
      .toList(growable: false);

  String get rentType => RentType.values[this['rentType']].name;
}
