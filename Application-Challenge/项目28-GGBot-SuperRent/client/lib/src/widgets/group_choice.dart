import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:super_rent/src/utils/widget.dart';

class GroupChoiceChip extends StatefulWidget {
  final int childCount;
  final NamedFn<int> titleFn;
  final ValueChanged<int?> onChange;
  final int? value;
  final double maxWidth;

  const GroupChoiceChip(
      {Key? key,
      required this.childCount,
      required this.titleFn,
      required this.onChange,
      this.maxWidth = 80,
      this.value})
      : super(key: key);

  @override
  State<GroupChoiceChip> createState() => _GroupChoiceChipState();
}

class _GroupChoiceChipState extends State<GroupChoiceChip> {
  int? _value;

  @override
  void initState() {
    super.initState();
    _value = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = CupertinoTheme.of(context).primaryColor;
    final children = List.generate(
      widget.childCount,
      (index) => ChoiceChip(
        backgroundColor: CupertinoColors.systemGroupedBackground,
        selectedColor: primaryColor.withOpacity(0.2),
        shape: _value == index
            ? StadiumBorder(
                side: BorderSide(color: primaryColor, width: 1.0),
              )
            : null,
        label: SizedBox(
          height: 36.0,
          width: widget.maxWidth,
          child: Center(
            child: Text(
              widget.titleFn(index),
              style: TextStyle(
                fontSize: 16.0,
                color: _value == index ? primaryColor : CupertinoColors.label,
              ),
            ),
          ),
        ),
        selected: _value == index,
        onSelected: (v) => setState(() {
          if (v) {
            _value = index;
            widget.onChange(_value);
          }
        }),
      ),
    );
    return Wrap(
      direction: Axis.horizontal,
      alignment: WrapAlignment.start,
      crossAxisAlignment: WrapCrossAlignment.start,
      spacing: 10,
      runSpacing: 10,
      children: children,
    );
  }
}
