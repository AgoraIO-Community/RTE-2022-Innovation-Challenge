package com.qingkouwei.handyinstruction.av.video;

import android.opengl.GLES20;

public class GlRectBlendDrawer
    extends GLRectDrawer {

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

  private static final String YUV_RGB_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D y_tex;\n"
          + "uniform sampler2D u_tex;\n"
          + "uniform sampler2D v_tex;\n"
          + "uniform sampler2D rgb_tex;\n"
          + "\n"
          + "void main() {\n"
          // CSC according to http://www.fourcc.org/fccyvrgb.php
          + "  float y = texture2D(y_tex, interp_tc).r;\n"
          + "  float u = texture2D(u_tex, interp_tc).r - 0.5;\n"
          + "  float v = texture2D(v_tex, interp_tc).r - 0.5;\n"
          + "  vec4 col1 = vec4(y + 1.403 * v, "
          + "                      y - 0.344 * u - 0.714 * v, "
          + "                      y + 1.77 * u, 1);\n"
          + "  vec4 col2 = texture2D(rgb_tex, interp_tc);\n"
          + "  gl_FragColor = vec4(col1.r * col2.r, " +
          "                        col1.g * col2.g," +
          "                        col1.b * col2.b," +
          "                        1.0);\n"
          + "}\n";
  private static final String RGB_YUV_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D rgb_tex;\n"
          + "uniform sampler2D y_tex;\n"
          + "uniform sampler2D u_tex;\n"
          + "uniform sampler2D v_tex;\n"
          + "\n"
          + "void main() {\n"
          + "  vec4 col1 = texture2D(rgb_tex, interp_tc);\n"
          + "  float y = texture2D(y_tex, interp_tc).r;\n"
          + "  float u = texture2D(u_tex, interp_tc).r - 0.5;\n"
          + "  float v = texture2D(v_tex, interp_tc).r - 0.5;\n"
          + "  vec4 col2 = vec4(y + 1.403 * v, "
          + "                      y - 0.344 * u - 0.714 * v, "
          + "                      y + 1.77 * u, 1);\n"
          + "  gl_FragColor = vec4(col1.r * col2.r," +
          "                        col1.g * col2.g," +
          "                        col1.b * col2.b," +
          "                        1.0);\n"
          + "}\n";

  private static final String YUV_YUV_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D y1_tex;\n"
          + "uniform sampler2D u1_tex;\n"
          + "uniform sampler2D v1_tex;\n"
          + "uniform sampler2D y2_tex;\n"
          + "uniform sampler2D u2_tex;\n"
          + "uniform sampler2D v2_tex;\n"
          + "\n"
          + "void main() {\n"
          + "  float y1 = texture2D(y1_tex, interp_tc).r;\n"
          + "  float u1 = texture2D(u1_tex, interp_tc).r - 0.5;\n"
          + "  float v1 = texture2D(v1_tex, interp_tc).r - 0.5;\n"
          + "  vec4 col1 = vec4(y1 + 1.403 * v1, "
          + "                      y1 - 0.344 * u1 - 0.714 * v1, "
          + "                      y1 + 1.77 * u1, 1);\n"
          + "  float y2 = texture2D(y2_tex, interp_tc).r;\n"
          + "  float u2 = texture2D(u2_tex, interp_tc).r - 0.5;\n"
          + "  float v2 = texture2D(v2_tex, interp_tc).r - 0.5;\n"
          + "  vec4 col2 = vec4(y2 + 1.403 * v2, "
          + "                      y2 - 0.344 * u2 - 0.714 * v2, "
          + "                      y2 + 1.77 * u2, 1);\n"
          + "  gl_FragColor = vec4(col1.r * col2.r," +
          "                        col1.g * col2.g," +
          "                        col1.b * col2.b," +
          "                        1.0);\n"
          + "}\n";

  private static final String RGB_RGB_FRAGMENT_SHADER_STRING =
      "precision mediump float;\n"
          + "varying vec2 interp_tc;\n"
          + "\n"
          + "uniform sampler2D rgb1_tex;\n"
          + "uniform sampler2D rgb2_tex;\n"
          + "\n"
          + "void main() {\n"
          + "  vec4 col1 = texture2D(rgb1_tex, interp_tc);\n"
          + "  vec4 col2 = texture2D(rgb2_tex, interp_tc);\n"
          + "  gl_FragColor = vec4(col1.r * col2.r," +
          "                        col1.g * col2.g," +
          "                        col1.b * col2.b," +
          "                        col1.a * col2.a);\n"
          + "}\n";

  /**
   * Draw a RGB(A) texture frame with specified texture transformation matrix. Required resources
   * are allocated at the first call to this function.
   */
  public void drawYuvRgb(int[] yuvTextures, int textureId,
      float[] texMatrix,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(YUV_RGB_FRAGMENT_SHADER_STRING, texMatrix);
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuvTextures[i]);
    }
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + 3);
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the texture as a precaution.
    for (int i = 0; i < 4; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }
  }

  /**
   * Draw a YUV frame with specified texture transformation matrix. Required resources are
   * allocated at the first call to this function.
   */
  public void drawRgbYuv(int textureId, int[] yuvTextures,
      float[] texMatrix,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(RGB_YUV_FRAGMENT_SHADER_STRING, texMatrix);
    // Bind the textures.
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i + 1);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuvTextures[i]);
    }
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the textures as a precaution..
    for (int i = 0; i < 4; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }
  }

  public void drawYuvYuv(int[] yuv1Textures, int[] yuv2Textures,
      float[] texMatrix,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(YUV_YUV_FRAGMENT_SHADER_STRING, texMatrix);
    // Bind the textures.
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuv1Textures[i]);
    }
    for (int i = 0; i < 3; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i + 3);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuv2Textures[i]);
    }
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the textures as a precaution..
    for (int i = 0; i < 6; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }
  }

  public void drawRgbRgb(int texture1Id, int texture2Id,
      float[] texMatrix,
      int viewportX, int viewportY, int viewportWidth, int viewportHeight) {
    prepareShader(RGB_RGB_FRAGMENT_SHADER_STRING, texMatrix);

    GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texture1Id);
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + 1);
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texture2Id);
    drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight);
    // Unbind the texture as a precaution.
    for (int i = 0; i < 2; ++i) {
      GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i);
      GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0);
    }
  }

  protected boolean initShader(String fragmentShader, Shader shader) {
    if (super.initShader(fragmentShader, shader)) {
      return true;
    }

    // Initialize fragment shader uniform values.
    if (fragmentShader == YUV_RGB_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("y_tex"), 0);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("u_tex"), 1);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("v_tex"), 2);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb_tex"), 3);
    } else if (fragmentShader == RGB_YUV_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb_tex"), 0);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("y_tex"), 1);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("u_tex"), 2);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("v_tex"), 3);
    } else if (fragmentShader == RGB_RGB_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb1_tex"), 0);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb2_tex"), 1);
    } else if (fragmentShader == YUV_YUV_FRAGMENT_SHADER_STRING) {
      GLES20.glUniform1i(shader.glShader.getUniformLocation("y1_tex"), 0);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("u1_tex"), 1);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("v1_tex"), 2);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("y2_tex"), 4);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("u2_tex"), 5);
      GLES20.glUniform1i(shader.glShader.getUniformLocation("v2_tex"), 6);
    } else {
      // throw new IllegalStateException("Unknown fragment shader: " + fragmentShader);
      return false;
    }

    return true;
  }
}
