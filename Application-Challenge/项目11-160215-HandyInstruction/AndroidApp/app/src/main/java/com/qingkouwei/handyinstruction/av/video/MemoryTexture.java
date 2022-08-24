package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES20;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import com.qingkouwei.handyinstruction.av.util.Utils;
import java.nio.ByteBuffer;
import java.util.concurrent.CountDownLatch;

public class MemoryTexture {
    static private final SdkLog _log = SdkLog.getLog("MemoryTexture");
    static private final int Target = GLES20.GL_TEXTURE_2D;
    static private final int PixelFormat = GLES20.GL_RGBA;

    private int mTexId;
    private long mNativeHandle;
    private int mWidth = 0;
    private int mHeight = 0;
    private long fmtConverter = 0;

    public CountDownLatch mCountDownLatch;
    public ByteBuffer buffer;
    public int stride;
    public int sliceHeight;

    public static MemoryTexture create(int width, int height) {
        MemoryTexture inst = new MemoryTexture(width, height);
        if (!inst.create()) {
            _log.e("failed in MemoryTexture.create()");
            return null;
        }
        return inst;
    }

    private MemoryTexture(int width, int height) {
        _log.e("MemoryTexture:" + width + "*" + height);
        mWidth = width;
        mHeight = height;
        if(Utils.isAndroidN()){
            mCountDownLatch = new CountDownLatch(1);
        }
    }

    private boolean create() {
        if(!Utils.isAndroidN()) {
            createTexId(Target, PixelFormat, mWidth, mHeight);
            if (mTexId <= 0) {
                _log.e("failed in createTexId");
                return false;
            }

            mNativeHandle = nativeCreateTexNativeBuffer(mTexId, mWidth, mHeight);
            if (mNativeHandle == 0) {
                _log.i("failed in nativeCreateTexNativeBuffer, %d, %dx%d",
                        mTexId, mWidth, mHeight);
                return false;
            }
        }
        return true;
    }

    public int getTexId() {
        return mTexId;
    }

    public void destroy() {
        if(!Utils.isAndroidN()) {
            if (mNativeHandle != 0) {
                nativeDeleteTexNativeBuffer(mNativeHandle);
                mNativeHandle = 0;
            }
        }

        destroyTexId();
    }

    public int frameSize() {
        if (mNativeHandle == 0) {
            return 0;
        }
        return nativeTexNativeBufferFrameSize(mNativeHandle);
    }

    public int readPixel(ByteBuffer directBuffer) {
        if (mNativeHandle == 0) {
            return 0;
        }
        if (!directBuffer.isDirect()) {
            _log.e("readPixel buffer must be a direct buffer ");
            return 0;
        }

        return nativeTexNativeBufferReadPixel(mNativeHandle, directBuffer);
    }
    public int setTexturePixel(){
        if(mTexId <= 0){
            createTexId(Target, PixelFormat, stride, mHeight);
        }
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, mTexId);
        GLES20.glTexSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, stride,
                mHeight, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, buffer);
        return mTexId;
    }

    public int setPixel(ByteBuffer buffer,
                        int format,
                        int width, int height,
                        int stride, int sliceHeight) {
        return mTexId;

    }

    protected long getFmtConverter(int srcFmt,
                                      int srcWidth, int srcHeight) {
        return fmtConverter;
    }

    private void createTexId(int target, int pixelFormat, int width, int height) {
        final int[] tex = new int[1];
        GLES20.glGenTextures(1, tex, 0);
        GLES20.glBindTexture(target, tex[0]);
        GLES20.glTexParameteri(target,
                GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(target,
                GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(target,
                GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameteri(target,
                GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);

        GLES20.glTexImage2D(target, 0, pixelFormat, width, height, 0,
                pixelFormat, GLES20.GL_UNSIGNED_BYTE, null);
        mTexId = tex[0];
    }

    private void destroyTexId() {
        if (mTexId > 0) {
            final int[] tex = new int[1];
            tex[0] = mTexId;
            GLES20.glDeleteTextures(1, tex, 0);
        }
    }

    private native long nativeCreateTexNativeBuffer(int texId, int width, int height);
    private native void nativeDeleteTexNativeBuffer(long nativeHandle);
    private native int nativeTexNativeBufferFrameSize(long nativeHandle);
    private native int nativeTexNativeBufferStride(long nativeHandle);
    private native int nativeTexNativeBufferReadPixel(long nativeHandle, ByteBuffer directBuffer);
    private native int nativeTexNativeBufferSetPixel(long nativeHandle,
                                                     ByteBuffer directBuffer, int format,
                                                     int width, int height, int linesize, int sliceHeight,
                                                     long fmtConvert);
    private native int nativeTexNativeBufferSetPixelArray(long nativeHandle, byte[]buffer, int offset,
                                                          int format,
                                                          int width, int height, int linesize, int sliceHeight,
                                                          long fmtConvert);

}
