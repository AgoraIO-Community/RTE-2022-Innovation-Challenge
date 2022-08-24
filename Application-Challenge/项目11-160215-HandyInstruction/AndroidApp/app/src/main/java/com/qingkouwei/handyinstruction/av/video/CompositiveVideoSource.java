package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES20;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import com.qingkouwei.handyinstruction.av.util.Utils;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public abstract class CompositiveVideoSource extends VideoSource
    implements VideoSourceListener {

  static private final SdkLog _log = SdkLog.getLog("CompositiveVideoSource");

  protected List<VSHolder> subVideoSources = new ArrayList<VSHolder>();
  protected LinkedList<VSHolder> remvingVS = new LinkedList<VSHolder>();
  protected GLDrawer2D drawer;

  private FloatBuffer pTexCoord;
  private FloatBuffer pCubeCoord;

  public boolean onStart() {
    pTexCoord = ByteBuffer.allocateDirect(GLDrawer2D.VERTEX_SZ * GLDrawer2D.FLOAT_SZ)
        .order(ByteOrder.nativeOrder()).asFloatBuffer();

    pTexCoord.put(TextureRotationUtil.TEXTURE_NO_ROTATION);
    pTexCoord.flip();

    pCubeCoord = ByteBuffer.allocateDirect(GLDrawer2D.VERTEX_SZ * GLDrawer2D.FLOAT_SZ)
        .order(ByteOrder.nativeOrder()).asFloatBuffer();

    pCubeCoord.put(TextureRotationUtil.CUBE);
    pCubeCoord.flip();
    _log.i("onStart ok");
    return true;
  }

  public void onStop() {
    synchronized (subVideoSources) {
      for (VSHolder holder : subVideoSources) {
        synchronized (remvingVS) {
          holder.videoSource.stop();
          remvingVS.add(holder);
        }
      }
      subVideoSources.clear();
    }
    if (drawer != null) {
      drawer.release();
      drawer = null;
    }
    onDelVideoSources();
  }

  public void insertVideoSource(VideoSource videoSource,
      int left, int top, int right, int bottom,
      int index) {
    synchronized (subVideoSources) {
      if (getVSHolder(videoSource) != null) {
        return;
      }
      VSHolder holder = new VSHolder();
      holder.videoSource = videoSource;
      holder.left = left;
      holder.top = top;
      holder.right = right;
      holder.bottom = bottom;
      videoSource.setVideoSourceListener(this);
      subVideoSources.add(index, holder);
    }
  }

  public void addVideoSource(VideoSource videoSource, int left, int top, int right, int bottom) {
    insertVideoSource(videoSource, left, top, right, bottom, subVideoSources.size());
  }

  protected VSHolder getVSHolder(VideoSource videoSource) {
    for (VSHolder holder : subVideoSources) {
      if (holder.videoSource == videoSource) {
        return holder;
      }
    }
    return null;
  }

  public void delVideoSource(VideoSource videoSource) {
    VSHolder holder;
    synchronized (subVideoSources) {

      holder = getVSHolder(videoSource);
      if (holder != null) {
        subVideoSources.remove(holder);
      }
    }

    if (holder != null) {
      synchronized (remvingVS) {
        remvingVS.add(holder);
      }
    }
    onDelVideoSources();
  }

  protected void onDelVideoSources() {
    VSHolder holder = null;
    while (true) {
      synchronized (remvingVS) {
        if (remvingVS.size() > 0) {
          holder = remvingVS.pop();
        } else {
          holder = null;
        }
      }
      if (holder != null) {
        synchronized (holder) {
          if (holder.memTexture != null) {
            holder.memTexture.destroy();
            holder.memTexture = null;
          }
        }
      } else {
        break;
      }
    }
  }

  protected void drawSubVideoSources() {

    if (drawer == null) {
      drawer = new GLDrawer2D();
    }

    GLES20.glViewport(0, 0, videoSize.width, videoSize.height);
    synchronized (subVideoSources) {
      for (VSHolder holder : subVideoSources) {
        if ((holder.memTexture == null && holder.texID == 0) || !holder.hasData) {
          continue;
        }

        int texId = holder.texID;
        if (texId == 0) {
          texId = holder.memTexture.getTexId();
        }
        if (texId == 0) {
          continue;
        }
        pCubeCoord.put(holder.getVertexVec(videoSize.width, videoSize.height));
        pCubeCoord.flip();
        if (holder.videoSource instanceof CameraVideoSource) {
          pTexCoord.put(TextureRotationUtil.getRotation(Rotation.NORMAL, true, false));
          pTexCoord.flip();
        } else {
          pTexCoord.put(TextureRotationUtil.getRotation(Rotation.ROTATION_90, false, true));
          pTexCoord.flip();
        }
        synchronized (holder.videoSource.textureLock) {
          if (holder.isOES) {
            drawer.drawOes(texId,
                holder.mTexMatrix == null ? OpenGlUtils.identityMatrix() : holder.mTexMatrix,
                pTexCoord, pCubeCoord, GLES20.GL_SRC_ALPHA, GLES20.GL_DST_ALPHA);
          } else {
            drawer.drawRgb(texId,
                holder.mTexMatrix == null ? OpenGlUtils.identityMatrix() : holder.mTexMatrix,
                pTexCoord, pCubeCoord, GLES20.GL_SRC_ALPHA, GLES20.GL_DST_ALPHA);
          }
        }
        holder.videoSource.returnTextureFrame();
      }
    }
    OpenGlUtils.checkGLError("onDrawFrame");
  }

  // this callback is invoked from the VideoSourceListener
  // of the sub videoSources
  @Override
  public boolean onVideoFrame(VideoSource videoSource,
      ByteBuffer buffer,
      int width, int height,
      int[] stride,
      int sliceHeight,
      int pixelFormat) {

    VSHolder holder = null;
    synchronized (subVideoSources) {
      holder = getVSHolder(videoSource);
    }
    if (holder != null) {
      synchronized (holder) {
        if (holder.memTexture == null) {
          return true;
        }
        if (holder.toChangeSize) {
          return true;
        }
        if (Utils.isAndroidN()) {
          holder.memTexture.buffer = buffer;
          holder.memTexture.sliceHeight = sliceHeight;
          holder.memTexture.stride = stride[0];

          try {
            long s = System.currentTimeMillis();
            holder.memTexture.mCountDownLatch.await();
            _log.e("mCountDownLatch await time:" + (System.currentTimeMillis() - s));
            holder.hasData = true;
          } catch (InterruptedException e) {
            e.printStackTrace();
          }
        } else {
          holder.memTexture.setPixel(buffer, pixelFormat,
              width, height,
              stride[0], sliceHeight);
          holder.hasData = true;
        }
      }
    }
    return true;
  }

  @Override
  public boolean onVideoFrameTex(VideoSource videoSource, int tex, int width, int height) {
    VSHolder holder = null;
    synchronized (subVideoSources) {
      holder = getVSHolder(videoSource);
    }
    if (holder != null) {
      synchronized (holder) {
        if (holder.toChangeSize) {
          return true;
        }
      }
      holder.texID = tex;
      holder.isOES = false;
      holder.hasData = true;
      holder.width = width;
      holder.height = height;
    }
    return true;
  }

  @Override
  public boolean onVideoFrameTexOES(VideoSource videoSource, int tex, int width, int height,
      float[] mTexMatrix) {
    VSHolder holder = null;
    synchronized (subVideoSources) {
      holder = getVSHolder(videoSource);
    }
    if (holder != null) {
      synchronized (holder) {
        if (holder.toChangeSize) {
          return true;
        }
      }
      holder.texID = tex;
      holder.mTexMatrix = mTexMatrix;
      holder.isOES = true;
      holder.width = width;
      holder.height = height;
      holder.hasData = true;
    }
    return true;
  }

  @Override
  public void onVideoFrameCaptureError(VideoSource videoSource,
      int errCode) {

  }

  @Override
  public boolean onVideoFrame(ByteBuffer buffer,
      int width, int height,
      int[] stride,
      int sliceHeight,
      int pixelFormat) {

    return super.onVideoFrame(buffer, width, height, stride, sliceHeight, pixelFormat);
  }

  static protected class VSHolder {
    public VideoSource videoSource;
    public MemoryTexture memTexture;
    public boolean toChangeSize;
    public int texID;
    public float[] mTexMatrix;
    public int width, height;
    public boolean isOES = false;
    public boolean hasData;
    public int left, top, right, bottom;
    private float[] cachedVertexVec;
    private int cachedVideoWidth, cachedVideoHeight;

    public void setPosition(int l, int t, int r, int b) {
      synchronized (this) {
        left = l;
        top = t;
        right = r;
        bottom = b;
        cachedVertexVec = null;
      }
    }

    public float[] getVertexVec(int videoWidth, int videoHeight) {
      synchronized (this) {
        if (cachedVertexVec != null
            && videoWidth == cachedVideoWidth
            && videoHeight == cachedVideoHeight) {
          return cachedVertexVec;
        }
        //                _log.e("getVertexVec:left = " + left + ";right = " + right + ";top = " + top + ";bottom = " + bottom);
        float l = (float) left / (float) videoWidth * 2.0f - 1.0f,
            r = (float) right / (float) videoWidth * 2.0f - 1.0f,
            t = (float) top / (float) videoHeight * 2.0f - 1.0f,
            b = (float) bottom / (float) videoHeight * 2.0f - 1.0f;
        if (Utils.isAndroidN() || texID != 0) {
          t = 1.0f - (float) top / (float) videoHeight * 2.0f;
          b = 1.0f - (float) bottom / (float) videoHeight * 2.0f;
        }

        _log.e("getVertexVec:l = "
            + l
            + ";r = "
            + r
            + ";t = "
            + t
            + ";b = "
            + b
            + ";width:"
            + videoWidth
            + ";height:"
            + videoHeight);
        cachedVertexVec = new float[] {
            l, t,
            r, t,
            l, b,
            r, b
        };
        cachedVideoWidth = videoWidth;
        cachedVideoHeight = videoHeight;

        return cachedVertexVec;
      }
    }
  }
}
