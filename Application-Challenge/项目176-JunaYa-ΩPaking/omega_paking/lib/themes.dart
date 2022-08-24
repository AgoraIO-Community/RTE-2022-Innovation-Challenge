
import 'package:flutter/material.dart';

import '_internal/utils/colors.dart';

enum ThemeType {
  Light,
  Dark,
}

class AppTheme {
  static ThemeType defaultTheme = ThemeType.Light;

  bool isDark;
  Color bg1;
  Color surface;
  Color bg2;
  Color accent1;
  Color accent1Dark;
  Color accent1Darker;
  Color accent2;
  Color accent3;
  Color grey;
  Color greyStrong;
  Color greyWeak;
  Color error;
  Color focus;

  Color txt;
  Color accentTxt;

  /// Default constructor
  AppTheme({
    required this.isDark,
    required this.bg1,
    required this.surface,
    required this.bg2,
    required this.accent1,
    required this.accent1Dark,
    required this.accent1Darker,
    required this.accent2,
    required this.accent3,
    required this.grey,
    required this.greyStrong,
    required this.greyWeak,
    required this.error,
    required this.focus,
    required this.txt,
    required this.accentTxt,
  });

  /// fromType factory constructor
  factory AppTheme.fromType(ThemeType t) {
    switch (t) {
      case ThemeType.Light:
        return AppTheme(
          isDark: false,
          txt: Colors.black,
          accentTxt: Colors.white,
          bg1: const Color(0xfff1f7f0),
          bg2: const Color(0xffc1dcbc),
          surface: Colors.white,
          accent1: const Color(0xff00a086),
          accent1Dark: const Color(0xff00856f),
          accent1Darker: const Color(0xff006b5a),
          accent2: const Color(0xfff09433),
          accent3: const Color(0xff5bc91a),
          greyWeak: const Color(0xff909f9c),
          grey: const Color(0xff515d5a),
          greyStrong: const Color(0xff151918),
          error: Colors.red.shade900,
          focus: const Color(0xFF0ee2b1),
        );

      case ThemeType.Dark:
        return AppTheme(
          isDark: true,
          txt: Colors.white,
          accentTxt: Colors.black,
          bg1: const Color(0xff121212),
          bg2: const Color(0xff2c2c2c),
          surface: const Color(0xff252525),
          accent1: const Color(0xff00a086),
          accent1Dark: const Color(0xff00caa5),
          accent1Darker: const Color(0xff00caa5),
          accent2: const Color(0xfff19e46),
          accent3: const Color(0xff5BC91A),
          greyWeak: const Color(0xffa8b3b0),
          grey: const Color(0xffced4d3),
          greyStrong: const Color(0xffffffff),
          error: const Color(0xffe55642),
          focus: const Color(0xff0ee2b1),
        );
    }
  }

  ThemeData get themeData {
    var t = ThemeData.from(
      textTheme: (isDark ? ThemeData.dark() : ThemeData.light()).textTheme,
      colorScheme: ColorScheme(
        brightness: isDark ? Brightness.dark : Brightness.light,
        primary: accent1,
        primaryContainer: accent1Darker,
        secondary: accent2,
        secondaryContainer: ColorUtils.shiftHsl(accent2, -.2),
        background: bg1,
        surface: surface,
        onBackground: txt,
        onSurface: txt,
        onError: txt,
        onPrimary: accentTxt,
        onSecondary: accentTxt,
        error: error),
    );
    return t.copyWith(
        // inputDecorationTheme: InputDecorationTheme(
        //   border: ThinUnderlineBorder(),
        // ),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        textSelectionTheme: TextSelectionThemeData(
            selectionColor: greyWeak,
            selectionHandleColor: Colors.transparent,
            cursorColor: accent1,
        ),
        buttonTheme: ButtonThemeData(
            buttonColor: accent1,
        ),
        highlightColor: accent1,
        toggleableActiveColor: accent1);
  }

  Color shift(Color c, double d) => ColorUtils.shiftHsl(c, d * (isDark? -1 : 1));
}
