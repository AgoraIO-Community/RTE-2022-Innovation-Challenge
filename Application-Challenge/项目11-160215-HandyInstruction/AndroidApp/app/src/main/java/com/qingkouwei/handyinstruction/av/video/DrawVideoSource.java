package com.qingkouwei.handyinstruction.av.video;

import android.graphics.Bitmap;
import android.opengl.GLES20;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.EglBase;
import io.agora.rtc.gl.EglBase14;
import io.agora.rtc.mediaio.IVideoFrameConsumer;
import io.agora.rtc.mediaio.MediaIO;
import java.nio.ByteBuffer;

public class DrawVideoSource extends VideoSource {
  private static final String TAG = "DrawVideoSource";
  private static final SdkLog _log = SdkLog.getLog(TAG, SdkLog.INFO);

  private static DrawVideoSource sharedInstance = null;
  private static final Object instanceLock = new Object();

  private HandlerThread mThread;
  private HandlerThread mUploadTexThread;
  private Handler mUploadTexHandler;

  private ByteBuffer mCopyByteBuffer;
  private boolean isCopyBufferUsing = false;
  private UpdatePixRunnable mUpdatePixRunnable;

  private int mBitmapWidth = 0;
  private int mBitmapHeight = 0;

  public int mTexId;
  private GLDrawer2D drawer2D;
  private EglBase14 uploadCore;

  private Object textureHandleLock = new Object();
  private Object uploadHandleLock = new Object();

  private boolean isInitTex = false;

  static public DrawVideoSource createInstance(EglBase14.Context mEgl14Context) {
    synchronized (instanceLock) {
      if (sharedInstance != null) {
        throw new RuntimeException("only one WatermarkVideoSource " +
            "instance be created, destroy the old one before create the new one");
      }
      sharedInstance = new DrawVideoSource(mEgl14Context);
      return sharedInstance;
    }
  }

  private DrawVideoSource(EglBase14.Context mEgl14Context) {
    this.mEGL14Context = mEgl14Context;
  }

  public void destroy() {
    synchronized (instanceLock) {
      sharedInstance = null;
    }
  }

  @Override
  public boolean onInitialize(IVideoFrameConsumer consumer) {
    return false;
  }

  @Override
  public boolean onStart() {
    _log.i("started");
    isInitTex = false;

    mThread = new HandlerThread(TAG);
    mThread.start();
    textureHandler = new Handler(mThread.getLooper());

    mUploadTexThread = new HandlerThread("UploadTextureThread");
    mUploadTexThread.start();
    mUploadTexHandler = new Handler(mUploadTexThread.getLooper());
    init();
    return true;
  }

  private void init() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
      if (mEGL14Context != null) {
        rtcRotation = 180;
        horizontalFlipMatrix = OpenGlUtils.horizontalFlipMatrix();
        verticalFlipMatrix = OpenGlUtils.verticalFlipMatrix();
        mUpdatePixRunnable = new UpdatePixRunnable();
        textureHandler.post(new Runnable() {
          @Override
          public void run() {
            uploadCore = (EglBase14) EglBase.create(mEGL14Context, EglBase14.CONFIG_RGBA);
            uploadCore.createDummyPbufferSurface();
            uploadCore.makeCurrent();

            mUploadTexHandler.post(new Runnable() {
              @Override
              public void run() {
                texture =
                    new Texture(mEGL14Context, videoSize.width, videoSize.height,
                        EglBase14.CONFIG_RGBA,
                        mOnFrameAvailableListener, textureHandler);
                texture.initEGLEnv();
                mTexId = OpenGlUtils.initTex(GLES20.GL_TEXTURE_2D);
                drawer2D = new GLDrawer2D();
              }
            });
          }
        });
      } else {
        mUpdatePixRunnable = new UpdatePixRunnable();
      }
    } else {
      mUpdatePixRunnable = new UpdatePixRunnable();
    }
  }

  public void onVideoFrameBitmap(Bitmap bitmap) {
    if (bitmap == null && bitmap.isRecycled()) {
      return;
    }
    if (isCopyBufferUsing) {
      return;
    }
    int bytes = bitmap.getByteCount();
    if (mCopyByteBuffer == null || mCopyByteBuffer.capacity() < bytes) {
      mCopyByteBuffer = ByteBuffer.allocate(bytes);
    }
    mBitmapWidth = bitmap.getWidth();
    mBitmapHeight = bitmap.getHeight();
    if (mBitmapWidth != videoSize.width || mBitmapHeight != videoSize.height) {
      return;
    }

    mCopyByteBuffer.clear();
    bitmap.copyPixelsToBuffer(mCopyByteBuffer);
    isCopyBufferUsing = true;
    if (mUploadTexHandler != null && mUpdatePixRunnable != null) {
      mUploadTexHandler.post(mUpdatePixRunnable);
    }
  }

  private class UpdatePixRunnable implements Runnable {
    @Override
    public void run() {
      mCopyByteBuffer.flip();
      if (mTexId != 0) {
        if (!isInitTex) {
          GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, mTexId);
          GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, mBitmapWidth, mBitmapHeight,
              0,
              GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, null);
          isInitTex = true;
        }
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, mTexId);
        GLES20.glTexSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, mBitmapWidth,
            mBitmapHeight, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, mCopyByteBuffer);
        texture.mEglCore.makeCurrent();
        GLES20.glViewport(0, 0, mBitmapWidth, mBitmapHeight);
        GLES20.glClear(GLES20.GL_DEPTH_BUFFER_BIT | GLES20.GL_COLOR_BUFFER_BIT);
        GLES20.glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
        drawer2D.drawRgb(mTexId, null, null, null, GLES20.GL_SRC_ALPHA, GLES20.GL_DST_ALPHA);
        texture.mEglCore.swapBuffers();
      } else {
        int[] stride = new int[1];
        stride[0] = mBitmapWidth;
        onVideoFrame(mCopyByteBuffer, mBitmapWidth, mBitmapHeight,
            stride,
            mBitmapHeight,
            MediaIO.PixelFormat.RGBA.intValue());
      }
      isCopyBufferUsing = false;
    }
  }

  @Override
  public void onStop() {
    if (textureHandler != null) {
      textureHandler.post(new Runnable() {
        @Override
        public void run() {
          synchronized (textureHandleLock) {
            textureHandler.removeCallbacks(mUpdatePixRunnable);
            if (texture != null) {
              texture.release();
              texture = null;
            }
            if (mThread != null) {
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                mThread.quitSafely();
              } else {
                mThread.quit();
              }
            }
            mThread = null;
            textureHandler = null;
            textureHandleLock.notify();
          }
        }
      });
    }
    if (mUploadTexHandler != null) {
      mUploadTexHandler.post(new Runnable() {
        @Override
        public void run() {
          synchronized (uploadHandleLock) {
            if (uploadCore != null) {
              uploadCore.release();
              uploadCore = null;
            }
            if (mTexId != 0) {
              OpenGlUtils.deleteTex(mTexId);
              mTexId = 0;
            }
            if (drawer2D != null) {
              drawer2D.release();
              drawer2D = null;
            }
            if (mUploadTexThread != null) {
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                mUploadTexThread.quitSafely();
              } else {
                mUploadTexThread.quit();
              }
            }
            mUploadTexHandler = null;
            mUploadTexThread = null;
            uploadHandleLock.notify();
          }
        }
      });
    }
  }

  @Override
  public void onDispose() {

  }

  @Override
  public int getBufferType() {
    return 0;
  }
}
