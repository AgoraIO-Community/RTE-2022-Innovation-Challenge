package com.qingkouwei.handyinstruction.av.ui.widget

import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.RecyclerView
import java.util.*


abstract class BaseRecyclerViewAdapter<T, K : RecyclerView.ViewHolder> : RecyclerView.Adapter<K>() {

    @JvmField
    protected var list: MutableList<T>? = null
    private var callback: BaseDiffCallback<T>? = null

    protected abstract fun createCallback(): BaseDiffCallback<T>?

    protected open fun updateCallback(callback: BaseDiffCallback<T>?, oldList: List<T>?, newList: List<T>?) {
        callback?.setData(oldList, newList)
    }

    override fun getItemCount(): Int {
        if (list != null) {
            return list!!.size
        }
        return 0
    }

    open fun getItem(position: Int): T? {
        if (list == null || position < 0) {
            return null
        }
        return list!![position]
    }

    open fun setData(list: List<T>?) {
        val callback = getCallback(this.list, list)
        if (callback == null) {
            addData(list)
            notifyDataSetChanged()
            return
        }
        val result = DiffUtil.calculateDiff(callback)
        addData(list)
        result.dispatchUpdatesTo(this)
    }

    fun appendData(data:T){
        this.list?.add(data)
    }
    @JvmOverloads fun appendData(list: List<T>?, index: Int = -1) {
        var indexVar = index
        if (list != null) {
            if (this.list == null) {
                this.list = ArrayList()
            }
            var start = this.list!!.size
            if (start < 0) {
                start = 0
            }
            if (indexVar in 0..(start - 1)) {
                this.list!!.addAll(indexVar, list)
            } else {
                this.list!!.addAll(list)
                indexVar = start
            }
            notifyItemRangeInserted(indexVar, list.size)
        }
    }

    private fun addData(list: List<T>?) {
        if (this.list == null) {
            this.list = ArrayList()
        } else {
            this.list!!.clear()
        }
        if (list != null) {
            this.list!!.addAll(list)
        }
    }

    private fun getCallback(oldList: List<T>?, newList: List<T>?): BaseDiffCallback<T>? {
        if (callback == null) {
            callback = createCallback()
        }
        updateCallback(callback, oldList, newList)
        return callback
    }
}
