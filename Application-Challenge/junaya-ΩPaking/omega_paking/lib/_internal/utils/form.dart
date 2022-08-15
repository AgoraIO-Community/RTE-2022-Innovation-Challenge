class FormUtils {
  static bool isValidEmail(String value) {
    return RegExp(r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
    .hasMatch(value);
  }

  static bool isValidPassword(String value) {
    return RegExp(r"(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$")
    .hasMatch(value);
  }

  static bool isPhone(String input) {
    return RegExp(r"1[0-9]\d{9}$").hasMatch(input);
  }

  static bool isValidateCaptcha(String input) {
    return RegExp(r"\d{6}$").hasMatch(input);
  }
}
