package com.qingkouwei.handyinstruction.av.ui.widget;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.AttrRes;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.annotation.StyleRes;
import com.qingkouwei.handyinstruction.R;

public class LiveStudioLayout_Menu extends FrameLayout {

  private View root;

  private View llBrush;
  private View llFrameMode;
  private View llCamera;
  private View llFlashlight;
  private View llMike;

  private View llEraser;
  private View llClose;
  private View llColorPick;
  private View llClear;

  private View ivEraser;
  private View tvEraser;
  private View ll_menu;
  private View ll_draw;
  private TextView mMikeStateTv;
  private TextView mTvFrameMode;
  private ImageView mIvFrameMode;
  private ImageView mIvMike;
  private ImageView mIvFlashlight;
  private ImageView mIvCamera;

  private TextView mTvMike;
  private TextView mTvFlashlight;
  private TextView mTvCamera;

  private OnClickListener onDrawOpenListener;
  private OnClickListener onDrawCloseListener;
  private OnClickListener onDrawEraserListener;
  private OnClickListener onCameraModeListener;
  private OnClickListener onMikeModeListener;
  private OnClickListener onFlashlightListener;
  private OnClickListener onFrameModeListener;

  public LiveStudioLayout_Menu(Context context) {
    super(context);
    init(context);
  }

  public LiveStudioLayout_Menu(@NonNull Context context, @Nullable AttributeSet attrs) {
    super(context, attrs);
    init(context);
  }

  public LiveStudioLayout_Menu(@NonNull Context context, @Nullable AttributeSet attrs, @AttrRes
      int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    init(context);
  }

  @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
  public LiveStudioLayout_Menu(@NonNull Context context, @Nullable AttributeSet attrs, @AttrRes
      int defStyleAttr, @StyleRes int defStyleRes) {
    super(context, attrs, defStyleAttr, defStyleRes);
    init(context);
  }

  private void init(final Context ctx) {
    root = inflate(ctx, R.layout.view_live_menu, this);

    ll_menu = root.findViewById(R.id.ll_menu);
    ll_draw = root.findViewById(R.id.ll_draw);

    llBrush = root.findViewById(R.id.llBrush);
    llFrameMode = root.findViewById(R.id.llFrameMode);
    llCamera = root.findViewById(R.id.llCamera);
    llFlashlight = root.findViewById(R.id.llFlashlight);
    llMike = root.findViewById(R.id.llMike);

    llEraser = root.findViewById(R.id.llEraser);
    llClose = root.findViewById(R.id.llClose);
    llColorPick = root.findViewById(R.id.llColorPick);
    llClear = root.findViewById(R.id.llClear);

    ivEraser = root.findViewById(R.id.ivEraser);
    tvEraser = root.findViewById(R.id.tvEraser);

    mTvFrameMode = root.findViewById(R.id.tvFrameMode);
    mIvFrameMode = root.findViewById(R.id.ivFrameMode);

    mIvMike = root.findViewById(R.id.ivMike);
    mIvFlashlight = root.findViewById(R.id.ivFlashlight);
    mIvCamera = root.findViewById(R.id.ivCamera);

    mTvMike = root.findViewById(R.id.tvMike);
    mTvFlashlight = root.findViewById(R.id.tvFlashlight);
    mTvCamera = root.findViewById(R.id.tvCamera);

    mMikeStateTv = root.findViewById(R.id.tvMike);

    llBrush.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        if (onDrawOpenListener != null) {
          onDrawOpenListener.onClick(v);
        }
      }
    });
    llFrameMode.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        //Toast.makeText(getContext(), R.string._text_no_complete, Toast.LENGTH_SHORT).show();
        if (onFrameModeListener != null) {
          onFrameModeListener.onClick(v);
        }
      }
    });

    llFlashlight.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        mIvFlashlight.setSelected(!mIvFlashlight.isSelected());
        mTvFlashlight.setSelected(!mTvFlashlight.isSelected());
        if (onFlashlightListener != null) {
          onFlashlightListener.onClick(v);
        }
      }
    });

    llClose.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        ll_menu.setVisibility(VISIBLE);
        ll_draw.setVisibility(GONE);
        if (onDrawCloseListener != null) {
          onDrawCloseListener.onClick(v);
        }
      }
    });

    llEraser.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        boolean eraserMode = !v.isSelected();
        LiveStudioLayout_Menu.this.switchEraserMode(eraserMode);
      }
    });
    llMike.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        mIvMike.setSelected(!mIvMike.isSelected());
        mTvMike.setSelected(!mTvMike.isSelected());
        if (onMikeModeListener != null) {
          onMikeModeListener.onClick(v);
        }
      }
    });
    llCamera.setOnClickListener(new OnClickListener() {
      @Override
      public void onClick(View v) {
        mIvCamera.setSelected(!mIvCamera.isSelected());
        mTvCamera.setSelected(!mTvCamera.isSelected());
        if (onCameraModeListener != null) {
          onCameraModeListener.onClick(v);
        }
      }
    });
  }

  private void switchEraserMode(boolean eraserMode) {
    llEraser.setSelected(eraserMode);
    ivEraser.setSelected(eraserMode);
    tvEraser.setSelected(eraserMode);
    if (onDrawEraserListener != null) {
      onDrawEraserListener.onClick(llEraser);
    }
  }

  public void setOnDrawColorClickListener(final OnClickListener listener) {
    if (llColorPick != null) {
      llColorPick.setOnClickListener(new OnClickListener() {
        @Override
        public void onClick(View v) {
          LiveStudioLayout_Menu.this.switchEraserMode(false);
          if (listener != null) {
            listener.onClick(v);
          }
        }
      });
    }
  }

  public void setOnDrawClearClickListener(OnClickListener listener) {
    if (llClear != null) {
      llClear.setOnClickListener(listener);
    }
  }

  public void setOnDrawEraserClickListener(OnClickListener listener) {
    onDrawEraserListener = listener;
  }

  public void setOnDrawOpenClickListener(OnClickListener listener) {
    onDrawOpenListener = listener;
  }

  public void setOnDrawCloseClickListener(OnClickListener listener) {
    onDrawCloseListener = listener;
  }

  public void setOnCameraModeListener(OnClickListener onCameraModeListener) {
    this.onCameraModeListener = onCameraModeListener;
  }

  public void setOnMikeModeListener(OnClickListener onMikeModeListener) {
    this.onMikeModeListener = onMikeModeListener;
  }

  public void setMikeStateText(int id) {
    mMikeStateTv.setText(id);
  }

  public void setOnFlashlightListener(OnClickListener onFlashlightListener) {
    this.onFlashlightListener = onFlashlightListener;
  }

  public void setOnFrameModeListener(OnClickListener onFrameModeListener) {
    this.onFrameModeListener = onFrameModeListener;
  }

  public void openDrawMenu() {
    ll_menu.setVisibility(GONE);
    ll_draw.setVisibility(VISIBLE);
  }

  public void changeFrameMode(boolean isBlend) {
    mIvFrameMode.setSelected(isBlend);
    mTvFrameMode.setSelected(isBlend);
    if (isBlend) {
      mTvFrameMode.setText(getContext().getString(R.string._text_livestudio_menu_more_guide_blend));
    } else {
      mTvFrameMode.setText(getContext().getString(R.string._text_livestudio_menu_more_guide_pip));
    }
  }

  public void notifyCameraOpenError() {
  }
}
