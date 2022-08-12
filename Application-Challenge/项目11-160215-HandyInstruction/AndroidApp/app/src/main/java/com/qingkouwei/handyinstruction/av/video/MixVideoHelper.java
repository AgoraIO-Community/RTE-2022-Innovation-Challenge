package com.qingkouwei.handyinstruction.av.video;

import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.graphics.Rect;
import android.media.Image;
import android.media.ImageReader;
import android.opengl.EGL14;
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.os.Handler;
import android.os.HandlerThread;
import android.view.Surface;
import android.widget.Toast;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import com.qingkouwei.handyinstruction.av.util.Utils;
import io.agora.rtc.gl.EglBase;
import io.agora.rtc.gl.EglBase10;
import io.agora.rtc.gl.EglBase14;
import io.agora.rtc.gl.GlTextureFrameBuffer;
import io.agora.rtc.gl.GlUtil;
import io.agora.rtc.gl.JavaI420Buffer;
import io.agora.rtc.gl.RendererCommon;
import io.agora.rtc.gl.VideoFrame;
import io.agora.rtc.mediaio.IVideoSink;
import io.agora.rtc.mediaio.MediaIO;
import io.agora.rtc.video.VideoRenderer;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.IntBuffer;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import javax.microedition.khronos.egl.EGL10;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.egl.EGLContext;
import javax.microedition.khronos.opengles.GL10;

public class MixVideoHelper
    implements GLSurfaceView.Renderer, ImageReader.OnImageAvailableListener {
  private static final String TAG = "OSNMixVideoHelper";

  private static final SdkLog _log = SdkLog.getLog(TAG);

  protected static Thread drawThread;

  protected static Thread renderFrameThread;

  protected RendererCommon.GlDrawer drawer;

  protected EglBase.Context eglContext = null;

  protected Runnable eglContextReady = null;

  private boolean onSurfaceCreatedCalled;

  protected int screenHeight;

  protected int screenWidth;

  protected GLSurfaceView surface;

  protected final ArrayList<YuvImageRenderer> yuvImageRenderers;

  private boolean isBlend = true;

  public boolean isSnapshot = false;

  private Handler mUIHandler;
  private ImageReader mImageReader;
  private Surface mScreenshotSurface;
  private HandlerThread mScreenshotThread;
  private Handler mScreenshotHandler;
  private EglBase14 mScreenshotEglCore = null;

  protected MixVideoHelper(GLSurfaceView paramGLSurfaceView, Runnable paramRunnable) {
    this.surface = paramGLSurfaceView;
    this.eglContextReady = paramRunnable;
    paramGLSurfaceView.setPreserveEGLContextOnPause(true);
    paramGLSurfaceView.setEGLContextClientVersion(2);
    paramGLSurfaceView.setRenderer(this);
    paramGLSurfaceView.setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
    this.yuvImageRenderers = new ArrayList();
    mUIHandler = new Handler();
  }

  public static MixVideoHelper setView(GLSurfaceView paramGLSurfaceView, Runnable paramRunnable) {
    return new MixVideoHelper(paramGLSurfaceView, paramRunnable);
  }

  public void setBlend(boolean isBlend) {
    this.isBlend = isBlend;
    if (surface != null) {
      surface.requestRender();
    }
  }

  public boolean isBlend() {
    return isBlend;
  }

  public static class MyI420Frame {
    public final int height;

    public int rotationDegree;

    public final float[] samplingMatrix;

    public int textureId;

    public final int width;

    public final boolean yuvFrame;

    public ByteBuffer[] yuvPlanes;

    public final int[] yuvStrides;

    MyI420Frame(int width, int height, int rotation, int textureId,
        float[] samplingMatrix) {
      this.width = width;
      this.height = height;
      this.yuvStrides = null;
      this.yuvPlanes = null;
      this.samplingMatrix = samplingMatrix;
      this.textureId = textureId;
      this.yuvFrame = false;
      this.rotationDegree = rotation;
      if (rotation % 90 != 0) {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Rotation degree not multiple of 90: ");
        stringBuilder.append(rotation);
        throw new IllegalArgumentException(stringBuilder.toString());
      }
    }

    MyI420Frame(int width, int height, int rotation,
        int[] yuvStrides, ByteBuffer[] yuvPlanes) {
      this.width = width;
      this.height = height;
      this.yuvStrides = yuvStrides;
      this.yuvPlanes = yuvPlanes;
      this.yuvFrame = true;
      this.rotationDegree = rotation;
      if (rotation % 90 != 0) {
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("Rotation degree not multiple of 90: ");
        stringBuilder.append(rotation);
        throw new IllegalArgumentException(stringBuilder.toString());
      }
      this.samplingMatrix = new float[] {
          1.0F, 0.0F, 0.0F, 0.0F, 0.0F, -1.0F, 0.0F, 0.0F, 0.0F, 0.0F,
          1.0F, 0.0F, 0.0F, 1.0F, 0.0F, 1.0F
      };
    }

    public int rotatedHeight() {
      int i;
      if (this.rotationDegree % 180 == 0) {
        i = this.height;
      } else {
        i = this.width;
      }
      return i;
    }

    public int rotatedWidth() {
      int i;
      if (this.rotationDegree % 180 == 0) {
        i = this.width;
      } else {
        i = this.height;
      }
      return i;
    }

    public String toString() {
      StringBuilder stringBuilder = new StringBuilder();
      stringBuilder.append(this.width);
      stringBuilder.append("x");
      stringBuilder.append(this.height);
      stringBuilder.append(":");
      stringBuilder.append(this.yuvStrides[0]);
      stringBuilder.append(":");
      stringBuilder.append(this.yuvStrides[1]);
      stringBuilder.append(":");
      stringBuilder.append(this.yuvStrides[2]);
      return stringBuilder.toString();
    }
  }

  public static class YuvImageRenderer implements IVideoSink {
    // |surface| is synchronized on |this|.
    private GLSurfaceView surface;
    private int id;
    // TODO(magjed): Delete GL resources in release(). Must be synchronized with draw(). We are
    // currently leaking resources to avoid a rare crash in release() where the EGLContext has
    // become invalid beforehand.
    public int[] yuvTextures = { 0, 0, 0 };
    private final YuvUploader yuvUploader = new YuvUploader();
    private final RendererCommon.GlDrawer drawer;
    // Resources for making a deep copy of incoming OES texture frame.
    public GlTextureFrameBuffer textureCopy;

    // Pending frame to render. Serves as a queue with size 1. |pendingFrame| is accessed by two
    // threads - frames are received in renderFrame() and consumed in draw(). Frames are dropped in
    // renderFrame() if the previous frame has not been rendered yet.
    private MyI420Frame pendingFrame;
    private final Object pendingFrameLock = new Object();

    // Type of video frame used for recent frame rendering.
    public static enum RendererType {
      RENDERER_YUV, RENDERER_TEXTURE
    }

    public RendererType rendererType;
    public RendererCommon.ScalingType scalingType;
    private boolean mirror;
    private RendererCommon.RendererEvents rendererEvents;
    // Flag if renderFrame() was ever called.
    boolean seenFrame;

    private int mBufferType = -1;

    private int mPixelFormat = -1;
    // Total number of video frames received in renderFrame() call.
    private int framesReceived;
    // Number of video frames dropped by renderFrame() because previous
    // frame has not been rendered yet.
    private int framesDropped;
    // Number of rendered video frames.
    private int framesRendered;
    // Time in ns when the first video frame was rendered.
    private long startTimeNs = -1;
    // Time in ns spent in draw() function.
    private long drawTimeNs;
    // Time in ns spent in draw() copying resources from |pendingFrame| - including uploading frame
    // data to rendering planes.
    private long copyTimeNs;
    // The allowed view area in percentage of screen size.
    private final Rect layoutInPercentage;
    // The actual view area in pixels. It is a centered subrectangle of the rectangle defined by
    // |layoutInPercentage|.
    public final Rect displayLayout = new Rect();
    // Cached layout transformation matrix, calculated from current layout parameters.
    private float[] layoutMatrix;
    // Flag if layout transformation matrix update is needed.
    private boolean updateLayoutProperties;
    // Layout properties update lock. Guards |updateLayoutProperties|, |screenWidth|,
    // |screenHeight|, |videoWidth|, |videoHeight|, |rotationDegree|, |scalingType|, and |mirror|.
    private final Object updateLayoutLock = new Object();
    // Texture sampling matrix.
    private float[] rotatedSamplingMatrix;
    // Viewport dimensions.
    private int screenWidth;
    private int screenHeight;

    // Video dimension.
    private int videoWidth;
    private int videoHeight;

    // This is the degree that the frame should be rotated clockwisely to have
    // it rendered up right.
    private int rotationDegree;

    private boolean mStarted = false;

    private EglBase.Context mEglContext;

    protected YuvImageRenderer(GLSurfaceView surface, int id, int x, int y, int width, int height,
        RendererCommon.ScalingType scalingType, boolean mirror, RendererCommon.GlDrawer drawer) {
      _log.i("YuvImageRenderer.Create id: " + id);
      this.surface = surface;
      this.id = id;
      this.scalingType = scalingType;
      this.mirror = mirror;
      this.drawer = drawer;
      layoutInPercentage = new Rect(x, y, Math.min(100, x + width), Math.min(100, y + height));
      updateLayoutProperties = false;
      rotationDegree = 0;
    }

    private void createTextures() {
      _log.i("  YuvImageRenderer.createTextures " + id + " on GL thread:"
          + Thread.currentThread().getId());

      // Generate 3 texture ids for Y/U/V and place them into |yuvTextures|.
      for (int i = 0; i < 3; i++) {
        yuvTextures[i] = GlUtil.generateTexture(GLES20.GL_TEXTURE_2D);
      }
      // Generate texture and framebuffer for offscreen texture copy.
      textureCopy = new GlTextureFrameBuffer(GLES20.GL_RGB);
    }

    private void logStatistics() {
      long timeSinceFirstFrameNs = System.nanoTime() - startTimeNs;
      _log.i("ID: " + id + ". Type: " + rendererType + ". Frames received: "
          + framesReceived + ". Dropped: " + framesDropped + ". Rendered: " + framesRendered);
      if (framesReceived > 0 && framesRendered > 0) {
        _log.i("Duration: " + (int) (timeSinceFirstFrameNs / 1e6) + " ms. FPS: "
            + framesRendered * 1e9 / timeSinceFirstFrameNs);
        _log.i("Draw time: " + (int) (drawTimeNs / (1000 * framesRendered))
            + " us. Copy time: " + (int) (copyTimeNs / (1000 * framesReceived)) + " us");
      }
    }

    private synchronized void release() {
      surface = null;
      synchronized (pendingFrameLock) {
        if (pendingFrame != null) {
          renderFrameDone(pendingFrame);
          pendingFrame = null;
        }
      }
    }

    private void setSize(final int videoWidth, final int videoHeight, final int rotation) {
      if (videoWidth == this.videoWidth && videoHeight == this.videoHeight
          && rotation == rotationDegree) {
        return;
      }
      if (rendererEvents != null) {
        _log.i("ID: " + id + ". Reporting frame resolution changed to " + videoWidth + " x "
            + videoHeight);
        rendererEvents.onFrameResolutionChanged(videoWidth, videoHeight, rotation);
      }

      synchronized (updateLayoutLock) {
        _log.i("ID: " + id + ". YuvImageRenderer.setSize: " + videoWidth + " x "
            + videoHeight + " rotation " + rotation);

        this.videoWidth = videoWidth;
        this.videoHeight = videoHeight;
        rotationDegree = rotation;
        updateLayoutProperties = true;
        _log.i("ID: " + id + ". YuvImageRenderer.setSize done.");
      }
    }

    private void updateLayoutMatrix() {
      synchronized (updateLayoutLock) {
        if (!updateLayoutProperties) {
          return;
        }
        // Initialize to maximum allowed area. Round to integer coordinates inwards the layout
        // bounding box (ceil left/top and floor right/bottom) to not break constraints.
        displayLayout.set((screenWidth * layoutInPercentage.left + 99) / 100,
            (screenHeight * layoutInPercentage.top + 99) / 100,
            (screenWidth * layoutInPercentage.right) / 100,
            (screenHeight * layoutInPercentage.bottom) / 100);
        _log.i("ID: " + id + ". AdjustTextureCoords. Allowed display size: "
            + displayLayout.width() + " x " + displayLayout.height() + ". Video: " + videoWidth
            + " x " + videoHeight + ". Rotation: " + rotationDegree + ". Mirror: " + mirror);
        final float videoAspectRatio = (rotationDegree % 180 == 0)
            ? (float) videoWidth / videoHeight
            : (float) videoHeight / videoWidth;
        // Adjust display size based on |scalingType|.
        final Point displaySize = RendererCommon.getDisplaySize(
            scalingType, videoAspectRatio, displayLayout.width(), displayLayout.height());
        displayLayout.inset((displayLayout.width() - displaySize.x) / 2,
            (displayLayout.height() - displaySize.y) / 2);
        _log.i(
            "ID: "
                + id
                + ". Adjusted display size: "
                + displayLayout.width()
                + " x "
                + displayLayout.height());
        layoutMatrix = RendererCommon.getLayoutMatrix(
            mirror, videoAspectRatio, (float) displayLayout.width() / displayLayout.height());
        updateLayoutProperties = false;
        _log.i("ID: " + id + ". AdjustTextureCoords done");
      }
    }

    /**
     * 声网接口回调
     */
    @Override
    public void consumeByteArrayFrame(byte[] data, int format, int width,
        int height, int rotation, long ts) {
      //_log.d("ID: " + id + ". consumeByteArrayFrame:" + format);
      if (format == MediaIO.PixelFormat.I420.intValue()) {
        if (data != null && data.length != 0) {
          JavaI420Buffer buffer = JavaI420Buffer.createYUV(data, width, height);
          if (buffer != null) {
            if (buffer != null) {
              int strideY = buffer.getStrideY();
              int strideU = buffer.getStrideU();
              int strideV = buffer.getStrideV();
              ByteBuffer byteBufferY = buffer.getDataY();
              ByteBuffer byteBufferU = buffer.getDataU();
              ByteBuffer byteBufferV = buffer.getDataV();
              renderFrame(new MyI420Frame(width, height, rotation,
                  new int[] { strideY, strideU, strideV },
                  new ByteBuffer[] { byteBufferY, byteBufferU, byteBufferV }));
              buffer.release();
            }
          }
        }
      } else if (format == MediaIO.PixelFormat.RGBA.intValue()
          && data != null
          && data.length != 0) {
        /*new VideoFrame(
            new RgbaBuffer(ByteBuffer.wrap(data), width, height, new Runnable() {
              public void run() {
              }
            }), rotation, ts);*/
      }
    }

    /**
     * 声网接口回调
     */
    @Override
    public void consumeByteBufferFrame(ByteBuffer data, int format, int width,
        int height, int rotation, long ts) {
      //_log.d("ID: " + id + ". consumeByteBufferFrame:" + format);
      if (format == MediaIO.PixelFormat.I420.intValue()) {
        if (data != null) {
          byte[] tmp = new byte[data.remaining()];
          data.get(tmp, 0, tmp.length);
          JavaI420Buffer buffer = JavaI420Buffer.createYUV(tmp, width, height);
          if (buffer != null) {
            int strideY = buffer.getStrideY();
            int strideU = buffer.getStrideU();
            int strideV = buffer.getStrideV();
            ByteBuffer byteBufferY = buffer.getDataY();
            ByteBuffer byteBufferU = buffer.getDataU();
            ByteBuffer byteBufferV = buffer.getDataV();
            renderFrame(new MyI420Frame(width, height, rotation,
                new int[] { strideY, strideU, strideV },
                new ByteBuffer[] { byteBufferY, byteBufferU, byteBufferV }));
            buffer.release();
          }
        }
      } else if (format == MediaIO.PixelFormat.RGBA.intValue()) {
        /*new VideoFrame(new RgbaBuffer(data, width, height, new Runnable() {
          @Override
          public void run() {

          }
        }), rotation, ts);*/
      }
    }

    /**
     * 声网接口回调
     */
    @Override
    public void consumeTextureFrame(int texId, int format, int width, int height, int rotation,
        long ts, float[] matrix) {
      //_log.d("ID: " + id + ". consumeTextureFrame:" + texId);
      /**
       * 向pendingFrame队列插入数据
       */
      renderFrame(new MyI420Frame(width, height, rotation, texId, matrix));
    }

    public void draw() {//消费pendingFrame队列数据
      float[] texMatrix = prepareTextures();
      if (texMatrix == null) {
        return;
      }
      // OpenGL defaults to lower left origin - flip viewport position vertically.
      final int viewportY = screenHeight - displayLayout.bottom;

      // for the local video, renderType is yuv,
      // for the remote video, render type will be rgb
      if (rendererType == RendererType.RENDERER_YUV) {
        drawer.drawYuv(yuvTextures, texMatrix, videoWidth, videoHeight, displayLayout.left,
            viewportY, displayLayout.width(), displayLayout.height());
      } else {
        drawer.drawRgb(textureCopy.getTextureId(), texMatrix, videoWidth, videoHeight,
            displayLayout.left, viewportY, displayLayout.width(), displayLayout.height());
      }
    }

    public int getBufferType() {
      _log.e("ID: " + id + ". getBufferType");
      return this.mBufferType;
    }

    public long getEGLContextHandle() {
      _log.e("ID: " + id + " .getEGLContextHandle");
      return mEglContext.getNativeEglContext();
    }

    public int getPixelFormat() {
      return this.mPixelFormat;
    }

    /** Releases GLSurfaceView video renderer. */
    public void onDispose() {
      _log.e("ID: " + id + ". onDispose");
    }

    public boolean onInitialize() {
      _log.e("ID: " + id + ". onInitialize");
      return true;
    }

    public boolean onStart() {
      _log.e("ID: " + id + ". onStart");
      this.mStarted = true;
      return true;
    }

    public void onStop() {
      _log.e("ID: " + id + ". onStop");
      this.mStarted = false;
    }

    public float[] prepareTextures() {
      if (!seenFrame) {
        // No frame received yet - nothing to render.
        return null;
      }
      long now = System.nanoTime();
      boolean isNewFrame;//上一帧是否已绘制完成
      synchronized (pendingFrameLock) {
        isNewFrame = (pendingFrame != null);
        if (isNewFrame && startTimeNs == -1) {
          startTimeNs = now;
        }

        if (isNewFrame) {//上一帧已绘制完成,将新的数据拷贝的textureCopy中,否则使用textureCopy内的缓存
          rotatedSamplingMatrix = RendererCommon.rotateTextureMatrix(
              pendingFrame.samplingMatrix, pendingFrame.rotationDegree);
          if (pendingFrame.yuvFrame) {

            yuvTextures = yuvUploader.uploadYuvData(pendingFrame.width, pendingFrame.height,
                pendingFrame.yuvStrides, pendingFrame.yuvPlanes);

            textureCopy.setSize(pendingFrame.rotatedWidth(), pendingFrame.rotatedHeight());
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, textureCopy.getFrameBufferId());
            GlUtil.checkNoGLES2Error("ID: " + id + ". glBindFramebuffer");
            // Copy the OES texture content. This will also normalize the sampling matrix.
            drawer.drawYuv(yuvTextures, rotatedSamplingMatrix, textureCopy.getWidth(),
                textureCopy.getHeight(), 0, 0, textureCopy.getWidth(), textureCopy.getHeight());
            rotatedSamplingMatrix = RendererCommon.identityMatrix();
            rendererType = RendererType.RENDERER_TEXTURE;
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0);
            GLES20.glFinish();
          } else {
            rendererType = RendererType.RENDERER_TEXTURE;
            // External texture rendering. Make a deep copy of the external texture.
            // Reallocate offscreen texture if necessary.
            textureCopy.setSize(pendingFrame.rotatedWidth(), pendingFrame.rotatedHeight());

            // Bind our offscreen framebuffer.
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, textureCopy.getFrameBufferId());
            GlUtil.checkNoGLES2Error("ID: " + id + ". glBindFramebuffer");
            // Copy the OES texture content. This will also normalize the sampling matrix.
            synchronized (KCompositiveVideoSource.lock) {//与本地输入source纹理同步
              drawer.drawOes(pendingFrame.textureId, rotatedSamplingMatrix, textureCopy.getWidth(),
                  textureCopy.getHeight(), 0, 0, textureCopy.getWidth(), textureCopy.getHeight());
            }
            rotatedSamplingMatrix = RendererCommon.identityMatrix();

            // Restore normal framebuffer.
            GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0);
            GLES20.glFinish();
          }
          copyTimeNs += (System.nanoTime() - now);
          renderFrameDone(pendingFrame);
          pendingFrame = null;
        }
      }

      updateLayoutMatrix();
      float[] texMatrix =
          RendererCommon.multiplyMatrices(rotatedSamplingMatrix, layoutMatrix);

      return texMatrix;
    }

    /**
     * 向pendingFrame队列插入数据,并且调用GLSurfaceView的requestRender通知刷新消费pendingFrame
     */
    public synchronized void renderFrame(MyI420Frame frame) {
      if (surface == null) {
        // This object has been released.
        renderFrameDone(frame);
        return;
      }
      if (renderFrameThread == null) {
        renderFrameThread = Thread.currentThread();
      }
      if (!seenFrame && rendererEvents != null) {
        _log.i("ID: " + id + ". Reporting first rendered frame.");
        rendererEvents.onFirstFrameRendered();
      }
      framesReceived++;
      synchronized (pendingFrameLock) {
        // Check input frame parameters.
        if (frame.yuvFrame) {
          if (frame.yuvStrides[0] < frame.width || frame.yuvStrides[1] < frame.width / 2
              || frame.yuvStrides[2] < frame.width / 2) {
            _log.i("Incorrect strides " + frame.yuvStrides[0] + ", " + frame.yuvStrides[1]
                + ", " + frame.yuvStrides[2]);
            renderFrameDone(frame);
            return;
          }
        }

        if (pendingFrame != null) {
          // Skip rendering of this frame if previous frame was not rendered yet.
          framesDropped++;
          renderFrameDone(frame);
          seenFrame = true;
          return;
        }
        pendingFrame = frame;
      }
      setSize(frame.width, frame.height, frame.rotationDegree);
      seenFrame = true;

      // Request rendering.
      surface.requestRender();
    }

    public static void renderFrameDone(MyI420Frame param1MyI420Frame) {
      param1MyI420Frame.yuvPlanes = null;
      param1MyI420Frame.textureId = 0;
    }

    public synchronized void reset() {
      seenFrame = false;
    }

    public void setBufferType(MediaIO.BufferType bufferType) {
      mBufferType = bufferType.intValue();
    }

    public void setPixelFormat(MediaIO.PixelFormat pixelFormat) {
      mPixelFormat = pixelFormat.intValue();
    }

    public void setPosition(int x, int y, int width, int height,
        RendererCommon.ScalingType scalingType, boolean mirror) {
      final Rect layoutInPercentage =
          new Rect(x, y, Math.min(100, x + width), Math.min(100, y + height));
      synchronized (updateLayoutLock) {
        if (layoutInPercentage.equals(this.layoutInPercentage) && scalingType == this.scalingType
            && mirror == this.mirror) {
          return;
        }
        _log.i("ID: " + id + ". YuvImageRenderer.setPosition: (" + x + ", " + y + ") "
            + width + " x " + height + ". Scaling: " + scalingType + ". Mirror: " + mirror);
        layoutInPercentage.set(layoutInPercentage);
        this.scalingType = scalingType;
        this.mirror = mirror;
        updateLayoutProperties = true;
      }
    }

    public void setScreenSize(final int screenWidth, final int screenHeight) {
      synchronized (updateLayoutLock) {
        if (screenWidth == this.screenWidth && screenHeight == this.screenHeight) {
          return;
        }
        _log.e("ID: " + id + ". YuvImageRenderer.setScreenSize: " + screenWidth + " x "
            + screenHeight);
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        updateLayoutProperties = true;
      }
    }

    public void setmEglContext(EglBase.Context param1Context) {
      this.mEglContext = param1Context;
    }
  }

  private static class YuvUploader {
    private ByteBuffer copyBuffer;

    private int[] yuvTextures;

    private YuvUploader() {
    }

    public int[] getYuvTextures() {
      return this.yuvTextures;
    }

    public void release() {
      this.copyBuffer = null;
      if (this.yuvTextures != null) {
        GLES20.glDeleteTextures(3, this.yuvTextures, 0);
        this.yuvTextures = null;
      }
    }

    public int[] uploadFromBuffer(
        VideoFrame.I420Buffer param1I420Buffer) {
      int k = param1I420Buffer.getStrideY();
      int i = param1I420Buffer.getStrideU();
      int j = param1I420Buffer.getStrideV();
      ByteBuffer byteBuffer1 = param1I420Buffer.getDataY();
      ByteBuffer byteBuffer3 = param1I420Buffer.getDataU();
      ByteBuffer byteBuffer2 = param1I420Buffer.getDataV();
      return uploadYuvData(param1I420Buffer.getWidth(),
          param1I420Buffer.getHeight(), new int[] { k, i, j },
          new ByteBuffer[] {
              byteBuffer1, byteBuffer3, byteBuffer2
          });
    }

    public int[] uploadYuvData(int width, int height,
        int[] strides,
        ByteBuffer[] planes) {
      final int[] planeWidths = new int[] { width, width / 2, width / 2 };
      final int[] planeHeights = new int[] { height, height / 2, height / 2 };

      // Make a first pass to see if we need a temporary copy buffer.
      int copyCapacityNeeded = 0;
      for (int i = 0; i < 3; ++i) {
        if (strides[i] > planeWidths[i]) {
          copyCapacityNeeded = Math.max(copyCapacityNeeded, planeWidths[i] * planeHeights[i]);
        }
      }
      // Allocate copy buffer if necessary.
      if (copyCapacityNeeded > 0
          && (copyBuffer == null || copyBuffer.capacity() < copyCapacityNeeded)) {
        copyBuffer = ByteBuffer.allocateDirect(copyCapacityNeeded);
      }

      if (this.yuvTextures == null) {
        this.yuvTextures = new int[3];
        for (int i = 0; i < 3; i++)
          this.yuvTextures[i] =
              GlUtil.generateTexture(GLES20.GL_TEXTURE_2D);
      }
      for (int i = 0; i < 3; i++) {
        ByteBuffer byteBuffer;
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, this.yuvTextures[i]);
        if (strides[i]
            == planeWidths[i]) {
          byteBuffer = planes[i];
        } else {
          byteBuffer = this.copyBuffer;
        }
        GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_LUMINANCE, planeWidths[i],
            planeHeights[i], 0, GLES20.GL_LUMINANCE, GLES20.GL_UNSIGNED_BYTE, byteBuffer);
      }
      return this.yuvTextures;
    }
  }

  public synchronized EglBase.Context getEglBaseContext() {
    return eglContext;
  }

  /** Releases GLSurfaceView video renderer. */
  public synchronized void dispose() {
    _log.d("VideoRendererHelper.dispose");
    synchronized (yuvImageRenderers) {
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        yuvImageRenderer.release();
      }
      yuvImageRenderers.clear();
    }
    renderFrameThread = null;
    drawThread = null;
    surface = null;
    eglContext = null;
    eglContextReady = null;
    if (drawer != null) {
      drawer.release();
    }
  }

  protected RendererCommon.GlDrawer createDrawer() {
    return new GlRectBlendDrawer();
  }

  public synchronized YuvImageRenderer createGuiRenderer(
      int x, int y, int width, int height, RendererCommon.ScalingType scalingType, boolean mirror) {
    if (drawer == null) {
      drawer = createDrawer();
    }
    return createGuiRenderer(x, y, width, height, scalingType, mirror, drawer);
  }

  /**
   * Creates VideoRenderer.Callbacks with top left corner at (x, y) and resolution (width, height).
   * All parameters are in percentage of screen resolution. The custom |drawer| will be used for
   * drawing frames on the EGLSurface. This class is responsible for calling release() on |drawer|.
   */
  private synchronized YuvImageRenderer createGuiRenderer(int x, int y, int width, int height,
      RendererCommon.ScalingType scalingType, boolean mirror,
      RendererCommon.GlDrawer drawer) {
    // Check display region parameters.
    if (x < 0 || x > 100 || y < 0 || y > 100 || width < 0 || width > 100 || height < 0
        || height > 100 || x + width > 100 || y + height > 100) {
      throw new RuntimeException("Incorrect window parameters.");
    }

    final YuvImageRenderer yuvImageRenderer = new YuvImageRenderer(surface,
        yuvImageRenderers.size(), x, y, width, height, scalingType, mirror, drawer);

    if (onSurfaceCreatedCalled) {
      // onSurfaceCreated has already been called for VideoRendererHelper -
      // need to create texture for new image and add image to the
      // rendering list.
      _log.e("createGuiRenderer onSurfaceCreatedCalled");
      final CountDownLatch countDownLatch = new CountDownLatch(1);
      surface.queueEvent(new Runnable() {
        @Override
        public void run() {
          _log.e("createGuiRenderer in surfaceThread");
          yuvImageRenderer.createTextures();
          yuvImageRenderer.setScreenSize(screenWidth, screenHeight);
          countDownLatch.countDown();
        }
      });
      // Wait for task completion.
      try {
        countDownLatch.await();
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
    synchronized (yuvImageRenderers) {
      _log.e("createGuiRenderer get yuvImageRenderers lock success");
      // Add yuv renderer to rendering list.
      yuvImageRenderers.add(yuvImageRenderer);
    }
    return yuvImageRenderer;
  }

  public synchronized void update(VideoRenderer.Callbacks renderer, int x, int y, int width,
      int height, RendererCommon.ScalingType scalingType, boolean mirror) {
    _log.d("VideoRendererHelper.update");
    synchronized (yuvImageRenderers) {
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        if (yuvImageRenderer == renderer) {
          yuvImageRenderer.setPosition(x, y, width, height, scalingType, mirror);
        }
      }
    }
  }

  public synchronized void setRendererEvents(
      VideoRenderer.Callbacks renderer, RendererCommon.RendererEvents rendererEvents) {
    _log.d("VideoRendererHelper.setRendererEvents");

    synchronized (yuvImageRenderers) {
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        if (yuvImageRenderer == renderer) {
          yuvImageRenderer.rendererEvents = rendererEvents;
        }
      }
    }
  }

  public synchronized void remove(VideoRenderer.Callbacks renderer) {
    _log.d("VideoRendererHelper.remove");
    synchronized (yuvImageRenderers) {
      final int index = yuvImageRenderers.indexOf(renderer);
      if (index == -1) {
        _log.i("Couldn't remove renderer (not present in current list)");
      } else {
        yuvImageRenderers.remove(index).release();
      }
    }
  }

  public synchronized void reset(VideoRenderer.Callbacks renderer) {
    _log.d("VideoRendererHelper.reset");
    synchronized (yuvImageRenderers) {
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        if (yuvImageRenderer == renderer) {
          yuvImageRenderer.reset();
        }
      }
    }
  }

  private void printStackTrace(Thread thread, String threadName) {
    if (thread != null) {
      StackTraceElement[] stackTraces = thread.getStackTrace();
      if (stackTraces.length > 0) {
        _log.i(threadName + " stacks trace:");
        for (StackTraceElement stackTrace : stackTraces) {
          _log.i(stackTrace.toString());
        }
      }
    }
  }

  public void onDrawFrame(GL10 paramGL10) {
    if (drawThread == null) {
      drawThread = Thread.currentThread();
    }
    //_log.d("onDrawFrame start");
    GLES20.glViewport(0, 0, screenWidth, screenHeight);
    GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
    GLES20.glClearColor(0.2f, 0.2f, 0.2f, 1.0f);

    synchronized (yuvImageRenderers) {
      //_log.d("onDrawFrame get yuvImageRenderers lock ,size = " + yuvImageRenderers.size());
      if (isBlend && yuvImageRenderers.size() > 1) {
        float[] texMatrix = null;
        for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
          float[] texMatrix1 = yuvImageRenderer.prepareTextures();
          if (texMatrix1 != null && texMatrix == null) {
            texMatrix = texMatrix1;
          }
        }
        if (texMatrix != null) {
          //_log.d("onDrawFrame blead");
          drawBlend(yuvImageRenderers.get(0), yuvImageRenderers.get(1), texMatrix);
          /*if (isSnapshot) {
            _log.e("start snapshot");
            isSnapshot = false;
            android.opengl.EGLContext eglContext = EGL14.eglGetCurrentContext();
            EGLDisplay eglDisplay = EGL14.eglGetCurrentDisplay();
            EGLSurface eglSurface = EGL14.eglGetCurrentSurface(EGL14.EGL_DRAW);
            mScreenshotEglCore.makeCurrent();
            drawBlend(yuvImageRenderers.get(0), yuvImageRenderers.get(1), texMatrix);
            mScreenshotEglCore.swapBuffers();
            _log.e("end snapshot");
            if (!EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface,
                eglContext)) {//绘制完成切换回默认的Context
              throw new RuntimeException(
                  "eglMakeCurrent failed: 0x" + Integer.toHexString(EGL14.eglGetError()));
            }
          }*/
        }
      } else {
        //_log.d("onDrawFrame not blend size = " + yuvImageRenderers.size());
        for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
          yuvImageRenderer.draw();
        }
      }
    }
    if (isSnapshot) {
      isSnapshot = false;
      saveFrame(screenWidth, screenHeight);
    }
  }

  protected void saveFrame(int width, int height) {
    IntBuffer ib = IntBuffer.allocate(width * height);
    GLES20.glReadPixels(0, 0, width, height, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, ib);
    Bitmap result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
    result.copyPixelsFromBuffer(IntBuffer.wrap(ib.array()));

    Matrix m = new Matrix();
    m.setRotate(180, (float) width / 2, (float) height / 2);
    result = Bitmap.createBitmap(result, 0, 0, result.getWidth(), result.getHeight(), m, true);

    File f =
        new File(Utils.getSnapshotDir(surface.getContext()), System.currentTimeMillis() + ".png");
    FileOutputStream out = null;
    try {
      out = new FileOutputStream(f);
      result.compress(Bitmap.CompressFormat.PNG, 90, out);
      mUIHandler.post(new Runnable() {
        @Override
        public void run() {
          Toast.makeText(surface.getContext(), "截图成功", Toast.LENGTH_SHORT).show();
        }
      });
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } finally {
      try {
        out.flush();
      } catch (IOException e) {
        e.printStackTrace();
      }
      try {
        out.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }

  @Override
  public void onImageAvailable(ImageReader reader) {
    _log.d("onImageAvailable:" + reader.getImageFormat());
    Image img = null;
    try {
      img = reader.acquireLatestImage();
      if (img != null) {
        if (img.getFormat() != PixelFormat.RGBA_8888) {
          _log.e("the image format must be rgba, but it is %d", img.getFormat());
          return;
        }

        Image.Plane[] planes = img.getPlanes();
        if (planes.length != 1) {
          _log.e("the image planes count must be 1, but it is %d", planes.length);
          return;
        }
        final ByteBuffer buffer = planes[0].getBuffer();
        int pixelStride = planes[0].getPixelStride();
        int rowStride = planes[0].getRowStride();
        int rowPadding = rowStride - pixelStride * img.getWidth();

        // create bitmap
        Bitmap bmp = Bitmap.createBitmap(img.getWidth() + rowPadding / pixelStride,
            img.getHeight(), Bitmap.Config.ARGB_8888);
        bmp.copyPixelsFromBuffer(buffer);

        Bitmap result = Bitmap.createBitmap(bmp, 0, 0, img.getWidth(), img.getHeight());

        File f =
            new File(Utils.getSnapshotDir(surface.getContext()),
                System.currentTimeMillis() + ".png");
        FileOutputStream out = null;
        try {
          out = new FileOutputStream(f);
          result.compress(Bitmap.CompressFormat.PNG, 90, out);
          mUIHandler.post(new Runnable() {
            @Override
            public void run() {
              Toast.makeText(surface.getContext(), "截图成功", Toast.LENGTH_SHORT).show();
            }
          });
        } catch (FileNotFoundException e) {
          e.printStackTrace();
        } finally {
          try {
            out.flush();
          } catch (IOException e) {
            e.printStackTrace();
          }
          try {
            out.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }

        if (result != null) {
          result.recycle();
        }
        if (bmp != null) {
          bmp.recycle();
        }
      }
    } catch (Exception e) {
      _log.e("screenshot onImageAvailable exception = "
          + e.getClass().getSimpleName()
          + " : "
          + e.getMessage());
    } finally {
      if (img != null) {
        img.close();
      }
    }
  }

  public void onSurfaceChanged(GL10 paramGL10, int width, int height) {
    _log.i("VideoRendererHelper.onSurfaceChanged: " + width + " x " + height + "  ");
    screenWidth = width;
    screenHeight = height;

    mScreenshotThread = new HandlerThread("screenshotThread");
    mScreenshotThread.start();
    mScreenshotHandler = new Handler(mScreenshotThread.getLooper());
    mImageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2);
    mImageReader.setOnImageAvailableListener(this, mScreenshotHandler);
    mScreenshotSurface = mImageReader.getSurface();
    mScreenshotEglCore = (EglBase14) EglBase.create(eglContext, EglBase.CONFIG_PLAIN);
    mScreenshotEglCore.createSurface(mScreenshotSurface);

    synchronized (yuvImageRenderers) {
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        yuvImageRenderer.setScreenSize(screenWidth, screenHeight);
      }
    }
  }

  public void onSurfaceCreated(GL10 paramGL10, EGLConfig paramEGLConfig) {
    _log.i("VideoRendererHelper.onSurfaceCreated");
    // Store render EGL context.
    synchronized (MixVideoHelper.class) {
      if (EglBase14.isEGL14Supported()) {
        eglContext = new EglBase14.Context(EGL14.eglGetCurrentContext());
      } else {
        eglContext = new EglBase10.Context(((EGL10) EGLContext.getEGL()).eglGetCurrentContext());
      }

      _log.i("VideoRendererHelper EGL Context: " + eglContext);
    }

    synchronized (yuvImageRenderers) {
      // Create textures for all images.
      for (YuvImageRenderer yuvImageRenderer : yuvImageRenderers) {
        yuvImageRenderer.createTextures();
      }
      onSurfaceCreatedCalled = true;
    }
    GlUtil.checkNoGLES2Error("onSurfaceCreated done");
    GLES20.glPixelStorei(GLES20.GL_UNPACK_ALIGNMENT, 1);
    GLES20.glClearColor(0.15f, 0.15f, 0.15f, 1.0f);

    // Fire EGL context ready event.
    synchronized (MixVideoHelper.class) {
      if (eglContextReady != null) {
        eglContextReady.run();
      }
    }
  }

  private void drawBlend(YuvImageRenderer render1, YuvImageRenderer render2, float[] texMatrix) {
    final int viewportY = 0; //screenHeight - render1.displayLayout.bottom;
    Rect rect = new Rect(0, 0, screenWidth, screenHeight);
    // for the local video, renderType is yuv,
    // for the remote video, render type will be rgb
    GlRectBlendDrawer blendDrawer = (GlRectBlendDrawer) drawer;
    if (render1.rendererType == YuvImageRenderer.RendererType.RENDERER_YUV
        && render2.rendererType == YuvImageRenderer.RendererType.RENDERER_YUV) {
      blendDrawer.drawYuvYuv(render1.yuvTextures, render2.yuvTextures, texMatrix,
          rect.left, viewportY, rect.width(), rect.height());
    } else if (render1.rendererType == YuvImageRenderer.RendererType.RENDERER_YUV
        && render2.rendererType == YuvImageRenderer.RendererType.RENDERER_TEXTURE) {
      blendDrawer.drawYuvRgb(render1.yuvTextures, render2.textureCopy.getTextureId(), texMatrix,
          rect.left, viewportY, rect.width(), rect.height());
    } else if (render1.rendererType == YuvImageRenderer.RendererType.RENDERER_TEXTURE
        && render2.rendererType == YuvImageRenderer.RendererType.RENDERER_YUV) {
      blendDrawer.drawRgbYuv(render1.textureCopy.getTextureId(), render2.yuvTextures, texMatrix,
          rect.left, viewportY, rect.width(), rect.height());
    } else if (render1.rendererType == YuvImageRenderer.RendererType.RENDERER_TEXTURE
        && render2.rendererType == YuvImageRenderer.RendererType.RENDERER_TEXTURE) {
      blendDrawer.drawRgbRgb(render1.textureCopy.getTextureId(), render2.textureCopy.getTextureId(),
          texMatrix,
          rect.left, viewportY, rect.width(), rect.height());
    }
  }
}
