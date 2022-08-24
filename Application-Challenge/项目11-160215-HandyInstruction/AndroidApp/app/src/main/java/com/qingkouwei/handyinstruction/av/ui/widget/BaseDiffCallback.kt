package com.qingkouwei.handyinstruction.av.ui.widget

import androidx.recyclerview.widget.DiffUtil

abstract class BaseDiffCallback<T> : DiffUtil.Callback() {

    private var oldList: List<T>? = null
    private var newList: List<T>? = null

    private var startPosition = 0
    private var defaultCount = 0

    /**
     * 设置开始比对位置
     *
     * @param startPosition 默认 0
     */
    fun setStartPosition(startPosition: Int) {
        this.startPosition = startPosition
    }

    /**
     * 是指默认Count
     *
     * @param defaultCount 默认 0
     */
    fun setDefaultCount(defaultCount: Int) {
        this.defaultCount = defaultCount
    }

    fun setData(oldList: List<T>?, newList: List<T>?) {
        this.oldList = oldList
        this.newList = newList
    }

    override fun getOldListSize(): Int {
        var count = startPosition
        if (oldList != null) {
            count += oldList!!.size
        }
        return if (count < defaultCount) defaultCount else count
    }

    override fun getNewListSize(): Int {
        var count = startPosition
        if (newList != null) {
            count += newList!!.size
        }
        return if (count < defaultCount) defaultCount else count
    }

    override fun areItemsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        if (oldItemPosition == newItemPosition && oldItemPosition < startPosition) {
            return true
        }

        if (!areItemsTheSameSub(oldItemPosition, newItemPosition)) {
            return false
        }

        val oldItem = getOldItem(oldItemPosition)
        val newItem = getNewItem(newItemPosition)

        if (oldItem === newItem) {
            return true
        }

        return if (oldItem == null || newItem == null) {
            false
        } else areItemsTheSameSub(oldItem, newItem)

    }

    override fun areContentsTheSame(oldItemPosition: Int, newItemPosition: Int): Boolean {
        if (oldItemPosition == newItemPosition && oldItemPosition < startPosition) {
            return true
        }
        val oldItem = getOldItem(oldItemPosition)
        val newItem = getNewItem(newItemPosition)

        if (oldItem === newItem) {
            return true
        }

        return if (oldItem == null || newItem == null) {
            false
        } else areContentsTheSameSub(oldItem, newItem)

    }

    /**
     * called after [.areItemsTheSameSub],
     * if [.areItemsTheSameSub] return false, won't call this.
     *
     * @param oldItem   oldItem
     * @param newItem   newItem
     * @return          areItemsTheSame
     */
    protected abstract fun areItemsTheSameSub(oldItem: T, newItem: T): Boolean

    /**
     * called before [.areItemsTheSameSub].
     *
     * @param oldItemPosition   oldItemPosition
     * @param newItemPosition   newItemPosition
     * @return                  if false，not call [.areItemsTheSameSub]
     */
    protected open fun areItemsTheSameSub(oldItemPosition: Int, newItemPosition: Int): Boolean = true

    protected open fun areContentsTheSameSub(oldItem: T, newItem: T): Boolean = oldItem == newItem

    protected open fun getOldItem(oldItemPosition: Int): T? = getItem(oldItemPosition, oldList)

    protected open fun getNewItem(newItemPosition: Int): T? = getItem(newItemPosition, newList)

    protected open fun getItem(position: Int, list: List<T>?): T? {
        if (list != null && !list.isEmpty() && position >= startPosition) {
            val realPosition = position - startPosition
            return list[realPosition]
        }
        return null
    }
}
