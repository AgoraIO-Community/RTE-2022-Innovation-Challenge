package com.qingkouwei.handyinstruction.av.ui.widget;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.recyclerview.widget.RecyclerView;
import com.hyphenate.util.DensityUtil;
import com.osn.assistant.widget.recycler_view.WXRecyclerItemAnimator;
import com.qingkouwei.handyinstruction.R;
import com.qingkouwei.handyinstruction.av.bean.ColorPickerBean;
import com.wonxing.adapter.ColorPickerAdapter;
import com.wonxing.adapter.holder.ColorPickerHoder;
import java.util.ArrayList;

public class LiveStudioLayout_PickColor extends AttachableFrameLayout {

    private ColorPickerHoder.ColorPickerListener colorPickerListener;

    public LiveStudioLayout_PickColor(Context context) {
        super(context);
        init(context);
    }

    public LiveStudioLayout_PickColor(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public LiveStudioLayout_PickColor(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    @SuppressWarnings("unused")
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public LiveStudioLayout_PickColor(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context);
    }

    private void init(Context ctx) {
        int dip20 = DensityUtil.dip2px(ctx, 20);
        int dip12 = DensityUtil.dip2px(ctx, 12);
        RecyclerView recyclerView = new RecyclerView(ctx);
        recyclerView.setHorizontalScrollBarEnabled(false);
        recyclerView.setVerticalScrollBarEnabled(false);
        recyclerView.setOverScrollMode(OVER_SCROLL_NEVER);
        recyclerView.setItemAnimator(new WXRecyclerItemAnimator());
        recyclerView.setLayoutManager(new WXGridLayoutManager(ctx, 3));
        recyclerView.setBackgroundResource(R.drawable.bg_white_round_n);
        recyclerView.setPadding(dip20, dip12, dip20, dip12);

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        params.gravity = Gravity.CENTER;
        addView(recyclerView, params);

        ArrayList<ColorPickerBean> data = new ArrayList<>(6);
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_01_shape, R.color.color_pick_01));
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_02_shape, R.color.color_pick_02));
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_03_shape, R.color.color_pick_03));
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_04_shape, R.color.color_pick_04));
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_05_shape, R.color.color_pick_05));
        data.add(new ColorPickerBean(R.drawable.bg_color_pick_06_shape, R.color.color_pick_06));

        ColorPickerAdapter adapter = new ColorPickerAdapter(data.get(0).color, new ColorPickerHoder.ColorPickerListener() {
            @Override
            public void onSelected(@ColorInt int color) {
                LiveStudioLayout_PickColor.this.detachFromWindow();
                if (colorPickerListener != null) {
                    colorPickerListener.onSelected(color);
                }
            }
        });
        adapter.setData(data);
        recyclerView.setAdapter(adapter);

        setBackgroundResource(R.color.bg_half_tran);
        setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                LiveStudioLayout_PickColor.this.detachFromWindow();
            }
        });
    }

    public void setColorPickerListener(ColorPickerHoder.ColorPickerListener colorPickerListener) {
        this.colorPickerListener = colorPickerListener;
    }

    @Override
    protected void setParams(@NonNull WindowManager.LayoutParams params) {
        params.width = WindowManager.LayoutParams.MATCH_PARENT;
        params.height = WindowManager.LayoutParams.MATCH_PARENT;
    }
}
