package com.wonxing.adapter

import android.view.ViewGroup
import androidx.annotation.ColorInt
import com.qingkouwei.handyinstruction.av.bean.ColorPickerBean
import com.qingkouwei.handyinstruction.av.ui.widget.BaseDiffCallback
import com.qingkouwei.handyinstruction.av.ui.widget.BaseRecyclerViewAdapter

import com.wonxing.adapter.holder.ColorPickerHoder


class ColorPickerAdapter(private var selectedColor: Int, private val listener: ColorPickerHoder.ColorPickerListener?) : BaseRecyclerViewAdapter<ColorPickerBean, ColorPickerHoder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ColorPickerHoder =
            ColorPickerHoder.getInstance(parent.context)

    override fun onBindViewHolder(holder: ColorPickerHoder, position: Int) {
        holder.update(
                getItem(position),
                selectedColor == getItem(position)!!.color,
                object : ColorPickerHoder.ColorPickerListener {
                    override fun onSelected(@ColorInt color: Int) {
                        selectedColor = color
                        listener?.onSelected(color)
                        notifyDataSetChanged()
                    }
                }
        )
    }

    override fun createCallback(): BaseDiffCallback<ColorPickerBean> {
        return object : BaseDiffCallback<ColorPickerBean>() {
            override fun areItemsTheSameSub(oldItem: ColorPickerBean, newItem: ColorPickerBean): Boolean =
                    false
        }
    }
}
