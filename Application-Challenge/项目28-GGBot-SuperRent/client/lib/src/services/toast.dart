import 'dart:collection';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

ToastController showToast(
  Widget content, {
  Widget? left,
  Duration? duration,
}) {
  final key = GlobalKey<__ToastViewState>();

  final controller = ToastController(
    key,
    builder: (context) => _ToastView(
      content,
      left: left,
      dismissible: duration != null,
      key: key,
    ),
    duration: duration,
  );
  Get.find<ToastService>()._enqueue(controller);
  return controller;
}

ToastController toast({String? succeed, String? warning, String? error}) {
  assert(succeed != null || warning != null || error != null);
  final text = succeed ?? warning ?? error ?? '';
  return showToast(Builder(
    builder: (context) {
      return Text(
        text,
        style: CupertinoTheme.of(context).textTheme.textStyle,
      );
    },
  ),
      left: succeed != null
          ? null
          : Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: Text(
                '!',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: warning != null
                      ? Colors.yellow.shade800
                      : Colors.red.shade800,
                ),
              ),
            ),
      duration: Duration(seconds: 1, milliseconds: text.length * 150));
}

ToastController loading({Duration? duration}) {
  return showToast(
    const CupertinoActivityIndicator(
      animating: true,
    ),
    duration: duration,
  );
}

Future<void>? dismissShowingToast() {
  return Get.find<ToastService>().showingController?.dismiss();
}

extension ToastBuildContext on BuildContext {
  void tip(String text) => toast(succeed: text);
  void warning(String text) => toast(warning: text);
  void err(String text) => toast(error: text);

  bool get isBusying => Get.find<ToastService>().hasShowing;
}

class ToastService extends GetxService {
  final _controllers = Queue<ToastController>();

  ToastController? get showingController => _showingController;
  ToastController? _showingController;

  bool get hasShowing => _showingController != null;

  void _enqueue(ToastController controller) {
    // next controller will show if needed
    controller.onDismiss = _dequeue;

    _controllers.addLast(controller);
    if (_showingController == null) _dequeue();
  }

  void _dequeue() {
    _showingController = null;
    if (_controllers.isEmpty) return;

    _showingController = _controllers.removeFirst();
    _showingController?._show();
  }
}

class ToastController {
  final WidgetBuilder builder;

  VoidCallback? onDismiss;

  late final OverlayEntry _entry;
  final GlobalKey<__ToastViewState> _key;
  final Duration? duration;

  ToastController(this._key, {required this.builder, this.duration});

  void _show() {
    _entry = OverlayEntry(builder: builder);
    assert(Get.overlayContext != null);
    final overlayState = Overlay.of(Get.overlayContext!);
    assert(overlayState != null);

    overlayState!.insert(_entry);

    Future.delayed(duration ?? const Duration(seconds: 10)).then((value) {
      dismiss();
    });
  }

  Future<void> dismiss() {
    if (_key.currentState == null) {
      return Future.delayed(const Duration(milliseconds: 300)).then((_) {
        if (_key.currentState != null) {
          return dismiss();
        } else {
          assert(_key.currentState != null);
          debugPrint("[TOAST] ERROR");
        }
      });
    }
    return _key.currentState?.dismiss().whenComplete(() {
          Future.microtask(_entry.remove).whenComplete(() => onDismiss?.call());
        }) ??
        Future.value();
  }
}

class _ToastView extends StatefulWidget {
  final Widget? left;
  final Widget content;
  final bool dismissible;

  const _ToastView(this.content, {this.left, this.dismissible = true, Key? key})
      : super(key: key);

  @override
  __ToastViewState createState() => __ToastViewState();
}

class __ToastViewState extends State<_ToastView>
    with SingleTickerProviderStateMixin {
  late Animation<double> animation;
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 180),
        reverseDuration: const Duration(milliseconds: 180));
    animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
      reverseCurve: Curves.easeOut,
    );

    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      _controller.forward();
    });
  }

  TickerFuture dismiss() {
    return _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(
            top: 16,
            child: SlideTransition(
              position: Tween(begin: const Offset(0, -1), end: Offset.zero)
                  .animate(animation),
              child: Container(
                height: 48,
                padding: const EdgeInsets.only(left: 24, right: 24),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: CupertinoColors.systemBackground,
                  boxShadow: [
                    BoxShadow(
                      offset: Offset.zero,
                      blurRadius: 15,
                      color: context.isDarkMode
                          ? Colors.grey.shade900
                          : Colors.grey.shade300,
                    ),
                  ],
                  borderRadius: const BorderRadius.all(
                    Radius.circular(30),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.left != null) widget.left!,
                    widget.content,
                  ],
                ),
              ),
            ),
          ),
          if (!widget.dismissible)
            Positioned.fill(
              child: Container(
                color: Colors.transparent,
              ),
            )
        ],
      ),
    );
  }
}
