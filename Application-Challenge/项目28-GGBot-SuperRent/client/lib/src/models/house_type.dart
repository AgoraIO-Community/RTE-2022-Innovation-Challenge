enum HouseType {
  shared1,
  whole1,
  whole2,
  whole3,
  sharedOther,
  wholeOther,
}

extension HouseTypeX on HouseType {
  String get name {
    switch (this) {
      case HouseType.shared1:
        return "合租一室";
      case HouseType.whole1:
        return "整租一室";
      case HouseType.whole2:
        return "整租二室";
      case HouseType.whole3:
        return "整租三室";
      case HouseType.sharedOther:
        return "合租其他";
      case HouseType.wholeOther:
        return "整租其他";
    }
  }
}
