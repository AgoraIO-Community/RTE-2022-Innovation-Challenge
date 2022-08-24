import 'package:flutter/cupertino.dart';
import 'package:super_rent/src/utils/images.dart';

class Empty extends StatelessWidget {
  final String? message;

  const Empty({this.message, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CupertinoColors.systemBackground,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        children: [
          Image.asset(
            Images.noRecords,
            width: MediaQuery.of(context).size.width * 0.5,
          ),
          const SizedBox(height: 8.0),
          Text(
            message ?? "这里空空的",
            style: const TextStyle(color: CupertinoColors.secondaryLabel),
          ),
          const SizedBox(height: 80.0),
        ],
      ),
    );
  }
}
