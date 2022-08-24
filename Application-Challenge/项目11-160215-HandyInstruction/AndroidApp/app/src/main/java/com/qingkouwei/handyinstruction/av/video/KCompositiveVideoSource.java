package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES20;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import com.qingkouwei.handyinstruction.av.bean.Size;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.EglBase;
import io.agora.rtc.gl.EglBase14;
import io.agora.rtc.gl.RendererCommon;
import io.agora.rtc.mediaio.IVideoFrameConsumer;
import io.agora.rtc.mediaio.MediaIO;
import java.lang.ref.WeakReference;

public class KCompositiveVideoSource extends CompositiveVideoSource {

  static private final SdkLog _log = SdkLog.getLog("KCompositiveVideoSource");

  protected WeakReference<IVideoFrameConsumer> mConsumer;

  private DrawRunnable mDrawRunnable;
  private HandlerThread textureThread;

  private HandlerThread mDrawThread;
  private Handler mDrawHandler;
  private Object mDrawHandlerLock = new Object();

  /**
   * 绘制到屏幕线程与多个source合成到一起线程同步锁(方法不是特别好)
   */
  public final static Object lock = new Object();

  @Override
  protected Object getTextureLock() {
    return lock;
  }

  public KCompositiveVideoSource(EglBase14.Context mEgl14Context,
      Size size) {
    videoSize = size;
    this.mEGL14Context = mEgl14Context;
  }

  private class DrawRunnable implements Runnable {
    @Override
    public void run() {
      synchronized (mDrawHandlerLock) {
        if(texture == null){
          return;
        }
        texture.mEglCore.makeCurrent();
        drawerOnDrawFrame();
        texture.mEglCore.swapBuffers();
        if (mDrawHandler != null) {
          mDrawHandler.postDelayed(this, (long) (1000f / mFps));
        }
      }
    }
  }

  @Override
  public boolean onInitialize(IVideoFrameConsumer consumer) {
    _log.i("onInitialize:" + this);
    this.mConsumer = new WeakReference(consumer);
    return true;
  }

  public boolean onStart() {
    _log.i("onStart:" + this);
    textureThread = new HandlerThread("KGLSurface");
    textureThread.start();
    textureHandler = new Handler(textureThread.getLooper());
    mDrawThread = new HandlerThread("KDrawThread");
    mDrawThread.start();
    mDrawHandler = new Handler(mDrawThread.getLooper());
    mDrawRunnable = new DrawRunnable();

    textureHandler.post(new Runnable() {
      @Override
      public void run() {
        uploadCore = EglBase.create(mEGL14Context, EglBase14.CONFIG_RGBA);
        uploadCore.createDummyPbufferSurface();
        uploadCore.makeCurrent();

        mDrawHandler.post(new Runnable() {
          @Override
          public void run() {
            texture = new Texture(mEGL14Context, videoSize.width, videoSize.height,
                mOnFrameAvailableListener, textureHandler);
            texture.initEGLEnv();
            subVideoSources.get(0).videoSource.start(videoSize);
            mDrawHandler.post(mDrawRunnable);
          }
        });
      }
    });
    return super.onStart();
  }

  public void onStop() {
    _log.i("onStop:" + this);
    super.onStop();
    if (mDrawHandler != null) {
      synchronized (mDrawHandlerLock) {
        _log.i("drawRunnable release...");
        mDrawHandler.removeCallbacksAndMessages(null);
        if (mDrawThread != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mDrawThread.quitSafely();
          } else {
            mDrawThread.quit();
          }
          mDrawThread = null;
        }
        mDrawHandler = null;
        if (texture != null) {
          texture.release();
          texture = null;
        }
      }
    }
    if (textureHandler != null) {
      textureHandler.removeCallbacksAndMessages(null);
      if (textureThread != null) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
          textureThread.quitSafely();
        } else {
          textureThread.quit();
        }
        textureThread = null;
      }
      textureHandler = null;
    }
    if(uploadCore != null){
      uploadCore.release();
      uploadCore = null;
    }
  }

  @Override
  public void onDispose() {
    _log.i("onDispose:" + this);
    this.mConsumer = null;
  }

  @Override
  public int getBufferType() {
    return MediaIO.BufferType.TEXTURE.intValue();
  }

  public int drawerOnDrawFrame() {
    //避免不绘制的时候清屏色黑色把屏幕冲掉
    GLES20.glViewport(0, 0, videoSize.width, videoSize.height);
    GLES20.glClear(GLES20.GL_DEPTH_BUFFER_BIT | GLES20.GL_COLOR_BUFFER_BIT);
    GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    drawSubVideoSources();
    return 1;
  }

  @Override
  public boolean onVideoFrameTexOES(int tex, int width, int height, float[] mTexMatrix) {
    if ((this.mConsumer != null) && (this.mConsumer.get() != null)) {
      mTexMatrix =
          RendererCommon.multiplyMatrices(mTexMatrix, RendererCommon.horizontalFlipMatrix());
      ((IVideoFrameConsumer) this.mConsumer.get()).consumeTextureFrame(tex,
          MediaIO.PixelFormat.TEXTURE_OES.intValue(), width, height, 90,
          System.currentTimeMillis(), mTexMatrix);
      returnTextureFrame();
      return true;
    }
    returnTextureFrame();
    return false;
  }
}
