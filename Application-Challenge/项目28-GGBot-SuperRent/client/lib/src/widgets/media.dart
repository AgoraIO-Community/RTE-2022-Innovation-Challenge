import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flick_video_player/flick_video_player.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:interactiveviewer_gallery/hero_dialog_route.dart';
import 'package:interactiveviewer_gallery/interactiveviewer_gallery.dart';
import 'package:super_rent/src/models/media.dart';
import 'package:video_player/video_player.dart';
import 'package:visibility_detector/visibility_detector.dart';

void openMediasGallery(
    BuildContext context, List<RentMedia> items, RentMedia item) {
  Navigator.of(context).push(
    HeroDialogRoute<void>(
      // DisplayGesture is just debug, please remove it when use
      builder: (BuildContext context) => InteractiveviewerGallery<RentMedia>(
        sources: items,
        initIndex: items.indexOf(item),
        itemBuilder: (context, index, isFocus) => item.isVideo
            ? LiveUploadVideoItem(
                item,
                isFocus: isFocus,
              )
            : RentMediaImageItem(item),
        onPageChanged: (int pageIndex) {},
      ),
    ),
  );
}

class RentMediaImageItem extends StatefulWidget {
  final RentMedia item;

  const RentMediaImageItem(this.item, {Key? key}) : super(key: key);

  @override
  // ignore: library_private_types_in_public_api
  _RentMediaImageItemState createState() => _RentMediaImageItemState();
}

class _RentMediaImageItemState extends State<RentMediaImageItem> {
  @override
  Widget build(BuildContext context) {
    Widget image;
    if (widget.item.isRemoteImage) {
      image = CachedNetworkImage(
        imageUrl: widget.item.imagePath,
        fit: BoxFit.fitWidth,
      );
    } else {
      image = Image(
        image: FileImage(File(widget.item.imagePath)),
      );
    }
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => Navigator.of(context).pop(),
      child: Hero(
        tag: widget.item.imagePath,
        child: image,
      ),
    );
  }
}

class LiveUploadVideoItem extends StatefulWidget {
  final RentMedia source;
  final bool? isFocus;

  const LiveUploadVideoItem(this.source, {this.isFocus, Key? key})
      : super(key: key);

  @override
  // ignore: library_private_types_in_public_api
  _RentMediaVideoItemState createState() => _RentMediaVideoItemState();
}

class _RentMediaVideoItemState extends State<LiveUploadVideoItem> {
  late FlickManager flickManager;

  @override
  void initState() {
    super.initState();
    flickManager = FlickManager(
      videoPlayerController: VideoPlayerController.network(
        widget.source.videoPath!,
        // closedCaptionFile: _loadCaptions(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return VisibilityDetector(
      key: ObjectKey(flickManager),
      onVisibilityChanged: (visibility) {
        if (visibility.visibleFraction == 0 && mounted) {
          flickManager.flickControlManager?.autoPause();
        } else if (visibility.visibleFraction == 1) {
          flickManager.flickControlManager?.autoResume();
        }
      },
      child: SafeArea(
        child: FlickVideoPlayer(
          flickManager: flickManager,
          flickVideoWithControls: const FlickVideoWithControls(
            closedCaptionTextStyle: TextStyle(fontSize: 8),
            controls: FlickPortraitControls(),
          ),
          flickVideoWithControlsFullscreen: const FlickVideoWithControls(
            controls: FlickLandscapeControls(),
          ),
        ),
      ),
    );
  }
}
