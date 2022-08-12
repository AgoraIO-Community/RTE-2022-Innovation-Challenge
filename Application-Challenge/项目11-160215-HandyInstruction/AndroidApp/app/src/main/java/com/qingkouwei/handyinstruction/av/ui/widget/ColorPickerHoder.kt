package com.wonxing.adapter.holder

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.annotation.ColorInt
import androidx.recyclerview.widget.RecyclerView
import com.hyphenate.util.DensityUtil
import com.qingkouwei.handyinstruction.R
import com.qingkouwei.handyinstruction.av.bean.ColorPickerBean

class ColorPickerHoder private constructor(itemView: ViewGroup) : RecyclerView.ViewHolder(itemView) {

    interface ColorPickerListener {
        fun onSelected(@ColorInt color: Int)
    }

    private val imageView = ImageView(itemView.context)

    init {
        imageView.scaleType = ImageView.ScaleType.CENTER_INSIDE

        val dip40 = DensityUtil.dip2px(itemView.context, 40f)
        val dip12 = DensityUtil.dip2px(itemView.context, 12f)
        val dip20 = DensityUtil.dip2px(itemView.context, 20f)
        val params = ViewGroup.LayoutParams(dip40, dip40)
        itemView.addView(imageView, params)

        itemView.setPadding(dip20, dip12, dip20, dip12)
    }

    fun update(bean: ColorPickerBean?, isSelected: Boolean, listener: ColorPickerListener?) {
        if (bean == null) {
            itemView.visibility = View.GONE
            return
        }
        itemView.visibility = View.VISIBLE

        imageView.setBackgroundResource(bean.bgRes)
        updateSelectedState(isSelected)

        itemView.setOnClickListener {
            updateSelectedState(true)
            listener?.onSelected(bean.color)
        }
    }

    private fun updateSelectedState(isSelected: Boolean) {
        imageView.setImageResource(if (isSelected) R.mipmap.ic_color_picker_selected else 0)
    }

    companion object {

        @JvmStatic
        fun getInstance(ctx: Context): ColorPickerHoder {
            val itemView = FrameLayout(ctx)
            return ColorPickerHoder(itemView)
        }
    }
}
