package com.qingkouwei.handyinstruction.av.video;

import com.qingkouwei.handyinstruction.av.bean.Size;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.EglBase14;

public class VideoSourceMgr {
  private final static SdkLog _log = SdkLog.getLog("VideoSourceMgr");

  private static VideoSourceMgr sSharedInstance = null;

  public EglBase14.Context mEgl14Context = null;

  private KCompositiveVideoSource kCompositiveVideoSource = null;
  private CameraVideoSource cameraVideoSource = null;
  private DrawVideoSource drawVideoSource = null;

  public Size videoSize, screenSize;
  private int drawViewWidth, drawViewHeight;
  private float widthRatio, heightRatio;

  private boolean hasAddDrawingVideoSource = false;

  static public VideoSourceMgr getInstance() {
    if (sSharedInstance == null) {
      sSharedInstance = new VideoSourceMgr();
    }
    return sSharedInstance;
  }

  public void setCameraVideoSource(CameraVideoSource cameraVideoSource) {
    if (this.cameraVideoSource == null && cameraVideoSource != null) {
      this.cameraVideoSource = cameraVideoSource;
    }
  }

  public VideoSource getMainVideoSource() {
    return kCompositiveVideoSource;
  }

  public CameraVideoSource getCameraVideoSource() {
    return cameraVideoSource;
  }

  public void initEGLContext(EglBase14.Context mEgl14Context, Size size, Size screenSize) {
    _log.e("initEGLContext:mEgl14Context = "
        + mEgl14Context);
    this.mEgl14Context = mEgl14Context;
    this.videoSize = size;
    this.screenSize = screenSize;
    this.widthRatio = videoSize.width * 1.0f / screenSize.width;
    this.heightRatio = videoSize.height * 1.0f / screenSize.height;
    _log.e("VideoSourceMgr videoSize:" + videoSize.width + " * " + videoSize.height +
        ";screenSize:" + screenSize.width + " * " + screenSize.height +
        ";ratio:" + widthRatio + " * " + heightRatio);

    kCompositiveVideoSource = new KCompositiveVideoSource(mEgl14Context, size);
    cameraVideoSource =
        CameraVideoSource.createInstance(0, CameraVideoSource.CAMERA_FACING_BACK, mEgl14Context,
            size);
    kCompositiveVideoSource.addVideoSource(cameraVideoSource, 0, 0, size.width, size.height);
  }

  public void addDrawing(int width, int height) {
    if (kCompositiveVideoSource == null) {
      return;
    }
    if (hasAddDrawingVideoSource && drawViewHeight == height && drawViewWidth == width) {
      return;
    }
    if (drawViewHeight != height || drawViewWidth != width) {
      if (drawVideoSource != null) {
        kCompositiveVideoSource.delVideoSource(drawVideoSource);
        drawVideoSource.stop();
        drawVideoSource.start(new Size(width, height));
      }
    }
    _log.e("addDrawing:" + width + " * " + height);
    if (this.drawVideoSource == null) {
      this.drawVideoSource = DrawVideoSource.createInstance(mEgl14Context);
      this.drawVideoSource.start(new Size(width, height));
    }
    drawViewWidth = width;
    drawViewHeight = height;
    if (kCompositiveVideoSource != null) {
      kCompositiveVideoSource.addVideoSource(drawVideoSource, 0, 0, videoSize.width,
          videoSize.height);
      hasAddDrawingVideoSource = true;
    }
  }

  public DrawVideoSource getDrawVideoSource() {
    return drawVideoSource;
  }

  public void delDrawing() {
    if (kCompositiveVideoSource != null && drawVideoSource != null) {
      kCompositiveVideoSource.delVideoSource(drawVideoSource);
      hasAddDrawingVideoSource = false;
    }
  }

  public void destroy() {
    _log.e("destroy...");
    if (drawVideoSource != null) {
      drawVideoSource.destroy();
      drawVideoSource = null;
    }
    if(cameraVideoSource != null){
      cameraVideoSource.destroy();
      cameraVideoSource = null;
    }
    mEgl14Context = null;
    this.videoSize = null;
    this.screenSize = null;
    this.widthRatio = 0;
    this.heightRatio = 0;
    sSharedInstance = null;
  }
}
