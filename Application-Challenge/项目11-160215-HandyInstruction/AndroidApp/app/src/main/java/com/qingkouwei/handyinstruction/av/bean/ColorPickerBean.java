package com.qingkouwei.handyinstruction.av.bean;

import androidx.annotation.ColorInt;
import androidx.annotation.ColorRes;
import androidx.annotation.DrawableRes;
import com.qingkouwei.handyinstruction.av.util.Resource;

public class ColorPickerBean {
    @DrawableRes
    public int bgRes;
    @ColorInt
    public int color;

    public ColorPickerBean(@DrawableRes int bgRes, @ColorRes int color) {
        this.bgRes = bgRes;
        this.color = Resource.getColor(color);
    }
}
