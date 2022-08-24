enum RentType {
  shared(0),
  whole(1);

  const RentType(this.value);

  final int value;
}

extension RentTypeX on RentType {
  String get name => this == RentType.shared ? "合租" : "整租";
}
