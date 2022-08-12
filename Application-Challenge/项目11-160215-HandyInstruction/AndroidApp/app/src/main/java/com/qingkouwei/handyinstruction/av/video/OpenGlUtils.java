package com.qingkouwei.handyinstruction.av.video;

import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import android.opengl.GLUtils;
import android.opengl.Matrix;
import com.qingkouwei.handyinstruction.av.util.SdkLog;
import java.io.IOException;
import java.io.InputStream;
import java.nio.Buffer;
import javax.microedition.khronos.opengles.GL10;

public class OpenGlUtils {
	private static final boolean DEBUG = true; // TODO set false on release
	private static final String TAG = "OpenGlUtils";
	private static final SdkLog _log = SdkLog.getLog(TAG);
	public static final int NO_TEXTURE = -1;
	public static final int NOT_INIT = -1;	
	public static final int ON_DRAWN = 1;

	public static final int texOESTarget = GLES11Ext.GL_TEXTURE_EXTERNAL_OES;
	
	public static int loadTexture(final Bitmap img, final int usedTexId) {
		return loadTexture(img, usedTexId, false);
    }
	
	public static int loadTexture(final Bitmap img, final int usedTexId, boolean recyled) {
		if(img == null)
			return NO_TEXTURE; 
        int textures[] = new int[1];
        if (usedTexId == NO_TEXTURE) {
            GLES20.glGenTextures(1, textures, 0);
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textures[0]);
            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
                    GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
                    GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
                    GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
            GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
                    GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);

            GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, img, 0);
        } else {
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, usedTexId);
            GLUtils.texSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, img);
            textures[0] = usedTexId;
        }
        if(recyled)
        	img.recycle();
        return textures[0];
    }
	
	public static int loadTexture(final Buffer data, final int width,final int height, final int usedTexId) {
		if(data == null)
			return NO_TEXTURE;
	    int textures[] = new int[1];
	    if (usedTexId == NO_TEXTURE) {
	        GLES20.glGenTextures(1, textures, 0);
	        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textures[0]);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
	        GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, width, height,
	                0, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, data);
	    } else {
	        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, usedTexId);
	        GLES20.glTexSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, width,
	                height, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, data);
	        textures[0] = usedTexId;
	    }
	    return textures[0];
    }
    
	public static int loadTexture(final Buffer data, final int width,final int height, final int usedTexId,final int type) {
		if(data == null)
			return NO_TEXTURE;
	    int textures[] = new int[1];
	    if (usedTexId == NO_TEXTURE) {
	        GLES20.glGenTextures(1, textures, 0);
	        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textures[0]);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
	        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D,
	                GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
	        GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, width, height,
	                0, GLES20.GL_RGBA, type, data);
	    } else {
	        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, usedTexId);
	        GLES20.glTexSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, width,
	                height, GLES20.GL_RGBA, type, data);
	        textures[0] = usedTexId;
	    }
	    return textures[0];
    }
    
    public static int loadTexture(final Context context, final String name){
		final int[] textureHandle = new int[1];
		
		GLES20.glGenTextures(1, textureHandle, 0);
		
		if (textureHandle[0] != 0){

			// Read in the resource
			final Bitmap bitmap = getImageFromAssetsFile(context,name);
						
			// Bind to the texture in OpenGL
			GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureHandle[0]);
			
			// Set filtering
			GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
			GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
			GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
			GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
			// Load the bitmap into the bound texture.
			GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0);
			
			// Recycle the bitmap, since its data has been loaded into OpenGL.
			bitmap.recycle();						
		}
		
		if (textureHandle[0] == 0){
			throw new RuntimeException("Error loading texture.");
		}
		
		return textureHandle[0];
	}
	
	private static Bitmap getImageFromAssetsFile(Context context, String fileName){
		Bitmap image = null;
	    AssetManager am = context.getResources().getAssets();
	    try{  
			InputStream is = am.open(fileName);
			image = BitmapFactory.decodeStream(is);
			is.close();
          	}catch (IOException e){
	          e.printStackTrace();  
	      }  	  
	      return image;  	  
	}  
    
	public static int loadProgram(final String strVSource, final String strFSource) {
        int iVShader;
        int iFShader;
        int iProgId;
        int[] link = new int[1];
        iVShader = loadShader(strVSource, GLES20.GL_VERTEX_SHADER);
        if (iVShader == 0) {
            _log.e("Vertex Shader Failed");
            return 0;
        }
        iFShader = loadShader(strFSource, GLES20.GL_FRAGMENT_SHADER);
        if (iFShader == 0) {
			_log.e("Fragment Shader Failed");
            return 0;
        }

        iProgId = GLES20.glCreateProgram();
        GLES20.glAttachShader(iProgId, iVShader);
        GLES20.glAttachShader(iProgId, iFShader);
        GLES20.glLinkProgram(iProgId);
        GLES20.glGetProgramiv(iProgId, GLES20.GL_LINK_STATUS, link, 0);
        if (link[0] <= 0) {
			_log.e("Linking Failed");
            return 0;
        }
        GLES20.glDeleteShader(iVShader);
        GLES20.glDeleteShader(iFShader);
        return iProgId;
    }
	
	private static int loadShader(final String strSource, final int iType) {
        int[] compiled = new int[1];
        int iShader = GLES20.glCreateShader(iType);
        GLES20.glShaderSource(iShader, strSource);
        GLES20.glCompileShader(iShader);
        GLES20.glGetShaderiv(iShader, GLES20.GL_COMPILE_STATUS, compiled, 0);
        if (compiled[0] == 0) {
            _log.e("Compilation\n" + GLES20.glGetShaderInfoLog(iShader));
			GLES20.glDeleteShader(iShader);
            iShader = 0;
        }
        return iShader;
    }
	public static int getExternalOESTextureID(){
		int[] texture = new int[1];
		GLES20.glGenTextures(1, texture, 0);
		GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, texture[0]);
		GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES,
				GL10.GL_TEXTURE_MIN_FILTER, GL10.GL_LINEAR);
		GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES,
                GL10.GL_TEXTURE_MAG_FILTER, GL10.GL_LINEAR);
		GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES,
                GL10.GL_TEXTURE_WRAP_S, GL10.GL_CLAMP_TO_EDGE);
		GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES,
                GL10.GL_TEXTURE_WRAP_T, GL10.GL_CLAMP_TO_EDGE);
		return texture[0];
	}
	/**
	 * create external texture
	 * @return texture ID
	 */
	public static int initTex(int target) {
		if (DEBUG) _log.d("initTex:");
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
		return tex[0];
	}

	/**
	 * delete specific texture
	 */
	public static void deleteTex(final int hTex) {
		if (DEBUG) _log.d("deleteTex:");
		final int[] tex = new int[] {hTex};
		GLES20.glDeleteTextures(1, tex, 0);
	}
	
	/**
	 * Checks to see if a GLES error has been raised.
	 */
	public static void checkGLError(String op) {
		int error = GLES20.glGetError();
		if (error != GLES20.GL_NO_ERROR) {
			String msg = op + ": glError 0x" + Integer.toHexString(error);
			_log.e(msg);
			throw new RuntimeException(msg);
		}
	}
	/**
	 * Returns new matrix with the result of a * b.
	 */
	public static float[] multiplyMatrices(float[] a, float[] b) {
		final float[] resultMatrix = new float[16];
		Matrix.multiplyMM(resultMatrix, 0, a, 0, b, 0);
		return resultMatrix;
	}
	// Matrix with transform y' = 1 - y.
	public static final float[] verticalFlipMatrix() {
		return new float[] {
				1,  0, 0, 0,
				0, -1, 0, 0,
				0,  0, 1, 0,
				0,  1, 0, 1};
	}

	// Matrix with transform x' = 1 - x.
	public static final float[] horizontalFlipMatrix() {
		return new float[] {
				-1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 0, 0, 1};
	}

	public static final float[] identityMatrix() {
		return new float[] {
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1};
	}
	/**
	 * Move |matrix| transformation origin to (0.5, 0.5). This is the origin for texture coordinates
	 * that are in the range 0 to 1.
	 */
	private static void adjustOrigin(float[] matrix) {
		// Note that OpenGL is using column-major order.
		// Pre translate with -0.5 to move coordinates to range [-0.5, 0.5].
		matrix[12] -= 0.5f * (matrix[0] + matrix[4]);
		matrix[13] -= 0.5f * (matrix[1] + matrix[5]);
		// Post translate with 0.5 to move coordinates to range [0, 1].
		matrix[12] += 0.5f;
		matrix[13] += 0.5f;
	}
	/**
	 * Returns texture matrix that will have the effect of rotating the frame |rotationDegree|
	 * clockwise when rendered.
	 */
	public static float[] rotateTextureMatrix(float[] textureMatrix, float rotationDegree) {
		final float[] rotationMatrix = new float[16];
		Matrix.setRotateM(rotationMatrix, 0, rotationDegree, 0, 0, 1);
		adjustOrigin(rotationMatrix);
		return multiplyMatrices(textureMatrix, rotationMatrix);
	}

}
