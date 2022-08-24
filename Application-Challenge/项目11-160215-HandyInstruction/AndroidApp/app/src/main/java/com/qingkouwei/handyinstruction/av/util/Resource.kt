package com.qingkouwei.handyinstruction.av.util

import android.content.res.ColorStateList
import android.graphics.drawable.Drawable
import android.os.Build
import android.text.Html
import android.util.LruCache
import androidx.annotation.ArrayRes
import androidx.annotation.ColorInt
import androidx.annotation.ColorRes
import androidx.annotation.DimenRes
import androidx.annotation.DrawableRes
import androidx.annotation.IdRes
import androidx.annotation.StringRes
import com.qingkouwei.handyinstruction.DemoApplication

@Suppress("unused")
class Resource private constructor() {

  init {
    throw RuntimeException("NO INSTANCE !")
  }

  companion object {

    private const val MAX_SIZE_COLOR = 20
    private const val MAX_SIZE_COLOR_STATE_LIST = 10

    private var sColorCache: LruCache<Int, Int>? = null
    private var sColorStateListCache: LruCache<Int, ColorStateList>? = null

    @JvmStatic
    @ColorInt
    fun getColor(@ColorRes resId: Int): Int {
      if (resId == 0) {
        return 0
      }

      if (sColorCache == null) {
        sColorCache = LruCache<Int, Int>(MAX_SIZE_COLOR)
      }

      val value = sColorCache!!.get(resId)
      @Suppress("DEPRECATED_IDENTITY_EQUALS")
      if (value != null && value !== 0) {
        return value
      }

      @ColorInt val color: Int
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        color = DemoApplication.getInstance().getColor(resId)
      } else {
        @Suppress("DEPRECATION")
        color = DemoApplication.getInstance().resources.getColor(resId)
      }
      if (color != 0) {
        sColorCache!!.put(resId, color)
      }
      return color
    }

    @JvmStatic
    fun getColorStateList(@ColorRes resId: Int): ColorStateList? {
      if (resId == 0) {
        return null
      }

      if (sColorStateListCache == null) {
        sColorStateListCache = LruCache<Int, ColorStateList>(MAX_SIZE_COLOR_STATE_LIST)
      }

      val value = sColorStateListCache!!.get(resId)
      if (value != null) {
        return value
      }

      val color: ColorStateList?
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        color =DemoApplication.getInstance().getColorStateList(resId)
      } else {
        @Suppress("DEPRECATION")
        color =DemoApplication.getInstance().resources.getColorStateList(resId)
      }
      if (color != null) {
        sColorStateListCache!!.put(resId, color)
      }
      return color
    }

    @JvmStatic
    fun getDrawable(@DrawableRes resId: Int): Drawable {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        return DemoApplication.getInstance().getDrawable(resId)!!
      } else {
        @Suppress("DEPRECATION")
        return DemoApplication.getInstance().resources.getDrawable(resId)
      }
    }

    @JvmStatic
    fun getText(@StringRes resId: Int): CharSequence {
      return DemoApplication.getInstance().getText(resId)
    }

    @JvmStatic
    fun getString(@StringRes resId: Int): String {
      return DemoApplication.getInstance().getString(resId)
    }

    @JvmStatic
    fun getString(@StringRes resId: Int, vararg formatArgs: Any): String {
      return DemoApplication.getInstance().getString(resId, *formatArgs)
    }

    @JvmStatic
    fun getStringHtml(@StringRes resId: Int): CharSequence {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        return Html.fromHtml(getString(resId), Html.FROM_HTML_MODE_LEGACY)
      }

      @Suppress("DEPRECATION")
      return Html.fromHtml(getString(resId))
    }

    @JvmStatic
    fun getStringHtml(@StringRes resId: Int, vararg formatArgs: Any): CharSequence {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        return Html.fromHtml(getString(resId, *formatArgs), Html.FROM_HTML_MODE_LEGACY)
      }

      @Suppress("DEPRECATION")
      return Html.fromHtml(getString(resId, *formatArgs))
    }

    @JvmStatic
    fun getStringArray(@ArrayRes resId: Int): Array<String> {
      return DemoApplication.getInstance().resources.getStringArray(resId)
    }

    @JvmStatic
    fun getIntArray(@ArrayRes resId: Int): IntArray {
      return DemoApplication.getInstance().resources.getIntArray(resId)
    }

    @JvmStatic
    fun getDimensionPixelOffset(@DimenRes resId: Int): Int {
      return DemoApplication.getInstance().resources.getDimensionPixelOffset(resId)
    }

    @JvmStatic
    fun release() {
      if (sColorCache != null) {
        sColorCache!!.evictAll()
        sColorCache = null
      }
      if (sColorStateListCache != null) {
        sColorStateListCache!!.evictAll()
        sColorStateListCache = null
      }
    }

    @JvmStatic
    @IdRes
    fun getIdRes(idName: String): Int {
      return getResId(idName, "id")
    }

    @JvmStatic
    @DrawableRes
    fun getDrawableRes(idName: String): Int {
      return getResId(idName, "drawable")
    }

    @JvmStatic
    @ColorRes
    fun getColorRes(idName: String): Int {
      return getResId(idName, "color")
    }

    @JvmStatic
    @StringRes
    fun getStringRes(idName: String): Int {
      return getResId(idName, "string")
    }

    @JvmStatic
    private fun getResId(idName: String, defType: String): Int {
      return DemoApplication.getInstance().resources.getIdentifier(
        idName,
        defType,
        DemoApplication.getInstance().packageName
      )
    }
  }
}
