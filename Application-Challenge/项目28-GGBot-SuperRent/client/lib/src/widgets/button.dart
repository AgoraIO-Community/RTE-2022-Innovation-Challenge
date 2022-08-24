import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

CupertinoButton buildFilledButton(
    BuildContext context, String title, VoidCallback? onPressed) {
  return CupertinoButton.filled(
    disabledColor: CupertinoTheme.of(context).primaryColor.withOpacity(0.3),
    padding: const EdgeInsets.symmetric(horizontal: 16),
    onPressed: onPressed,
    child: Text(title),
  );
}

Widget primaryButton(BuildContext context,
    {required Widget child, VoidCallback? onTap, Size? fixedSize}) {
  fixedSize ??= const Size(double.infinity, 46);
  return ElevatedButton(
    style: ElevatedButton.styleFrom(
      primary: CupertinoTheme.of(context).primaryColor,
      elevation: 0,
      fixedSize: fixedSize,
      minimumSize: fixedSize,
      maximumSize: fixedSize,
    ),
    onPressed: onTap,
    child: child,
  );
}

Widget secondaryButton(BuildContext context,
    {required Widget child, VoidCallback? onTap, Size? fixedSize}) {
  return ElevatedButton(
    onPressed: onTap,
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(6),
        side: BorderSide(color: CupertinoTheme.of(context).primaryColor),
      ),
      primary: Colors.white,
      fixedSize: fixedSize ?? const Size(double.infinity, 40),
    ),
    child: DefaultTextStyle(
      style: TextStyle(
        color: CupertinoTheme.of(context).primaryColor,
      ),
      child: child,
    ),
  );
}
