package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import android.opengl.Matrix;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import io.agora.rtc.gl.GlShader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.IdentityHashMap;
import java.util.Map;

/**
 * Created by shenjunwei on 2017/6/5.
 */

public class GLDrawer2D {
    private static final String TAG = "GLDrawer2D";
    private static final SdkLog _log = SdkLog.getLog(TAG);
    private static final String vss
            = "uniform mat4 uMVPMatrix;\n"
            + "uniform mat4 uTexMatrix;\n"
            + "attribute highp vec4 aPosition;\n"
            + "attribute highp vec4 aTextureCoord;\n"
            + "varying highp vec2 textureCoordinate;\n"
            + "\n"
            + "void main() {\n"
            + "	gl_Position = uMVPMatrix * aPosition;\n"
            + "	textureCoordinate = (uTexMatrix * aTextureCoord).xy;\n"
            + "}\n";
    public static final String fss
            = "precision mediump float;\n"
            + "uniform sampler2D inputImageTexture;\n"
            + "varying highp vec2 textureCoordinate;\n"
            + "void main() {\n"
            + "  gl_FragColor = texture2D(inputImageTexture, textureCoordinate);\n"
            + "}";
    public static final String fss_oes
            = "#extension GL_OES_EGL_image_external : require\n"
            + "precision mediump float;\n"
            + "uniform samplerExternalOES inputImageTexture;\n"
            + "varying highp vec2 textureCoordinate;\n"
            + "void main() {\n"
            + "  gl_FragColor = texture2D(inputImageTexture, textureCoordinate);\n"
            + "}";

    protected final FloatBuffer pVertex;
    protected final FloatBuffer pTexCoord;
    protected final float[] mMvpMatrix = new float[16];

    public static final int FLOAT_SZ = Float.SIZE / 8;
    public static final int VERTEX_NUM = 4;
    public static final int VERTEX_SZ = VERTEX_NUM * 2;

    private static class Shader {
        public final GlShader glShader;
        public final int texMatrixLocation;
        public final int mvpMatrixLocation;

        public Shader(String fragmentShader) {
            this.glShader = new GlShader(vss, fragmentShader);
            this.texMatrixLocation = glShader.getUniformLocation("uTexMatrix");
            this.mvpMatrixLocation = glShader.getUniformLocation("uMVPMatrix");
        }
    }

    // The keys are one of the fragments shaders above.
    private final Map<String, Shader> shaders = new IdentityHashMap<String, Shader>();

    /**
     * Constructor
     * this should be called in GL context
     */
    public GLDrawer2D() {
        pVertex = ByteBuffer.allocateDirect(VERTEX_SZ * FLOAT_SZ)
                .order(ByteOrder.nativeOrder()).asFloatBuffer();
        pVertex.put(TextureRotationUtil.CUBE);
        pVertex.flip();
        pTexCoord = ByteBuffer.allocateDirect(VERTEX_SZ * FLOAT_SZ)
                .order(ByteOrder.nativeOrder()).asFloatBuffer();
        pTexCoord.put(TextureRotationUtil.getRotation(Rotation.NORMAL, false, false)).position(0);
        /*if(SizeUtils.isAndroidN()) {
            pTexCoord.put(TextureRotationUtil.getRotation(Rotation.ROTATION_90, false, true)).position(0);
        }else{
            pTexCoord.put(TextureRotationUtil.getRotation(Rotation.ROTATION_270, false, false)).position(0);
        }*/
    }

    private void drawRectangle() {
        // Draw quad.
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
    }

    private void prepareShader(String fragmentShader, float[] texMatrix, FloatBuffer textureBuffer, FloatBuffer cubeBuffer,
                               int sfactor,
                               int dfactor) {
        final Shader shader;
        if (shaders.containsKey(fragmentShader)) {
            shader = shaders.get(fragmentShader);
        } else {
            // Lazy allocation.
            shader = new Shader(fragmentShader);
            shaders.put(fragmentShader, shader);
            shader.glShader.useProgram();
            // Initialize fragment shader uniform values.
            if (fragmentShader == fss || fragmentShader == fss_oes) {
                GLES20.glUniform1i(shader.glShader.getUniformLocation("inputImageTexture"), 0);
            } else {
                throw new IllegalStateException("Unknown fragment shader: " + fragmentShader);
            }
            OpenGlUtils.checkGLError("Initialize fragment shader uniform values.");
            // Initialize vertex shader attributes.
            shader.glShader.setVertexAttribArray("aPosition", 2, cubeBuffer == null ? pVertex: cubeBuffer);
            shader.glShader.setVertexAttribArray("aTextureCoord", 2, textureBuffer == null ? pTexCoord : textureBuffer);
            Matrix.setIdentityM(mMvpMatrix, 0);
        }
        shader.glShader.useProgram();
        GLES20.glDisable(GLES20.GL_CULL_FACE);
        GLES20.glDisable(GLES20.GL_DEPTH_TEST);
        GLES20.glBlendFunc(sfactor, dfactor);
        GLES20.glEnable(GLES20.GL_BLEND);
        // Copy the texture transformation matrix over.
        if(texMatrix == null){
            texMatrix = OpenGlUtils.identityMatrix();
        }
        GLES20.glUniformMatrix4fv(shader.texMatrixLocation, 1, false, texMatrix, 0);
        GLES20.glUniformMatrix4fv(shader.mvpMatrixLocation, 1, false, mMvpMatrix, 0);
        if(textureBuffer != null){
            shader.glShader.setVertexAttribArray("aTextureCoord", 2, textureBuffer);
        }
        if(cubeBuffer != null){
            shader.glShader.setVertexAttribArray("aPosition", 2, cubeBuffer);
        }
    }

    public void drawOes(int oesTextureId, float[] texMatrix, FloatBuffer textureBuffer, final FloatBuffer cubeBuffer) {
        drawOes(oesTextureId, texMatrix, textureBuffer, cubeBuffer, GLES20.GL_ONE, GLES20.GL_ZERO);
    }
    /**
     * Draw an OES texture frame with specified texture transformation matrix. Required resources are
     * allocated at the first call to this function.
     */
    public void drawOes(int oesTextureId, float[] texMatrix, FloatBuffer textureBuffer, final FloatBuffer cubeBuffer,
                        int sfactor,
                        int dfactor) {
        prepareShader(fss_oes, texMatrix, textureBuffer, cubeBuffer, sfactor, dfactor);
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
        // updateTexImage() may be called from another thread in another EGL context, so we need to
        // bind/unbind the texture in each draw call so that GLES understads it's a new texture.
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTextureId);
        drawRectangle();
        GLES20.glDisable(GLES20.GL_BLEND);
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, 0);
    }

    public void drawRgb(int textureId, float[] texMatrix, FloatBuffer textureBuffer, final FloatBuffer cubeBuffer){
        drawRgb(textureId, texMatrix, textureBuffer, cubeBuffer, GLES20.GL_ONE, GLES20.GL_ZERO);
    }
    /**
     * Draw a RGB(A) texture frame with specified texture transformation matrix. Required resources
     * are allocated at the first call to this function.
     */
    public void drawRgb(int textureId, float[] texMatrix, FloatBuffer textureBuffer, final FloatBuffer cubeBuffer,
                        int sfactor,
                        int dfactor) {
        prepareShader(fss, texMatrix, textureBuffer, cubeBuffer,sfactor, dfactor);
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
        drawRectangle();
        // Unbind the texture as a precaution.
        GLES20.glDisable(GLES20.GL_BLEND);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }

    /**
     * terminatinng, this should be called in GL context
     */
    public void release() {
        for (Shader shader : shaders.values()) {
            shader.glShader.release();
        }
        shaders.clear();
    }

    /**
     * Set model/view/projection transform matrix
     * @param matrix
     * @param offset
     */
    public void setMatrix(final float[] matrix, final int offset) {
        if ((matrix != null) && (matrix.length >= offset + 16)) {
            System.arraycopy(matrix, offset, mMvpMatrix, 0, 16);
        } else {
            Matrix.setIdentityM(mMvpMatrix, 0);
        }
    }
}
