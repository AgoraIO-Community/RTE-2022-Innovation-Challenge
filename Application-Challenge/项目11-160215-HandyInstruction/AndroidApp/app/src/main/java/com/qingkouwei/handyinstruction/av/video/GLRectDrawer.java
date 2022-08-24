package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import io.agora.rtc.gl.GlShader;
import io.agora.rtc.gl.GlUtil;
import io.agora.rtc.gl.RendererCommon;
import java.nio.FloatBuffer;
import java.util.IdentityHashMap;
import java.util.Map;

public class GLRectDrawer
    implements RendererCommon.GlDrawer {

  private static final String SHV_SET_STRING =
      "vec3 rgbtohsv(vec3 rgb) {                        \n"
          + "  float R = rgb.x;                               \n"
          + "  float G = rgb.y;                               \n"
          + "  float B = rgb.z;                               \n"
          + "  vec3 hsv;                                      \n"
          + "  float max1 = max(R, max(G, B));                \n"
          + "  float min1 = min(R, min(G, B));                \n"
          + "  if (R == max1) {                               \n"
          + "    hsv.x = (G - B) / (max1 - min1);             \n"
          + "  }                                              \n"
          + "  if (G == max1){                                \n"
          + "    hsv.x = 2.0 + (B - R) / (max1 - min1);       \n"
          + "  }                                              \n"
          + "  if (B == max1) {                               \n"
          + "    hsv.x = 4.0 + (R - G) / (max1 - min1);       \n"
          + "  }                                              \n"
          + "  hsv.x = hsv.x * 60.0;                          \n"
          + "  if (hsv.x < 0.0) {                             \n"
          + "    hsv.x = hsv.x + 360.0;                       \n"
          + "  }                                              \n"
          + "  hsv.z = max1;                                  \n"
          + "  hsv.y = (max1 - min1) / max1;                  \n"
          + "  return hsv;                                    \n"
          + "}                                                \n"
          + "                                                 \n"
          + "vec3 hsvtorgb(vec3 hsv) {                        \n"
          + "  float R;                                       \n"
          + "  float G;                                       \n"
          + "  float B;                                       \n"
          + "  if (hsv.y == 0.0) {                            \n"
          + "      R = G = B = hsv.z;                         \n"
          + "  }                                              \n"
          + "  else {                                         \n"
          + "    hsv.x = hsv.x / 60.0;                        \n"
          + "    int i = int(hsv.x);                          \n"
          + "    float f = hsv.x - float(i);                  \n"
          + "    float a = hsv.z * (1.0 - hsv.y);             \n"
          + "    float b = hsv.z * (1.0 - hsv.y * f);         \n"
          + "    float c = hsv.z * (1.0 - hsv.y * (1.0 - f)); \n"
          + "    if (i == 0) {                                \n"
          + "      R = hsv.z;                                 \n"
          + "      G = c;                                     \n"
          + "      B = a;                                     \n"
          + "    }                                            \n"
          + "    else if (i == 1) {                           \n"
          + "      R = b;                                     \n"
          + "      G = hsv.z;                                 \n"
          + "      B = a;                                     \n"
          + "    }                                            \n"
          + "    else if (i == 2) {                           \n"
          + "      R = a;                                     \n"
          + "      G = hsv.z;                                 \n"
          + "      B = c;                                     \n"
          + "    }                                            \n"
          + "    else if (i == 3) {                           \n"
          + "      R = a;                                     \n"
          + "      G = b;                                     \n"
          + "      B = hsv.z;                                 \n"
          + "    }                                            \n"
          + "    else if (i == 4) {                           \n"
          + "      R = c;                                     \n"
          + "      G = a;                                     \n"
          + "      B = hsv.z;                                 \n"
          + "    }                                            \n"
          + "    else {                                       \n"
          + "      R = hsv.z;                                 \n"
          + "      G = a;                                     \n"
          + "      B = b;                                     \n"
          + "    }                                            \n"
          + "  }                                              \n"
          + "  return vec3(R, G, B);                          \n"
          + "}                                                  ";

  private static final String ALPHA_CALC_STRING =
      "float alpha_calc(vec3 rgb) {\n" +
          "  if (rgb.r > 0.8 && rgb.g > 0.8 && rgb.b > 0.8) {\n" +
          "    return 0.2;\n" +
          "  }\n" +
          "  else if (rgb.r > 0.6 && rgb.g > 0.6 && rgb.b > 0.6) {\n" +
          "    return 0.4;\n" +
          "  }\n" +
          "  else {\n" +
          "    return 0.5;\n" +
          "  }\n" +
          "}\n";

  private static final String VERTEX_SHADER_STRING =
      "varying vec2 interp_tc;\n"
          + "attribute vec4 in_pos;\n"
          + "attribute vec4 in_tc;\n"
          + "\n"
          + "uniform mat4 texMatrix;\n"
          + "\n"
          + "void main() {\n"
          + "    gl_Position = in_pos;\n"
          + "    interp_tc = (texMatrix * in_tc).xy;\n"
          + "}\n";

  private static final String YUV_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D y_tex;\n"
          + "uniform sampler2D u_tex;\n"
          + "uniform sampler2D v_tex;\n"
          + "\n"
          + "void main() {\n"
          // CSC according to http://www.fourcc.org/fccyvrgb.php
          + "  float y = texture2D(y_tex, interp_tc).r;\n"
          + "  float u = texture2D(u_tex, interp_tc).r - 0.5;\n"
          + "  float v = texture2D(v_tex, interp_tc).r - 0.5;\n"
          + "  gl_FragColor = vec4(y + 1.403 * v, "
          + "                      y - 0.344 * u - 0.714 * v, "
          + "                      y + 1.77 * u, 1);\n"
          + "}\n";

  private static final String RGB_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D rgb_tex;\n"
          + "\n"
          + SHV_SET_STRING
          + ALPHA_CALC_STRING
          + "void main() {\n"
          + "  vec4 col = texture2D(rgb_tex, interp_tc);\n"
          + "  gl_FragColor = col;\n"
          + "}\n";

  private static final String OES_FRAGMENT_SHADER_STRING =
      "#extension GL_OES_EGL_image_external : require\n"
          + "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform samplerExternalOES oes_tex;\n"
          + "\n"
          + "void main() {\n"
          + "  gl_FragColor = texture2D(oes_tex, interp_tc);\n"
          + "}\n";

  // Vertex coordinates in Normalized Device Coordinates, i.e. (-1, -1) is bottom-left and (1, 1) is
  // top-right.
  protected static final FloatBuffer FULL_RECTANGLE_BUF = GlUtil.createFloatBuffer(new float[] {
      -1.0f, -1.0f, // Bottom left.
      1.0f, -1.0f, // Bottom right.
      -1.0f, 1.0f, // Top left.
      1.0f, 1.0f, // Top right.
  });

  // Texture coordinates - (0, 0) is bottom-left and (1, 1) is top-right.
  protected static final FloatBuffer FULL_RECTANGLE_TEX_BUF = GlUtil.createFloatBuffer(new float[] {
      0.0f, 0.0f, // Bottom left.
      1.0f, 0.0f, // Bottom right.
      0.0f, 1.0f, // Top left.
      1.0f, 1.0f // Top right.
  });

  protected static class Shader {
    public final GlShader glShader;
    public final int texMatrixLocation;

    public Shader(String fragmentShader) {
      this.glShader = new GlShader(VERTEX_SHADER_STRING, fragmentShader);
      this.texMatrixLocation = glShader.getUniformLocation("texMatrix");
    }
  }

  protected final Map<String, Shader> shaders = new IdentityHashMap();

  /**
   * Draw an OES texture frame with specified texture transformation matrix. Required resources are
   * allocated at the first call to this function.
   */
  @Override
  public void drawOes(int oesTextureId, float[] texMatrix, int frameWidth, int frameHeight,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(OES_FRAGMENT_SHADER_STRING, texMatrix);
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
    // updateTexImage() may be called from another thread in another EGL context, so we need to
    // bind/unbind the texture in each draw call so that GLES understads it's a new texture.
    GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTextureId);
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, 0);
  }

  /**
   * Draw a RGB(A) texture frame with specified texture transformation matrix. Required resources
   * are allocated at the first call to this function.
   */
  @Override
  public void drawRgb(int textureId, float[] texMatrix, int frameWidth, int frameHeight,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(RGB_FRAGMENT_SHADER_STRING, texMatrix);
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the texture as a precaution.
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
  }

  /**
   * Draw a YUV frame with specified texture transformation matrix. Required resources are
   * allocated at the first call to this function.
   */
  @Override
  public void drawYuv(int[] yuvTextures, float[] texMatrix, int frameWidth, int frameHeight,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(YUV_FRAGMENT_SHADER_STRING, texMatrix);
    // Bind the textures.
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuvTextures[i]);
    }
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the textures as a precaution..
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }
  }

  protected void drawRectangle(int x, int y, int width, int height) {
    // Draw quad.
    GLES20.glViewport(x, y, width, height);
    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
  }

  protected boolean initShader(String fragmentShader, Shader shader) {
    if (fragmentShader == YUV_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("y_tex"), 0);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("u_tex"), 1);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("v_tex"), 2);
    } else if (fragmentShader == RGB_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb_tex"), 0);
    } else if (fragmentShader == OES_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("oes_tex"), 0);
    } else {
      return false;
    }
    return true;
  }

  protected void prepareShader(String fragmentShader, float[] texMatrix) {
    final Shader shader;
    if (shaders.containsKey(fragmentShader)) {
      shader = shaders.get(fragmentShader);
    } else {
      // Lazy allocation.
      shader = new Shader(fragmentShader);
      shaders.put(fragmentShader, shader);
      shader.glShader.useProgram();
      // Initialize fragment shader uniform values.
      if (!initShader(fragmentShader, shader)) {
        throw new IllegalStateException("Unknown fragment shader: " + fragmentShader);
      }
      GlUtil.checkNoGLES2Error("Initialize fragment shader uniform values.");
      // Initialize vertex shader attributes.
      shader.glShader.setVertexAttribArray("in_pos", 2, FULL_RECTANGLE_BUF);
      shader.glShader.setVertexAttribArray("in_tc", 2, FULL_RECTANGLE_TEX_BUF);
    }
    shader.glShader.useProgram();
    // Copy the texture transformation matrix over.
    GLES20.glUniformMatrix4fv(shader.texMatrixLocation, 1, false, texMatrix, 0);
  }

  /**
   * Release all GLES resources. This needs to be done manually, otherwise the resources are leaked.
   */
  @Override
  public void release() {
    for (Shader shader : shaders.values()) {
      shader.glShader.release();
    }
    shaders.clear();
  }
}
