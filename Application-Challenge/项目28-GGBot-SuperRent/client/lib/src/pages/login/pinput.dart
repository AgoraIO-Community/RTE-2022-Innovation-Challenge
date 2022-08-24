import 'package:flutter/cupertino.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:pinput/pinput.dart';

import '../../controllers/login.dart';
import '../../widgets/button.dart';

class PinputPage extends GetView<LoginController> {
  const PinputPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 50,
      height: 50,
      textStyle: const TextStyle(
          fontSize: 28,
          color: CupertinoColors.label,
          fontWeight: FontWeight.w600),
      decoration: BoxDecoration(
        border: Border.all(color: CupertinoColors.secondarySystemFill),
        borderRadius: BorderRadius.circular(8),
      ),
    );

    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        backgroundColor: CupertinoColors.systemBackground,
        border: null,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 50),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "输入验证码",
                style: TextStyle(
                  color: CupertinoColors.label,
                  fontSize: 36.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              RichText(
                text: TextSpan(
                  children: [
                    const TextSpan(
                      text: "已发送 6 位验证码至 ",
                      style: TextStyle(color: CupertinoColors.label),
                    ),
                    TextSpan(
                      text: controller.mobilePhone,
                      style: const TextStyle(
                          color: CupertinoColors.secondaryLabel),
                    ),
                  ],
                ),
              ),
              // Text("已发送 6 位验证码至 ${controller.phoneNumber}"),
              const SizedBox(height: 80),
              Pinput(
                defaultPinTheme: defaultPinTheme,
                length: 6,
                autofocus: true,
                onChanged: controller.onPinChange,
              ),
              const SizedBox(height: 30),
              SizedBox(
                height: 50,
                child: SizedBox.expand(
                  child: Obx(
                    () => buildFilledButton(
                      context,
                      "确认",
                      controller.isPinValid ? controller.mobileLogin : null,
                    ),
                  ),
                ),
              ),
              SizedBox(
                height: 50,
                child: Center(
                  child: Obx(
                    () => CupertinoButton(
                      padding: EdgeInsets.zero,
                      onPressed: controller.seconds.value == 0
                          ? controller.resend
                          : null,
                      child: Text(
                          "${controller.seconds.value > 0 ? "${controller.seconds.value}s后" : ""}重新获取"),
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
