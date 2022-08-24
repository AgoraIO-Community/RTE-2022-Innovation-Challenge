package com.agora.crane.widget;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;

import androidx.appcompat.widget.AppCompatImageView;

import com.agora.crane.R;

/**
 * @Author: hyx
 * @Date: 2022/7/24
 * @introduction 圆形图片控件
 */
public class CircleImageView extends AppCompatImageView {
    private Paint pressPaint;
    private int width;
    private int height;

    /**
     * default bitmap config
     */
    private static final Bitmap.Config BITMAP_CONFIG = Bitmap.Config.ARGB_8888;

    /**
     * border color
     */
    private int borderColor;
    /**
     * width of border
     */
    private int borderWidth;
    /**
     * alpha when pressed
     */
    private int pressAlpha;
    /**
     * color when pressed
     */
    private int pressColor;
    /**
     * radius
     */
    private int radius;
    /**
     * rectangle or round, 1 is circle, 2 is rectangle
     */
    private int shapeType;

    private Paint mPaint;
    private int step = 10;
    private Bitmap bitmapDraw;


    public CircleImageView(Context context) {
        super(context);
        init(context, null);
    }

    public CircleImageView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public CircleImageView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }


    private void init(Context context, AttributeSet attrs) {
        mPaint = new Paint();
        mPaint.setColor(0xffffffff);
        mPaint.setAntiAlias(true);
        borderWidth = 0;
        borderColor = 0xddffffff;
        pressAlpha = 0x42;
        pressColor = 0x42000000;
        radius = 16;
        shapeType = 0;

        if (attrs != null) {
            TypedArray array = context.obtainStyledAttributes(attrs, R.styleable.CircleImageView);
            borderColor = array.getColor(R.styleable.CircleImageView_ease_border_color, borderColor);
            borderWidth = array.getDimensionPixelOffset(R.styleable.CircleImageView_ease_border_width, borderWidth);
            pressAlpha = array.getInteger(R.styleable.CircleImageView_ease_press_alpha, pressAlpha);
            pressColor = array.getColor(R.styleable.CircleImageView_ease_press_color, pressColor);
            radius = array.getDimensionPixelOffset(R.styleable.CircleImageView_ease_radius, radius);
            shapeType = array.getInteger(R.styleable.CircleImageView_es_shape_type, shapeType);
            array.recycle();
        }

        pressPaint = new Paint();
        pressPaint.setAntiAlias(true);
        pressPaint.setStyle(Paint.Style.FILL);
        pressPaint.setColor(pressColor);
        pressPaint.setAlpha(0);
        pressPaint.setFlags(Paint.ANTI_ALIAS_FLAG);
        setDrawingCacheEnabled(true);
        setWillNotDraw(false);
    }

    @Override
    protected void onDraw(Canvas canvas) {

        if (shapeType == 0) {
            super.onDraw(canvas);
            return;
        }
        Drawable drawable = getDrawable();
        if (drawable == null) {
            return;
        }
        if (getWidth() == 0 || getHeight() == 0) {
            return;
        }
        Bitmap bitmap = getBitmapFromDrawable(drawable);
        drawDrawable(canvas, bitmap);
        drawBorder(canvas);
    }

    /**
     * draw Rounded Rectangle
     *
     * @param canvas
     * @param bitmap
     */
    @SuppressLint("WrongConstant")
    private void drawDrawable(Canvas canvas, Bitmap bitmap) {

        Paint paint = new Paint();
        paint.setColor(0xffffffff);
        paint.setAntiAlias(true);

        PorterDuffXfermode xFerMode = new PorterDuffXfermode(PorterDuff.Mode.SRC_IN);
        int saveFlags = Canvas.ALL_SAVE_FLAG;
        canvas.saveLayer(0, 0, width, height, null, saveFlags);
        if (shapeType == 1) {
            canvas.drawCircle(width / 2, height / 2, width / 2, paint);
        } else if (shapeType == 2) {
            RectF rectf = new RectF(0, 0, getWidth(), getHeight());
            canvas.drawRoundRect(rectf, radius, radius, paint);
        }

        paint.setXfermode(xFerMode);
        float scaleWidth = ((float) getWidth()) / bitmap.getWidth();
        float scaleHeight = ((float) getHeight()) / bitmap.getHeight();

        Matrix matrix = new Matrix();
        matrix.postScale(scaleWidth, scaleHeight);
        bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
        bitmapDraw = bitmap;
        canvas.drawBitmap(bitmap, 0, 0, paint);
    }

    /**
     * 获取图片bitmap，以便进行高斯模糊处理
     *
     * @return
     */
    public Bitmap getBitmap() {
        return bitmapDraw;
    }

    /**
     * draw customized border
     *
     * @param canvas
     */
    private void drawBorder(Canvas canvas) {
        if (borderWidth > 0) {
            Paint paint = new Paint();
            paint.setStrokeWidth(borderWidth);
            paint.setStyle(Paint.Style.STROKE);
            paint.setColor(borderColor);
            paint.setAntiAlias(true);
            if (shapeType == 1) {
                canvas.drawCircle(width / 2, height / 2, (width - borderWidth) / 2, paint);
            } else if (shapeType == 2) {
                RectF rectf = new RectF(borderWidth / 2, borderWidth / 2, getWidth() - borderWidth / 2,
                        getHeight() - borderWidth / 2);
                canvas.drawRoundRect(rectf, radius, radius, paint);
            }
        }
    }

    /**
     * monitor the size change
     *
     * @param w    当前宽
     * @param h    当前高
     * @param oldW 旧的宽
     * @param oldH 旧的高
     */
    @Override
    protected void onSizeChanged(int w, int h, int oldW, int oldH) {
        super.onSizeChanged(w, h, oldW, oldH);
        width = w;
        height = h;
    }

    /**
     * @param drawable
     * @return
     */
    private Bitmap getBitmapFromDrawable(Drawable drawable) {
        if (drawable == null) {
            return null;
        }

        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        }

        Bitmap bitmap;
        int width = Math.max(drawable.getIntrinsicWidth(), 2);
        int height = Math.max(drawable.getIntrinsicHeight(), 2);
        try {
            bitmap = Bitmap.createBitmap(width, height, BITMAP_CONFIG);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            bitmap = null;
        }
        return bitmap;
    }

    /**
     * set radius
     *
     * @param radius
     */
    public void setRadius(int radius) {
        this.radius = radius;
        postInvalidate();
    }
}
