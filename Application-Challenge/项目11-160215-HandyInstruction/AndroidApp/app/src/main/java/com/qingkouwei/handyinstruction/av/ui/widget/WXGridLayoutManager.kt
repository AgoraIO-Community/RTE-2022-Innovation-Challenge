package com.qingkouwei.handyinstruction.av.ui.widget


import android.content.Context
import android.util.AttributeSet
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.qingkouwei.handyinstruction.common.utils.DemoLog

@Suppress("unused")
class WXGridLayoutManager : GridLayoutManager {
    constructor(context: Context, spanCount: Int) :
            super(context, spanCount)

    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int, defStyleRes: Int) :
            super(context, attrs, defStyleAttr, defStyleRes)

    constructor(context: Context, spanCount: Int, orientation: Int, reverseLayout: Boolean) :
            super(context, spanCount, orientation, reverseLayout)

    override fun onLayoutChildren(recycler: RecyclerView.Recycler?, state: RecyclerView.State) {
        try {
            super.onLayoutChildren(recycler, state)
        } catch (t: Throwable) {
            DemoLog.e("RecyclerView", "catch on onLayoutChildren:" + t.message)
        }

    }
}
