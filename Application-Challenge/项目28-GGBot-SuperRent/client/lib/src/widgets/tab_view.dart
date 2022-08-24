import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

typedef IndexedTitleProvider = String Function(int);

enum FaradayTabBarTitleAlignment { center, spaceBetween }

class FaradayTabBarView extends StatefulWidget {
  final int? initialIndex;
  final TabController? controller;

  final IndexedWidgetBuilder itemBuilder;
  final IndexedTitleProvider titleBuilder;
  final double? titleFontSize;
  final Color? headerBackgroundColor;
  final int itemCount;
  final bool showIndicator;

  final Widget? leading;
  final Widget? trailing;
  final ValueChanged<int>? onPageChanged;
  final FaradayTabBarTitleAlignment itemTitleAlignment;

  const FaradayTabBarView(
      {Key? key,
      required this.itemBuilder,
      required this.itemCount,
      required this.titleBuilder,
      this.initialIndex,
      this.leading,
      this.trailing,
      this.showIndicator = true,
      this.controller,
      this.itemTitleAlignment = FaradayTabBarTitleAlignment.spaceBetween,
      this.headerBackgroundColor, // default context.white
      this.onPageChanged,
      this.titleFontSize})
      : super(key: key);

  @override
  // ignore: library_private_types_in_public_api
  _FaradayTabBarViewState createState() => _FaradayTabBarViewState();
}

class _FaradayTabBarViewState extends State<FaradayTabBarView>
    with SingleTickerProviderStateMixin {
  late TabController _controller;
  late int _selectedPage;

  @override
  void initState() {
    super.initState();

    _selectedPage = widget.controller?.index ?? widget.initialIndex ?? 0;
    _controller = widget.controller ??
        TabController(
            initialIndex: _selectedPage, length: widget.itemCount, vsync: this);

    _controller.addListener(tabChanged);
  }

  void tabChanged() {
    widget.onPageChanged?.call(_controller.index);
  }

  @override
  void dispose() {
    _controller.removeListener(tabChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          color: widget.headerBackgroundColor ?? CupertinoColors.white,
          child: Row(
            children: [
              if (widget.leading != null) widget.leading!,
              Expanded(
                child: FaradayTabBarIndicator(
                  position: _controller.animation!,
                  titles: List.generate(
                    widget.itemCount,
                    (index) => widget.titleBuilder(index),
                  ),
                  fontSize: widget.titleFontSize,
                  alignment: widget.itemTitleAlignment,
                  index: _selectedPage,
                  showIndicator: widget.showIndicator,
                  onChange: (value) {
                    _controller.animateTo(value);
                    setState(() {
                      _selectedPage = value;
                    });
                  },
                ),
              ),
              if (widget.trailing != null) widget.trailing!
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _controller,
            physics: const PageScrollPhysics(),
            children: List.generate(
              widget.itemCount,
              (index) => widget.itemBuilder(context, index),
            ),
          ),
        )
      ],
    );
  }
}

class FaradayTabBarIndicator extends StatefulWidget {
  final Animation<double> position;
  final FaradayTabBarTitleAlignment alignment;
  final List<String> titles;
  final int index;
  final bool showIndicator;
  final ValueChanged<int> onChange;
  final double? fontSize;

  const FaradayTabBarIndicator({
    Key? key,
    required this.position,
    required this.alignment,
    required this.titles,
    required this.index,
    required this.onChange,
    this.showIndicator = false,
    this.fontSize,
  }) : super(key: key);

  @override
  _FaradayTabBarIndicatorState createState() => _FaradayTabBarIndicatorState();
}

class _FaradayTabBarIndicatorState extends State<FaradayTabBarIndicator> {
  int distance = 1;

  @override
  void initState() {
    super.initState();
    widget.position.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          distance = 1; // 还原gap 防止下一次动画出错
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      width: double.infinity,
      child: AnimatedBuilder(
        animation: widget.position,
        builder: (context, _) {
          final painter = _FaradayTabBarIndicatorPainter(
            position: widget.position.value,
            titles: widget.titles,
            alignment: widget.alignment,
            distance: distance,
            currentIndex: widget.index,
            textColor: CupertinoColors.label,
            selectedTextColor: CupertinoTheme.of(context).primaryColor,
            fontSize: 16,
            indicator: CupertinoTheme.of(context).primaryColor,
          );
          return Listener(
            child: CustomPaint(painter: painter),
            onPointerUp: (event) {
              final index = painter.titleRects.indexWhere(
                  (element) => element.contains(event.localPosition));
              if (index != -1) {
                distance = (index - widget.index).abs();
                widget.onChange(index);
              }
            },
          );
        },
      ),
    );
  }
}

// 线高度
const kLineHeight = 4.0;

class _FaradayTabBarIndicatorPainter extends CustomPainter {
  final double position;
  final FaradayTabBarTitleAlignment alignment;
  final List<String> titles;
  final Color? indicator;
  final int distance;
  final int currentIndex;
  final Color textColor;
  final Color selectedTextColor;
  final double? fontSize;

  _FaradayTabBarIndicatorPainter({
    required this.position,
    required this.alignment,
    required this.titles,
    required this.distance,
    required this.currentIndex,
    required this.textColor,
    required this.selectedTextColor,
    required this.fontSize,
    this.indicator,
  });

  final titleRects = <Rect>[];

  @override
  void paint(Canvas canvas, Size size) {
    final midDelta = 0.5 * (distance == 0 ? 1 : distance);
    final index = distance > 1 ? currentIndex : position.truncate();
    final delta = index - position;

    final targetIndex = delta.abs() >= midDelta
        ? (delta > 0 ? index - distance : index + distance)
        : index;

    canvas.save();

    final painters = <TextPainter>[];
    for (var i = 0; i < titles.length; i++) {
      final color = i == targetIndex ? selectedTextColor : textColor;
      painters.add(
        TextPainter(
            text: TextSpan(
              text: titles[i],
              style: alignment == FaradayTabBarTitleAlignment.center
                  ? TextStyle(color: color, fontSize: fontSize! + 2)
                  : TextStyle(
                      color: color,
                      fontSize: fontSize,
                      fontWeight: FontWeight.bold),
            ),
            textDirection: TextDirection.ltr)
          ..layout(maxWidth: size.width),
      );
    }

    // 5.0 为标题间距
    final kPadding =
        alignment == FaradayTabBarTitleAlignment.center ? 10.0 : 0.0;

    final totalWidth = painters.fold<double>(0, (r, t) => r + t.width) +
        (titles.length - 1) * kPadding;

    // 计算每一个标题距离左边的距离
    double leftPadding(int index) {
      if (alignment == FaradayTabBarTitleAlignment.center) {
        if (index == 0) return (size.width - totalWidth) / 2.0;
        final pIndex = index - 1;
        return leftPadding(pIndex) + painters[pIndex].width + kPadding;
      }
      final width = size.width / titles.length;
      return width * index + (width - painters[index].width) / 2.0;
    }

    titleRects.clear();
    for (var i = 0; i < titles.length; i++) {
      final painter = painters[i];

      final offset =
          Offset(leftPadding(i), (size.height - painter.height) / 2.0);
      painter.paint(canvas, offset);
      if (alignment == FaradayTabBarTitleAlignment.center) {
        titleRects.add(Rect.fromLTWH(offset.dx, 0, painter.width, size.height));
      } else {
        final width = size.width / titles.length;
        titleRects.add(Rect.fromLTWH(width * i, 0, width, size.height));
      }
    }

    /**
     * 以下代码请参考 UI 界面一起阅读，
     * 否则你可能完全看不懂
     */
    if (indicator != null) {
      // 画最底下的线
      final dy = size.height - kLineHeight;

      var begin = leftPadding(index);
      var end = begin + painters[index].width;

      // 向左
      if (delta >= midDelta) {
        if (alignment == FaradayTabBarTitleAlignment.center) {
          end = end -
              (kPadding + painters[index].width) * (delta / midDelta - 1.0);
        } else {
          end = end -
              (end -
                      leftPadding(index - distance) -
                      painters[index - distance].width) *
                  (delta / midDelta - 1.0);
        }

        begin = leftPadding(index - distance);
      } else if (delta < midDelta && delta > 0) {
        begin = begin -
            (begin - leftPadding(index - distance)) * (delta / midDelta);
      }
      // 向右
      else if (delta < 0 && delta >= -midDelta) {
        if (alignment == FaradayTabBarTitleAlignment.center) {
          end = end +
              (painters[index + distance].width + kPadding) *
                  (-delta / midDelta);
        } else {
          end = end +
              (leftPadding(index + distance) -
                      end +
                      painters[index + distance].width) *
                  (-delta / midDelta);
        }
      } else if (delta < 0 && delta < -midDelta) {
        end = leftPadding(index + distance) + painters[index + distance].width;
        if (alignment == FaradayTabBarTitleAlignment.center) {
          begin = begin +
              (painters[index].width + kPadding) * (-delta / midDelta - 1.0);
        } else {
          begin = begin +
              (leftPadding(index + distance) - begin) *
                  (-delta / midDelta - 1.0);
        }
      }

      final rect = Rect.fromLTRB(begin, dy, end, size.height);

      final paint = Paint();
      if (indicator != null) paint.color = indicator!;

      canvas.drawRRect(
          RRect.fromRectAndRadius(
              rect, const Radius.circular(kLineHeight / 2.0)),
          paint);
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _FaradayTabBarIndicatorPainter oldDelegate) {
    return true;
  }

  @override
  bool hitTest(Offset position) {
    return titleRects.any((rect) => rect.contains(position));
  }
}
