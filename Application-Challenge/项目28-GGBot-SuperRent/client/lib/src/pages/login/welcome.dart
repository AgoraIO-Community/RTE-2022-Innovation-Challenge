import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_multi_formatter/flutter_multi_formatter.dart';
import 'package:get/get.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:super_rent/src/pages/login/privacy.dart';
import 'package:super_rent/src/services/toast.dart';
import 'package:super_rent/src/utils/images.dart';

import '../../controllers/login.dart';
import '../../widgets/button.dart';
import 'pinput.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({Key? key}) : super(key: key);

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage>
    with SingleTickerProviderStateMixin {
  final _privacyAccepted = false.obs;

  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  );

  late Animation<double> _animation;
  OverlayEntry? _entry;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    final curved =
        CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack);
    _animation = Tween(begin: 1.0, end: 1.5).animate(curved);
    _controller.addListener(() {
      if (_controller.status == AnimationStatus.completed) {
        _controller.reverse();
      }
    });
  }

  void showPrivacy() {
    Get.to(
      () => const Privacy(),
      transition: Transition.downToUp,
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return CupertinoPageScaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: CupertinoColors.systemBackground,
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: Container(
                alignment: Alignment.center,
                child: Image.asset(Images.background, fit: BoxFit.fitHeight),
              ),
            ),
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Hero(
                      tag: "logo_image",
                      child: Image.asset(
                        Images.logo,
                        width: 25,
                        fit: BoxFit.fitWidth,
                        color: CupertinoTheme.of(context).primaryColor,
                      ),
                    ),
                    const Hero(
                      tag: "logo_text",
                      child: Text(
                        " 随心租",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 50),
                RichText(
                  text: TextSpan(
                    children: [
                      WidgetSpan(
                        alignment: PlaceholderAlignment.middle,
                        child: GestureDetector(
                          child: Obx(
                            () => ScaleTransition(
                              scale: _animation,
                              child: Icon(
                                _privacyAccepted.value
                                    ? Icons.radio_button_on
                                    : Icons.radio_button_off,
                                size: 24,
                              ),
                            ),
                          ),
                          onTap: () {
                            _privacyAccepted.toggle();
                          },
                        ),
                      ),
                      const TextSpan(
                        text: " 我已阅读并同意 随心租",
                      ),
                      TextSpan(
                        text: " 用户协议",
                        style: const TextStyle(
                          decoration: TextDecoration.underline,
                        ),
                        recognizer: TapGestureRecognizer()..onTap = showPrivacy,
                      ),
                      const TextSpan(
                        text: " 和 ",
                      ),
                      TextSpan(
                        text: "隐私协议",
                        style: const TextStyle(
                          decoration: TextDecoration.underline,
                        ),
                        recognizer: TapGestureRecognizer()..onTap = showPrivacy,
                      ),
                    ],
                    style: const TextStyle(
                      fontSize: 14.0,
                      color: CupertinoColors.label,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: size.width * 0.8,
                  height: 50,
                  child: CupertinoButton.filled(
                    padding: EdgeInsets.zero,
                    child: const Text("继续"),
                    onPressed: () {
                      if (_privacyAccepted.isFalse) {
                        _controller.forward();
                      } else {
                        showCupertinoModalBottomSheet(
                          context: context,
                          builder: (context) {
                            return SafeArea(
                              minimum: const EdgeInsets.symmetric(vertical: 16),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  SizedBox(
                                    width: size.width * 0.8,
                                    height: 44,
                                    child: SignInWithAppleButton(
                                      text: "AppleID 登录",
                                      iconAlignment: IconAlignment.left,
                                      style: SignInWithAppleButtonStyle
                                          .whiteOutlined,
                                      onPressed: () {},
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  _buildSignChannelButton(
                                      context,
                                      Image.asset(
                                        Images.wechat,
                                        fit: BoxFit.cover,
                                      ),
                                      "微信登录", () {
                                    toast(warning: "内测版本暂不支持微信的登录");
                                  }),
                                  const SizedBox(height: 16),
                                  // _buildSignChannelButton(context,
                                  //     CapsuleIcons.wechat, "微信登录", () {}),
                                  // const SizedBox(height: 16),
                                  _buildSignChannelButton(
                                      context,
                                      Image.asset(
                                        Images.phone,
                                        fit: BoxFit.cover,
                                      ),
                                      "手机号登录", () {
                                    Navigator.of(context).pop(0);
                                  }),

                                  const SizedBox(height: 16),
                                  const Text(
                                    "或者",
                                    style: TextStyle(
                                        color: CupertinoColors.inactiveGray),
                                  ),
                                  const SizedBox(height: 16),
                                  _buildSignChannelButton(
                                    context,
                                    Icon(
                                      Icons.person,
                                      color: CupertinoTheme.of(context)
                                          .primaryColor,
                                    ),
                                    "演示快捷登录",
                                    Get.find<LoginController>()
                                        .anonymouslyLogin,
                                  ),
                                ],
                              ),
                            );
                          },
                        ).then((value) {
                          if (value == 0) {
                            _showPhoneNumberTextField(context);
                          }
                        });
                      }
                    },
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignChannelButton(
      BuildContext context, Widget icon, String text, VoidCallback onPressed) {
    final size = MediaQuery.of(context).size;
    const borderRadius = BorderRadius.all(Radius.circular(8.0));

    const height = 44.0;
    const fontSize = height * 0.43;
    const appleIconSizeScale = 22 / 44;
    const contrastColor = CupertinoColors.black;

    final textWidget = Text(
      text,
      textAlign: TextAlign.center,
      style: const TextStyle(
        inherit: false,
        fontSize: fontSize,
        color: contrastColor,
        // defaults styles aligned with https://github.com/flutter/flutter/blob/master/packages/flutter/lib/src/cupertino/text_theme.dart#L16
        fontFamily: '.SF Pro Text',
        letterSpacing: -0.41,
      ),
    );

    final channelIcon = Container(
      width: appleIconSizeScale * height,
      height: appleIconSizeScale * height + 2,
      padding: const EdgeInsets.only(
        // Properly aligns the Apple icon with the text of the button
        bottom: (4 / 44) * height,
      ),
      child: Center(
        child: SizedBox(
          width: fontSize * (25 / 31),
          height: fontSize,
          child: icon,
        ),
      ),
    );

    return SizedBox(
      height: 50,
      width: size.width * 0.8,
      child: CupertinoButton(
        borderRadius: borderRadius,
        padding: EdgeInsets.zero,
        color: CupertinoColors.white,
        onPressed: onPressed,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(width: 1, color: CupertinoColors.black),
            borderRadius: borderRadius,
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: 16.0,
          ),
          height: 50,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              channelIcon,
              Expanded(
                child: textWidget,
              ),
              const SizedBox(
                width: appleIconSizeScale * height,
              )
            ],
          ),
        ),
      ),
    );
  }

  void _showPhoneNumberTextField(BuildContext ctx) {
    _entry = OverlayEntry(
        builder: (context) => GestureDetector(
              child: InputPhoneNumberOverlay((phone) {
                _entry?.remove();
                Get.find<LoginController>().sendSmsCode(phone);
                Get.to(() => const PinputPage());
              }),
              onTap: () {
                _entry?.remove();
              },
            ));
    Overlay.of(ctx)?.insert(_entry!);
  }
}

class InputPhoneNumberOverlay extends StatefulWidget {
  final ValueChanged<String> callBack;

  const InputPhoneNumberOverlay(this.callBack, {Key? key}) : super(key: key);

  @override
  State<InputPhoneNumberOverlay> createState() =>
      _InputPhoneNumberOverlayState();
}

class _InputPhoneNumberOverlayState extends State<InputPhoneNumberOverlay> {
  final FocusNode _phoneNumberNode = FocusNode();
  final _isPhoneValid = true.obs;

  final _controller =
      TextEditingController(text: Get.find<LoginController>().mobilePhone);

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 180)).then((value) {
      FocusScope.of(context).requestFocus(_phoneNumberNode);
    });
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: Colors.transparent,
      child: Column(
        children: [
          const Spacer(),
          SizedBox(
            height: 60,
            child: CupertinoTextField(
              inputFormatters: [
                MaskedInputFormatter("### 0000 ###############"),
              ],
              controller: _controller,
              focusNode: _phoneNumberNode,
              autofocus: true,
              placeholder: "请输入手机号码",
              decoration: const BoxDecoration(color: CupertinoColors.white),
              keyboardType: TextInputType.phone,
              keyboardAppearance: Brightness.dark,
              suffix: Padding(
                padding: const EdgeInsets.only(right: 10),
                child: Obx(
                  () => buildFilledButton(
                      context,
                      "获取短信验证码",
                      _isPhoneValid.isTrue
                          ? () {
                              widget.callBack(_controller.text);
                            }
                          : null),
                ),
              ),
              prefix: const SizedBox(width: 20),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w500,
              ),
              placeholderStyle: const TextStyle(
                fontSize: 20,
                color: CupertinoColors.placeholderText,
              ),
              showCursor: false,
              clearButtonMode: OverlayVisibilityMode.always,
              onChanged: (text) {
                if (_isPhoneValid.value != isPhoneValid(text)) {
                  _isPhoneValid.toggle();
                }
              },
            ),
          )
        ],
      ),
    );
  }
}
