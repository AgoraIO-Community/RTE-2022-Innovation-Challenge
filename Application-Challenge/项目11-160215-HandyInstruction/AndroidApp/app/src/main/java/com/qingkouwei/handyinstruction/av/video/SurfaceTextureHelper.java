package com.qingkouwei.handyinstruction.av.video;

import android.annotation.TargetApi;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.opengl.GLES20;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;
import io.agora.rtc.gl.EglBase;
import io.agora.rtc.gl.GlUtil;
import io.agora.rtc.gl.VideoFrame;
import io.agora.rtc.gl.YuvConverter;
import io.agora.rtc.utils.ThreadUtils;
import java.util.concurrent.Callable;

public class SurfaceTextureHelper {
  private static final String TAG = "SurfaceTextureHelper";
  private final Handler handler;
  private final EglBase eglBase;
  private final SurfaceTexture surfaceTexture;
  private final int oesTextureId;
  private YuvConverter yuvConverter;
  private OnTextureFrameAvailableListener listener;
  private boolean hasPendingTexture;
  private volatile boolean isTextureInUse;
  private boolean isQuitting;
  private OnTextureFrameAvailableListener pendingListener;
  final Runnable setListenerRunnable;
  private Object textureLock;

  public static SurfaceTextureHelper create(final String threadName, final EglBase.Context sharedContext, final Object lock) {
    HandlerThread thread = new HandlerThread(threadName);
    thread.start();
    final Handler handler = new Handler(thread.getLooper());
    return (SurfaceTextureHelper) ThreadUtils.invokeAtFrontUninterruptibly(handler, new Callable<SurfaceTextureHelper>() {
      public SurfaceTextureHelper call() {
        try {
          return new SurfaceTextureHelper(sharedContext, handler, lock);
        } catch (RuntimeException var2) {
          Log.e("SurfaceTextureHelper", threadName + " create failure", var2);
          return null;
        }
      }
    });
  }

  private SurfaceTextureHelper(EglBase.Context sharedContext, Handler handler, Object lock) {
    this.textureLock = lock;
    this.hasPendingTexture = false;
    this.isTextureInUse = false;
    this.isQuitting = false;
    this.setListenerRunnable = new Runnable() {
      public void run() {
        Log.d("SurfaceTextureHelper", "Setting listener to " + SurfaceTextureHelper.this.pendingListener);
        SurfaceTextureHelper.this.listener = SurfaceTextureHelper.this.pendingListener;
        SurfaceTextureHelper.this.pendingListener = null;
        if (SurfaceTextureHelper.this.hasPendingTexture) {
          SurfaceTextureHelper.this.updateTexImage();
          SurfaceTextureHelper.this.hasPendingTexture = false;
        }

      }
    };
    if (handler.getLooper().getThread() != Thread.currentThread()) {
      throw new IllegalStateException("SurfaceTextureHelper must be created on the handler thread");
    } else {
      this.handler = handler;
      this.eglBase = EglBase.create(sharedContext, EglBase.CONFIG_PIXEL_BUFFER);

      try {
        this.eglBase.createDummyPbufferSurface();
        this.eglBase.makeCurrent();
      } catch (RuntimeException var4) {
        Log.e("SurfaceTextureHelper", "SurfaceTextureHelper: failed to create pbufferSurface!!");
        this.eglBase.release();
        handler.getLooper().quit();
        throw var4;
      }

      this.oesTextureId = GlUtil.generateTexture(36197);
      this.surfaceTexture = new SurfaceTexture(this.oesTextureId);
      setOnFrameAvailableListener(this.surfaceTexture, new SurfaceTexture.OnFrameAvailableListener() {
        public void onFrameAvailable(SurfaceTexture surfaceTexture) {
          SurfaceTextureHelper.this.hasPendingTexture = true;
          SurfaceTextureHelper.this.tryDeliverTextureFrame();
        }
      }, handler);
    }
  }

  @TargetApi(21)
  private static void setOnFrameAvailableListener(SurfaceTexture surfaceTexture, SurfaceTexture.OnFrameAvailableListener listener, Handler handler) {
    if (Build.VERSION.SDK_INT >= 21) {
      surfaceTexture.setOnFrameAvailableListener(listener, handler);
    } else {
      surfaceTexture.setOnFrameAvailableListener(listener);
    }

  }

  public EglBase.Context getEglContext() {
    return this.eglBase.getEglBaseContext();
  }

  public void startListening(final OnTextureFrameAvailableListener listener) {
    if (this.listener == null && this.pendingListener == null) {
      this.pendingListener = listener;
      this.handler.post(this.setListenerRunnable);
    } else {
      throw new IllegalStateException("SurfaceTextureHelper listener has already been set.");
    }
  }

  public void stopListening() {
    Log.d("SurfaceTextureHelper", "stopListening()");
    this.handler.removeCallbacks(this.setListenerRunnable);
    ThreadUtils.invokeAtFrontUninterruptibly(this.handler, new Runnable() {
      public void run() {
        SurfaceTextureHelper.this.listener = null;
        SurfaceTextureHelper.this.pendingListener = null;
      }
    });
  }

  public SurfaceTexture getSurfaceTexture() {
    return this.surfaceTexture;
  }

  public Handler getHandler() {
    return this.handler;
  }

  public void returnTextureFrame() {
    this.handler.post(new Runnable() {
      public void run() {
        SurfaceTextureHelper.this.isTextureInUse = false;
        if (SurfaceTextureHelper.this.isQuitting) {
          SurfaceTextureHelper.this.release();
        } else {
          SurfaceTextureHelper.this.tryDeliverTextureFrame();
        }

      }
    });
  }

  public boolean isTextureInUse() {
    return this.isTextureInUse;
  }

  public void dispose() {
    Log.d("SurfaceTextureHelper", "dispose()");
    ThreadUtils.invokeAtFrontUninterruptibly(this.handler, new Runnable() {
      public void run() {
        SurfaceTextureHelper.this.isQuitting = true;
        if (!SurfaceTextureHelper.this.isTextureInUse) {
          SurfaceTextureHelper.this.release();
        }

      }
    });
  }

  public VideoFrame.I420Buffer textureToYuv(final VideoFrame.TextureBuffer textureBuffer) {
    if (textureBuffer.getTextureId() != this.oesTextureId) {
      throw new IllegalStateException("textureToByteBuffer called with unexpected textureId");
    } else {
      final VideoFrame.I420Buffer[] result = new VideoFrame.I420Buffer[1];
      ThreadUtils.invokeAtFrontUninterruptibly(this.handler, new Runnable() {
        public void run() {
          if (SurfaceTextureHelper.this.yuvConverter == null) {
            SurfaceTextureHelper.this.yuvConverter = new YuvConverter();
          }

          result[0] = SurfaceTextureHelper.this.yuvConverter.convert(textureBuffer);
        }
      });
      return result[0];
    }
  }

  private void updateTexImage() {
    try {
      synchronized(this.textureLock) {
        this.surfaceTexture.updateTexImage();
      }
    } catch (IllegalStateException var4) {
      Log.e("SurfaceTextureHelper", "SurfaceTextureHelper: failed to updateTexImage!!");
    }

  }

  private void tryDeliverTextureFrame() {
    if (this.handler.getLooper().getThread() != Thread.currentThread()) {
      throw new IllegalStateException("Wrong thread.");
    } else if (!this.isQuitting && this.hasPendingTexture && !this.isTextureInUse && this.listener != null) {
      this.isTextureInUse = true;
      this.hasPendingTexture = false;
      this.updateTexImage();
      float[] transformMatrix = new float[16];
      this.surfaceTexture.getTransformMatrix(transformMatrix);
      long timestampNs = this.surfaceTexture.getTimestamp();
      this.listener.onTextureFrameAvailable(this.oesTextureId, transformMatrix, timestampNs);
    }
  }

  private void release() {
    if (this.handler.getLooper().getThread() != Thread.currentThread()) {
      throw new IllegalStateException("Wrong thread.");
    } else if (!this.isTextureInUse && this.isQuitting) {
      if (this.yuvConverter != null) {
        this.yuvConverter.release();
      }

      GLES20.glDeleteTextures(1, new int[]{this.oesTextureId}, 0);
      this.surfaceTexture.release();
      this.eglBase.release();
      this.handler.getLooper().quit();
    } else {
      throw new IllegalStateException("Unexpected release.");
    }
  }

  public interface OnTextureFrameAvailableListener {
    void onTextureFrameAvailable(int oesTextureId, float[] transformMatrix, long timestampNs);
  }
}
