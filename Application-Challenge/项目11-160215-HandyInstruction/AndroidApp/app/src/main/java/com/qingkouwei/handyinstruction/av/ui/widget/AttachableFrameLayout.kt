package com.qingkouwei.handyinstruction.av.ui.widget

import android.app.Activity
import android.content.Context
import android.graphics.PixelFormat
import android.os.Build
import android.util.AttributeSet
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.annotation.RequiresApi

abstract class AttachableFrameLayout : FrameLayout {


    @JvmField
    protected var wmParams: WindowManager.LayoutParams? = null
    @JvmField
    protected var wManager: WindowManager? = null

    var isAttached: Boolean = false
        protected set

    constructor(context: Context) : super(context)

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs)

    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int, defStyleRes: Int) : super(context, attrs, defStyleAttr, defStyleRes)

    open @Synchronized fun detachFromWindow() {
        if (wManager != null && isAttached) {
            wManager!!.removeView(this)
        }
        isAttached = false
    }

    open @Synchronized fun attachToWindow() {
        if (isAttached) {
            return
        }

        if (null == wManager) {
            if (context is Activity) {
                wManager = (context as Activity).windowManager
            } else {
                wManager = context.applicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            }
        }
        if (wmParams == null) {
            wmParams = WindowManager.LayoutParams()
            if (context is Activity) {
                wmParams!!.type = WindowManager.LayoutParams.TYPE_APPLICATION_ATTACHED_DIALOG
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    wmParams!!.type = WindowManager.LayoutParams.TYPE_PHONE
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    wmParams!!.type = WindowManager.LayoutParams.TYPE_TOAST
                } else {
                    wmParams!!.type = WindowManager.LayoutParams.TYPE_PHONE
                }
            }
            wmParams!!.flags = getWmFlags()

            wmParams!!.format = PixelFormat.TRANSPARENT

            setParams(wmParams!!)
        }

        wManager!!.addView(this, wmParams)

        isAttached = true
    }

    open protected fun getWmFlags(): Int {
        return WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_FULLSCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
    }

    protected abstract fun setParams(params: WindowManager.LayoutParams)
}
