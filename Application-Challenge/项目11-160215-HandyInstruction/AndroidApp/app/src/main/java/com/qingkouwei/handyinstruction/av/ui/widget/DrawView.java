package com.qingkouwei.handyinstruction.av.ui.widget;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import androidx.annotation.NonNull;
import com.hyphenate.util.DensityUtil;
import com.qingkouwei.handyinstruction.R;

public class DrawView extends View {

  public interface OnDrawReleaseListener {
    void onRelease();
  }

  private Paint mPaint;

  private Bitmap mBitmap;
  private Canvas mCanvas;
  private Path mPath;
  private Paint mBitmapPaint;

  private boolean mEsaserMode = false;
  private int mEsaserSize;
  private int dip5;
  private Paint mEsaserPaint;
  private Bitmap mEsaserBitmap;

  private OnDrawReleaseListener onDrawReleaseListener;

  private OnDrawCallback mOnDrawCallback;
  private ViewSizeChangeCallback mViewSizeChangeCallback;

  public DrawView(Context context) {
    super(context);
    init();
  }

  public DrawView(Context context, AttributeSet attrs) {
    super(context, attrs);
    init();
  }

  public DrawView(Context context, AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    init();
  }

  private void init() {
    mPaint = new Paint();
    mPaint.setAntiAlias(true);
    mPaint.setDither(true);
    mPaint.setColor(0xFFFF0000);
    mPaint.setStyle(Paint.Style.STROKE);
    mPaint.setStrokeJoin(Paint.Join.ROUND);
    mPaint.setStrokeCap(Paint.Cap.ROUND);
    mPaint.setStrokeWidth(12);

    mPath = new Path();
    mBitmapPaint = new Paint(Paint.DITHER_FLAG);

    mEsaserSize = DensityUtil.dip2px(getContext(), 50);
    dip5 = DensityUtil.dip2px(getContext(), 5);

    mEsaserPaint = new Paint();
    mEsaserPaint.setAntiAlias(true);
    mEsaserPaint.setDither(true);
    mEsaserPaint.setColor(0xFF000000);
    mEsaserPaint.setStyle(Paint.Style.STROKE);
    mEsaserPaint.setStrokeJoin(Paint.Join.ROUND);
    mEsaserPaint.setStrokeCap(Paint.Cap.ROUND);
    mEsaserPaint.setStrokeWidth(mEsaserSize);
    mEsaserPaint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.DST_OUT));

    BitmapFactory.Options opt = new BitmapFactory.Options();
    opt.outHeight = opt.outWidth = mEsaserSize;
    mEsaserBitmap = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_live_eraser_draw, opt);
  }

  public void setViewSizeChangeCallback(ViewSizeChangeCallback callback) {
    this.mViewSizeChangeCallback = callback;
  }

  public void setmOnDrawCallback(OnDrawCallback mOnDrawCallback) {
    this.mOnDrawCallback = mOnDrawCallback;
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);
    if (mViewSizeChangeCallback != null) {
      mViewSizeChangeCallback.viewSizeChange(w, h);
    }
    if (mBitmap != null && !mBitmap.isRecycled()) {
      mBitmap.recycle();
    }
    mBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
    mCanvas = new Canvas(mBitmap);
  }

  @Override
  protected void onDraw(Canvas canvas) {
    canvas.drawBitmap(mBitmap, 0, 0, mBitmapPaint);

        /*if (!mEsaserMode) {
            canvas.drawPath(mPath, mPaint);
            mCopyCanvas.drawPath(mPath, mPaint);
        } else {
            canvas.drawPath(mPath, mEsaserPaint);
            mCopyCanvas.drawPath(mPath, mEsaserPaint);
            if (!mPath.isEmpty()) {
                canvas.drawBitmap(mEsaserBitmap, mX - mEsaserSize / 2, mY - mEsaserSize / 2, mBitmapPaint);
                mCopyCanvas.drawBitmap(mEsaserBitmap, mX - mEsaserSize / 2, mY - mEsaserSize /2, mBitmapPaint);
            }
        }*/
    if (mOnDrawCallback != null) {
      mOnDrawCallback.updatePix(mBitmap);
    }
  }

  private float mX, mY;
  private static final float TOUCH_TOLERANCE = 4;

  private void touch_start(float x, float y) {
    mPath.reset();
    mPath.moveTo(x, y);
    mX = x;
    mY = y;
  }

  private void touch_move(float x, float y) {
    float dx = Math.abs(x - mX);
    float dy = Math.abs(y - mY);
    if (dx >= TOUCH_TOLERANCE || dy >= TOUCH_TOLERANCE) {
      mPath.quadTo(mX, mY, (x + mX) / 2, (y + mY) / 2);
      mX = x;
      mY = y;
    }
    if (!mEsaserMode) {
      mCanvas.drawPath(mPath, mPaint);
    } else {
      mCanvas.drawPath(mPath, mEsaserPaint);
      mCanvas.drawBitmap(mEsaserBitmap, mX - mEsaserSize / 2, mY - mEsaserSize / 2 + dip5,
          mBitmapPaint);
    }
  }

  private void touch_up() {
    mPath.lineTo(mX, mY);
    // commit the path to our offscreen
    if (!mEsaserMode) {
      mCanvas.drawPath(mPath, mPaint);
    } else {
      mCanvas.drawPath(mPath, mEsaserPaint);
    }
    // kill this so we don't double draw
    mPath.reset();
    if (onDrawReleaseListener != null) {
      onDrawReleaseListener.onRelease();
    }
  }

  @Override
  public boolean onTouchEvent(MotionEvent event) {
    float x = event.getX();
    float y = event.getY();

    switch (event.getAction()) {
      case MotionEvent.ACTION_DOWN:
        touch_start(x, y);
        invalidate();
        break;
      case MotionEvent.ACTION_MOVE:
        touch_move(x, y);
        invalidate();
        break;
      case MotionEvent.ACTION_UP:
        touch_up();
        invalidate();
        break;
    }
    return true;
  }

  public void setColor(int color) {
    mPaint.setColor(color);
  }

  public int getColor() {
    return mPaint.getColor();
  }

  public void clear() {
    if (getWidth() <= 0
        || getHeight() <= 0) {
      return;
    }
    mCanvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR);
    invalidate();
  }

  public void setEsaserMode(boolean esaserMode) {
    this.mEsaserMode = esaserMode;
  }

  public void setOnDrawReleaseListener(OnDrawReleaseListener onDrawReleaseListener) {
    this.onDrawReleaseListener = onDrawReleaseListener;
  }

  @NonNull
  public Bitmap getDrawedBitmap() {
    return mBitmap;
  }

  public void setDrawedBitmap(@NonNull Bitmap bitmap) {
    mBitmap = bitmap;
    mCanvas = new Canvas(mBitmap);
    invalidate();
    if (onDrawReleaseListener != null) {
      onDrawReleaseListener.onRelease();
    }
  }

  public interface OnDrawCallback {
    void updatePix(Bitmap bitmap);
  }

  public interface ViewSizeChangeCallback {
    void viewSizeChange(int width, int height);
  }
}
