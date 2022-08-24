package com.qingkouwei.handyinstruction.av.video;

import java.nio.ByteBuffer;

public interface VideoSourceListener {
  boolean onVideoFrame(VideoSource videoSource,
      ByteBuffer buffer,
      int width, int height,
      int[] stride,
      int sliceHeight,
      int pixelFormat);

  boolean onVideoFrameTex(VideoSource videoSource,
      int tex,
      int width, int height);

  boolean onVideoFrameTexOES(VideoSource videoSource,
      int tex,
      int width, int height,
      float[] mTexMatrix);

  void onVideoFrameCaptureError(VideoSource videoSource,
      int errCode);
}
