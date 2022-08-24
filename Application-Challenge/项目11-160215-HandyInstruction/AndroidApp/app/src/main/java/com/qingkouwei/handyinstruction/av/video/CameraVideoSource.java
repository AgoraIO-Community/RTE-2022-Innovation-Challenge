package com.qingkouwei.handyinstruction.av.video;

import android.graphics.ImageFormat;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import com.qingkouwei.handyinstruction.av.bean.Size;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.EglBase14;
import io.agora.rtc.mediaio.IVideoFrameConsumer;
import io.agora.rtc.mediaio.MediaIO;
import java.io.IOException;
import java.util.List;

public class CameraVideoSource extends VideoSource
    implements SurfaceTextureHelper.OnTextureFrameAvailableListener {
  public static final int CAMERA_FACING_BACK = 0;
  public static final int CAMERA_FACING_FRONT = 1;

  private static final SdkLog _log = SdkLog.getLog("CameraVideoSource");
  private static CameraVideoSource sharedInstance = null;
  private static Object instanceLock = new Object();
  private static final int FPS = 24;

  public static final int SCALE_STRETCH_FIT = 0;
  public static final int SCALE_KEEP_ASPECT = 1;
  public static final int SCALE_CROP_CENTER = 2;

  protected SurfaceTextureHelper mSurfaceTextureHelper;

  private Camera camera;
  private int cameraFacing = CAMERA_FACING_FRONT;
  private int previewRotation;
  private Size cameraPreviewSize; // Camera PreivewSize
  private Size surfaceSize; // the previewView surfaceSize
  private int scaleMode = SCALE_CROP_CENTER;

  private HandlerThread cameraThread;
  private Handler cameraHandler;

  private Object updateViewportLock = new Object();

  private Size previewSize;

  private boolean isCameraOpening = false;

  private CameraVideoSource(int previewRotation, int cameraFacing,
      EglBase14.Context mEGL14Context, Size size) {
    videoSize = size;
    mFps = FPS;
    this.previewRotation = previewRotation;
    this.cameraFacing = cameraFacing;
    this.mEGL14Context = mEGL14Context;

    this.mSurfaceTextureHelper =
        SurfaceTextureHelper.create("TexCamThread", mEGL14Context, textureLock);
    this.mSurfaceTextureHelper.getSurfaceTexture().setDefaultBufferSize(size.width, size.height);
    this.mSurfaceTextureHelper.startListening(this);
  }

  @Override
  public void returnTextureFrame() {
    this.mSurfaceTextureHelper.returnTextureFrame();
  }

  static public CameraVideoSource createInstance(int previewRotation, Size size)
      throws RuntimeException {
    return createInstance(previewRotation, CAMERA_FACING_BACK, null, size);
  }

  static public CameraVideoSource createInstance(int previewRotation, int cameraFacing,
      EglBase14.Context mEGL14Context, Size size)
      throws RuntimeException {
    synchronized (instanceLock) {
      sharedInstance = new CameraVideoSource(previewRotation, cameraFacing, mEGL14Context, size);
      return sharedInstance;
    }
  }

  public SurfaceTexture getSurfaceTexture() {
    return this.mSurfaceTextureHelper.getSurfaceTexture();
  }

  public void setPreviewRotation(int previewRotation) {
    if (this.previewRotation == previewRotation) {
      return;
    }
    this.previewRotation = previewRotation;
    if (isRunning()) {
      openCamera();
    }
  }

  public void setScaleMode(int scaleMode) {
    synchronized (updateViewportLock) {
      this.scaleMode = scaleMode;
    }
  }

  public void switchCamera(int cameraFacing) {
    if (this.cameraFacing == cameraFacing) {
      return;
    }
    this.cameraFacing = cameraFacing;
    if (isRunning()) {
      openCamera();
    }
  }

  public void switchCamera() {
    if (this.cameraFacing == CAMERA_FACING_FRONT) {
      this.cameraFacing = CAMERA_FACING_BACK;
    } else if (this.cameraFacing == CAMERA_FACING_BACK) {
      this.cameraFacing = CAMERA_FACING_FRONT;
    }
    if (isRunning()) {
      openCamera();
    }
  }

  @Override
  public void onTextureFrameAvailable(int paramInt, float[] paramArrayOfFloat, long paramLong) {
    float[] arrayOfFloat = paramArrayOfFloat;
    onVideoFrameTexOES(paramInt, videoSize.width, videoSize.height, arrayOfFloat);
  }

  public boolean isSupportChangeSize() {
    return true;
  }

  public void requestChangeSize(Size size) {

  }

  private int[] findClosestFpsRange(int expectedFps, List<int[]> fpsRanges) {
    expectedFps *= 1000;
    int[] closestRange = fpsRanges.get(0);
    int measure = Math.abs(closestRange[0] - expectedFps) + Math.abs(closestRange[1] - expectedFps);
    for (int[] range : fpsRanges) {
      if (range[0] <= expectedFps && range[1] >= expectedFps) {
        int curMeasure = Math.abs(range[0] - expectedFps) + Math.abs(range[1] - expectedFps);
        if (curMeasure < measure) {
          closestRange = range;
          measure = curMeasure;
        }
      }
    }
    return closestRange;
  }

  private float ratioOfSize(int width, int height) {
    if (width < height) {
      return (float) width / (float) height;
    } else {
      return (float) height / (float) width;
    }
  }

  private Size findPreferredPreviewSize(Size size, int previewRotation,
      List<Camera.Size> supportedSizes) {
    float minDiff = 1000.0f;
    Size bestSize = new Size(0, 0);
    float expectedRatio = ratioOfSize(size.width, size.height);
    for (Camera.Size cs : supportedSizes) {
      float ratio = ratioOfSize(cs.width, cs.height);
      float diff = Math.abs(ratio - expectedRatio);
      if (Math.abs(diff - minDiff) < 0.05) {
        if (diffOfSize(cs.width, cs.height, size.width, size.height)
            < diffOfSize(bestSize.width, bestSize.height, size.width, size.height)) {
          minDiff = diff;
          bestSize.width = cs.width;
          bestSize.height = cs.height;
        }
      } else if (diff < minDiff) {
        minDiff = diff;
        bestSize.width = cs.width;
        bestSize.height = cs.height;
      }
    }
    _log.i("find the preperred preview size: " + bestSize.width + "x" + bestSize.height);
    return bestSize;
  }

  private int diffOfSize(int width1, int height1, int width2, int heigh2) {
    return Math.abs(width1 - width2) + Math.abs(height1 - heigh2);
  }

  @Override
  public boolean onInitialize(IVideoFrameConsumer consumer) {
    return true;
  }

  @Override
  public boolean onStart() {
    _log.i("onStart:" + this);
    if (cameraThread == null) {
      cameraThread = new HandlerThread(CameraVideoSource.class.getName());
      cameraThread.start();
    }
    if (cameraHandler == null) {
      cameraHandler = new Handler(cameraThread.getLooper());
    }
    startCamera(videoSize.width, videoSize.height);
    return true;
  }

  public void onStop() {
    _log.i("onStop:" + this);
    closeCamera();
    previewSize = null;
    cameraPreviewSize = null;
    surfaceSize = null;

    this.mSurfaceTextureHelper.stopListening();
    this.mSurfaceTextureHelper.dispose();
    this.mSurfaceTextureHelper = null;

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) { //18
      cameraThread.quitSafely();
    } else {
      synchronized (cameraThread) {
        try {
          cameraThread.wait(100, 0);
        } catch (Exception exp) {
        }
      }
      cameraThread.quit();
    }
    cameraHandler = null;
    synchronized (instanceLock) {
      _log.i("onStop destroy sharedInstance...");
      sharedInstance = null;
    }
  }

  @Override
  public void onDispose() {

  }

  @Override
  public int getBufferType() {
    return MediaIO.BufferType.TEXTURE.intValue();
  }

  private int getCamerIdByFacing(int cameraType) {
    for (int i = 0; i < Camera.getNumberOfCameras(); i++) {
      Camera.CameraInfo info = new Camera.CameraInfo();
      Camera.getCameraInfo(i, info);
      if (cameraType == CAMERA_FACING_FRONT
          && info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
        return i;
      } else if (cameraType == CAMERA_FACING_BACK
          && info.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
        return i;
      }
    }
    return 0;
  }

  public void startCamera(int surfaceWidth, int surfaceHeight) {
    if (surfaceWidth <= 0 || surfaceHeight <= 0) {
      return;
    }
    this.surfaceSize = new Size(surfaceWidth, surfaceHeight);
    openCamera();
  }

  public void stopCamera() {
    closeCamera();
  }

  private void closeCamera() {
    if (cameraHandler != null && cameraThread.isAlive()) {
      cameraHandler.post(new Runnable() {
        @Override
        public void run() {
          if (camera != null) {
            isCameraOpening = false;
            camera.stopPreview();
            camera.release();
            camera = null;
            synchronized (cameraThread) {
              cameraThread.notifyAll();
            }
          }
        }
      });
    }
  }

  private void openCamera() {
    if (cameraHandler != null) {
      isCameraOpening = true;
      cameraHandler.post(new Runnable() {
        @Override
        public void run() {
          openCamera(surfaceSize);
        }
      });
    }
  }

  protected boolean openCamera(Size expectPreviewSize) {
    _log.i("openCamera...");
    try {
      if (camera != null) {
        camera.release();
        camera = null;
      }
      int camId = getCamerIdByFacing(cameraFacing);
      camera = Camera.open(camId);
      isCameraOpening = false;
      Camera.Parameters params = camera.getParameters();

      int[] range = findClosestFpsRange(FPS, params.getSupportedPreviewFpsRange());
      params.setPreviewFpsRange(range[0], range[1]);
      int format = ImageFormat.YV12;
      boolean yv12Supported = false, nv21Supported = false;
      List<Integer> formats = params.getSupportedPreviewFormats();
      for (int f : formats) {
        _log.i(String.format("supported format: 0x%x", f));
        if (f == ImageFormat.YV12) {
          yv12Supported = true;
        } else if (f == ImageFormat.NV21) {
          nv21Supported = true;
        }
      }
      if (yv12Supported) {
        format = ImageFormat.YV12;
      } else if (nv21Supported) {
        format = ImageFormat.NV21;
      } else {
        _log.i(String.format("yv12 and nv21 are not both supported"));
        return false;
      }

      format = ImageFormat.NV21;
      params.setPreviewFormat(format);

      previewSize = findPreferredPreviewSize(expectPreviewSize,
          previewRotation,
          params.getSupportedPreviewSizes());
      if (previewSize == null) {
        _log.i(String.format("Unsupported preview size %dx%d", expectPreviewSize.width,
            expectPreviewSize.height));
        return false;
      }
      _log.i("findPreperredPreviewSize: %dx%d, expected:%dx%d",
          previewSize.width, previewSize.height,
          expectPreviewSize.width, expectPreviewSize.height);

      params.setPreviewSize(previewSize.width, previewSize.height);
      params.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
      params.setWhiteBalance(Camera.Parameters.WHITE_BALANCE_AUTO);
      params.setSceneMode(Camera.Parameters.SCENE_MODE_AUTO);
      List<String> focusModes = params.getSupportedFocusModes();
      if (focusModes != null && focusModes.contains("continuous-video")) {
        params.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_VIDEO);
      }
      camera.setParameters(params);
      camera.setDisplayOrientation(previewRotation);

      if (previewRotation == 90 || previewRotation == 270) {
        int tmp = previewSize.width;
        previewSize.width = previewSize.height;
        previewSize.height = tmp;
      }
      try {
        _log.i("setPreviewDisplay");
        camera.setPreviewTexture(getSurfaceTexture());
      } catch (IOException e) {
        e.printStackTrace();
      }

      synchronized (updateViewportLock) {
        cameraPreviewSize = previewSize;
      }
      // this.videoSize = videoSize;
      camera.startPreview();
      _log.i("started");
      return true;
    } catch (Exception exp) {
      _log.i("catch an exception: " + exp.getMessage());
      exp.printStackTrace();
      if (camera != null) {
        camera.release();
        camera = null;
      }
      onCaptureError(1);
    }
    return false;
  }

  public boolean isCameraStoped() {
    return camera == null;
  }

  public boolean isCameraOpening() {
    return isCameraOpening;
  }

  public boolean isFacingMode() {
    return cameraFacing == CAMERA_FACING_FRONT;
  }

  public boolean switchFlashlight(boolean isOpen) {
    if (cameraFacing == CAMERA_FACING_FRONT) {
      return false;
    }
    if (camera != null) {
      try {
        Camera.Parameters mParameters;
        mParameters = camera.getParameters();
        mParameters.setFlashMode(
            isOpen ? Camera.Parameters.FLASH_MODE_TORCH : Camera.Parameters.FLASH_MODE_OFF);
        camera.setParameters(mParameters);
      } catch (Exception ex) {
        _log.e("switchFlashlight exception = " + ex.getMessage());
      }
    }
    return true;
  }
}
