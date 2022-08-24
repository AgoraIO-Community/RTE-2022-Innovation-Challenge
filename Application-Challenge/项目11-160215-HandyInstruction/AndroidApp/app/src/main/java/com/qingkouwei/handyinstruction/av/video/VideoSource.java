package com.qingkouwei.handyinstruction.av.video;

import android.graphics.Bitmap;
import android.graphics.SurfaceTexture;
import android.opengl.GLES20;
import android.os.Build;
import android.os.Handler;
import android.view.Surface;
import com.qingkouwei.handyinstruction.av.bean.Size;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.EglBase;
import io.agora.rtc.gl.EglBase14;
import io.agora.rtc.mediaio.IVideoSource;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.IntBuffer;


abstract public class VideoSource implements IVideoSource {
  private static SdkLog _log = SdkLog.getLog("VideoSource");

  private VideoSourceListener videoSourceListener;
  private Object videoSourceListenerLock = new Object();

  protected Size videoSize;
  protected int errCode = 0;
  volatile protected boolean isStarting = false;
  volatile protected boolean isStarted = false;
  volatile protected boolean isStopping = false;

  protected static final int FPS = 24;
  protected int mFps;
  protected long lastFrameTs = 0; // in ms

  protected EglBase14.Context mEGL14Context;

  protected Surface mSurface;

  protected volatile boolean isTextureInUse = false;
  protected boolean hasPendingTexture = false;
  protected Texture texture;
  protected Handler textureHandler;
  protected int rtcRotation = 0;
  protected float[] horizontalFlipMatrix = null;
  protected float[] verticalFlipMatrix = null;
  public Object textureLock = new Object();

  protected Object getTextureLock(){
    return textureLock;
  }


  protected EglBase uploadCore;
  protected SurfaceTexture.OnFrameAvailableListener mOnFrameAvailableListener =
      new SurfaceTexture.OnFrameAvailableListener() {
        @Override
        public void onFrameAvailable(final SurfaceTexture surfaceTexture) {
          if(uploadCore != null){
            uploadCore.makeCurrent();
          }
          hasPendingTexture = true;
          tryDeliverTextureFrame();
        }
      };

  public void destroy() {

  }

  public boolean isRunning() {
    return ((isStarting || isStarted) && !isStopping);
  }

  public boolean start(Size videoSize) {
    if (isStopping) {
      _log.i("start is cancelled, is stopping");
      return false;
    }
    if (isStarted) {
      _log.i("start is cancelled, is started");
      return true;
    }
    this.videoSize = new Size(videoSize);
    isStarting = true;
    isStarted = onStart();
    isStarting = false;
    return isStarted;
  }

  public boolean stop() {
    if (!isStarted) {
      _log.i("start is cancelled, is not started");
      return false;
    }
    if (isStopping) {
      _log.i("start is cancelled, is stopping");
      return false;
    }

    isStopping = true;
    onStop();
    isStarted = false;
    isStopping = false;
    return true;
  }

  public void setVideoSourceListener(VideoSourceListener listener) {
    synchronized (videoSourceListenerLock) {
      this.videoSourceListener = listener;
      returnTextureFrame();
    }
  }

  public boolean onVideoFrame(ByteBuffer buffer, int width, int height,
      int[] stride, int sliceHeight, int pixelFormat) {
    synchronized (videoSourceListenerLock) {
      if (videoSourceListener != null) {
        return videoSourceListener.onVideoFrame(this,
            buffer, width, height, stride, sliceHeight, pixelFormat);
      }
      return false;
    }
  }

  public boolean onVideoFrameTex(int tex, int width, int height) {
    synchronized (videoSourceListenerLock) {
      if (videoSourceListener != null) {
        if (Build.VERSION.SDK_INT < 24 /*&& nativeSharedEGLContext != 0*/) {
          isTextureInUse = true;
        }
        return videoSourceListener.onVideoFrameTex(this,
            tex, width, height);
      }
      return false;
    }
  }

  public boolean onVideoFrameTexOES(int tex, int width, int height, float[] mTexMatrix) {
    synchronized (videoSourceListenerLock) {
      if (videoSourceListener != null) {
        return videoSourceListener.onVideoFrameTexOES(this,
            tex, width, height, mTexMatrix);
      }
      return false;
    }
  }

  public void onCaptureError(int errCode) {
    this.errCode = errCode;
    synchronized (videoSourceListenerLock) {
      if (videoSourceListener != null) {
        videoSourceListener.onVideoFrameCaptureError(this,
            errCode);
      }
    }
  }

  protected void tryDeliverTextureFrame() {
    if (!hasPendingTexture || isTextureInUse) {
      return;
    }
    isTextureInUse = true;
    hasPendingTexture = false;
    if (texture == null) return;
    float[] mTexMatrix = new float[16];
    synchronized (getTextureLock()) {
      texture.mSourceTexture.updateTexImage();//获取最新图片流
      texture.mSourceTexture.getTransformMatrix(mTexMatrix);//得到的矩阵来变换纹理坐标
    }
    if (horizontalFlipMatrix != null) {
      mTexMatrix = OpenGlUtils.multiplyMatrices(mTexMatrix, horizontalFlipMatrix);
    }
    if (verticalFlipMatrix != null) {
      mTexMatrix = OpenGlUtils.multiplyMatrices(mTexMatrix, verticalFlipMatrix);
    }
    onVideoFrameTexOES(texture.mTexId, videoSize.width, videoSize.height,
        OpenGlUtils.rotateTextureMatrix(mTexMatrix, rtcRotation));
  }

  public void returnTextureFrame() {
    if (textureHandler == null) {
      isTextureInUse = false;
      return;
    }
    textureHandler.post(new Runnable() {
      @Override
      public void run() {
        isTextureInUse = false;
        tryDeliverTextureFrame();
      }
    });
  }

  public static class Texture {
    public int mTexId;
    public SurfaceTexture mSourceTexture;
    public EglBase14 mEglCore = null;
    public EglBase14.Context sharedContext;
    public EglBase14 initCore = null;
    public int[] config = null;

    public Texture(EglBase14.Context sharedContext, int width, int height,
        SurfaceTexture.OnFrameAvailableListener onFrameAvailableListener, Handler handler) {
      this(sharedContext, width, height, EglBase.CONFIG_PLAIN, onFrameAvailableListener, handler);
    }

    public Texture(EglBase14.Context sharedContext, int width, int height,
        int[] config,
        SurfaceTexture.OnFrameAvailableListener onFrameAvailableListener, Handler handler) {
      this.sharedContext = sharedContext;
      this.config = config;
      initCore = (EglBase14) EglBase.create(sharedContext, config);
      initCore.createDummyPbufferSurface();
      initCore.makeCurrent();

      mTexId = OpenGlUtils.initTex(OpenGlUtils.texOESTarget);
      mSourceTexture = new SurfaceTexture(mTexId);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
        mSourceTexture.setDefaultBufferSize(width, height);
      }
      if (handler == null) {
        mSourceTexture.setOnFrameAvailableListener(onFrameAvailableListener);
      } else {
        mSourceTexture.setOnFrameAvailableListener(onFrameAvailableListener, handler);
      }
    }

    public void initEGLEnv() {
      mEglCore = (EglBase14) EglBase.create(sharedContext, config);
      mEglCore.createSurface(mSourceTexture);
      mEglCore.makeCurrent();
    }

    public void release() {
      if (mEglCore != null) {
        mEglCore.release();
      }
      if (initCore != null) {
        initCore.release();
        initCore = null;
      }
      if (mTexId != 0) {
        OpenGlUtils.deleteTex(mTexId);
        mTexId = 0;
      }
      if (mSourceTexture != null) {
        mSourceTexture.release();
      }
    }
  }

  protected void saveFrame(int width, int height, int i) {
    IntBuffer ib = IntBuffer.allocate(width * height);
    GLES20.glReadPixels(0, 0, width, height, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, ib);
    Bitmap result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
    result.copyPixelsFromBuffer(IntBuffer.wrap(ib.array()));
    File f = new File("/sdcard/", "aaa" + i + ".png");
    FileOutputStream out = null;
    try {
      out = new FileOutputStream(f);
      result.compress(Bitmap.CompressFormat.PNG, 90, out);
      out.flush();
      out.close();
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public void setmFps(int mFps) {
    this.mFps = mFps;
  }

  @Override
  public int getCaptureType() {
    return io.agora.rtc.mediaio.MediaIO.CaptureType.CAMERA.intValue();
  }

  @Override
  public int getContentHint() {
    return io.agora.rtc.mediaio.MediaIO.ContentHint.DETAIL.intValue();
  }
}
