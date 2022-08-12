package com.qingkouwei.handyinstruction.av.util

import android.app.Activity
import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.PackageManager.NameNotFoundException
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkInfo
import android.net.Uri
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.preference.PreferenceManager
import android.telephony.TelephonyManager
import android.text.TextUtils
import android.util.DisplayMetrics
import android.util.Log
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.TextView
import java.io.*
import java.text.DecimalFormat
import java.util.*


@Suppress("unused")
class AndroidUtils private constructor() {

    init {
        throw RuntimeException("NO INSTANCE !")
    }

    companion object {


        /**
         * 获取设备的mac地址

         * @param context
         * *
         * @return 返回设备mac
         */
        @JvmStatic
        fun getMacAddress(context: Context): String {
            try {
                val wifi = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
                val info = wifi.connectionInfo
                return if (info == null) "" else info.macAddress
            } catch (e: Exception) {
            }

            return ""
        }

        /**
         * @param context
         * *
         * @return 返回网络是否可用
         */
        @JvmStatic
        fun isNetworkAvailable(context: Context?): Boolean {
            if (context == null)
                return false
            val manager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            @Suppress("DEPRECATION")
            val info = manager.allNetworkInfo
            info.indices
                    .map { info[it] }
                    .forEach {
                        if (it.typeName.equals("WIFI", ignoreCase = true) && it.isConnected) {//忽略大小写
                            return true
                        } else if (it.typeName.equals("mobile", ignoreCase = true) && it.isConnected) {
                            return true
                        }
                    }
            return false
        }


        /**
         * @return 设备版本号
         */

        val systemVersion: String
            @JvmStatic get() = Build.VERSION.RELEASE

        /**
         * 获取版本号名称

         * @param context
         * *
         * @param packageName
         * *
         * @return 应用的版本号
         */
        @JvmStatic
        @JvmOverloads fun getVersionName(context: Context, packageName: String = context.packageName): String {
            val manager = context.packageManager
            val info: PackageInfo
            try {
                info = manager.getPackageInfo(packageName, 0)
                return info.versionName
            } catch (e: NameNotFoundException) {
                e.printStackTrace()
            }

            return ""
        }

        /**
         * 获取版本号

         * @param context
         * *
         * @param packageName
         * *
         * @return 当前应用的版本号
         */
        @JvmStatic
        @JvmOverloads fun getVersionCode(context: Context, packageName: String = context.packageName): Int {
            val manager = context.packageManager
            val info: PackageInfo
            try {
                info = manager.getPackageInfo(packageName, 0)
                return info.versionCode
            } catch (e: NameNotFoundException) {
                e.printStackTrace()
            }

            return -1
        }

        /**
         * 获取metaData。

         * @param act
         * *
         * @return
         */
        @JvmStatic
        fun getApplicaitonMetaData(act: Application): Bundle? {
            try {
                val appInfo = act.packageManager.getApplicationInfo(act.packageName,
                        PackageManager.GET_META_DATA)
                return appInfo.metaData
            } catch (e: NameNotFoundException) {
                e.printStackTrace()
            }

            return null
        }

        /**
         * @return 判断sd卡是否挂载好
         */
        @JvmStatic
        fun isSDCardMounted(): Boolean {
            return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
        }

        /**
         * 隐藏键盘

         * @param aty       aty
         * *
         * @since           隐藏输入法
         */
        @JvmStatic
        fun hideInputMethod(aty: Activity?): Boolean {
            if (aty == null) {
                return false
            }
            return hideInputMethod(aty, aty.currentFocus)
        }

        /**

         * 隐藏键盘

         * @param context       context
         * *
         * @param currentFocus  currentFocus
         * *
         * @return              隐藏输入法
         */
        @JvmStatic
        fun hideInputMethod(context: Context, currentFocus: View?): Boolean {
            if (currentFocus != null) {
                val manager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                return manager.hideSoftInputFromWindow(currentFocus.windowToken, InputMethodManager.HIDE_NOT_ALWAYS)
            }
            return false
        }

        /**
         * 显示键盘

         * @param context
         * *
         * @param view
         * *
         * @since 显示软键盘
         */
        @JvmStatic
        fun showInputMethod(context: Context, view: View) {
            val manager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            manager.showSoftInput(view, 0)
        }

        /**
         * 获取屏幕宽度

         * @param context
         * *
         * @return
         */
        @JvmStatic
        fun getScreenWidth(context: Context): Int {
            return context.resources.displayMetrics.widthPixels
        }

        /**
         * 获取屏幕高度

         * @param context
         * *
         * @return
         */
        @JvmStatic
        fun getScreenHeight(context: Context): Int {
            return context.resources.displayMetrics.heightPixels
        }

        @JvmStatic
        fun getScreenSize(context: Context): DisplayMetrics {
            val metrics = context.resources.displayMetrics
            return metrics
        }

        /**
         * 通过包名检测系统中是否安装某个应用程序

         * @param context
         * *
         * @param packageName
         * *
         * @return
         */
        @JvmStatic
        fun checkApkExist(context: Context, packageName: String): Boolean {
            if (TextUtils.isEmpty(packageName)) {
                return false
            }
            try {
                @Suppress("DEPRECATION")
                context.packageManager.getApplicationInfo(packageName, PackageManager.GET_UNINSTALLED_PACKAGES)
                return true
            } catch (e: NameNotFoundException) {
                return false
            }

        }

        /**
         * 格式化文件大小
         */
        @JvmStatic
        fun formatFileSize(fileS: Long): String {// 转换文件大小
            val df = DecimalFormat("#")
            var fileSizeString: String?
            if (fileS < 1024) {
                fileSizeString = df.format(fileS.toDouble()) + "B"
                if ("0B" == fileSizeString) {
                    fileSizeString = "1B"
                }
            } else if (fileS < 1048576) {
                fileSizeString = df.format(fileS.toDouble() / 1024) + "K"
                if ("0K" == fileSizeString) {
                    fileSizeString = "1K"
                }
            } else if (fileS < 1073741824) {
                fileSizeString = df.format(fileS.toDouble() / 1048576) + "M"
                if ("0M" == fileSizeString) {
                    fileSizeString = "1M"
                }
            } else {
                fileSizeString = df.format(fileS.toDouble() / 1073741824) + "G"
                if ("0G" == fileSizeString) {
                    fileSizeString = "1G"
                }
            }
            return fileSizeString
        }

        /**
         * 获取文件大小

         * @param f
         * *
         * @return
         * *
         * @throws Exception
         */
        @JvmStatic
        @Throws(Exception::class)
        fun getFileSize(f: File): Long {
            var size: Long = 0
            val flist = f.listFiles()
            flist.indices
                    .asSequence()
                    .map { flist[it] }
                    .forEach {
                        if (it.isDirectory) {
                            size += getFileSize(it)
                        } else {
                            size += it.length()
                        }
                    }
            return size
        }

        /**
         * 递归删除文件和文件夹

         * @param file 要删除的根目录
         */
        @JvmStatic
        fun recursionDeleteFile(file: File) {
            if (file.isFile) {
                file.delete()
                return
            }
            if (file.isDirectory) {
                val childFile = file.listFiles()
                if (childFile == null || childFile.isEmpty()) {
                    if (!file.isDirectory) {
                        file.delete()
                    }
                    return
                }
                for (f in childFile) {
                    recursionDeleteFile(f)
                }
                // file.delete();
            }
        }

        /**
         * 是否是二次点击，防止重复点击。
         */
        private var lastClickTime: Long = 0

        @JvmStatic
        fun isFastDoubleClick(): Boolean {
            val time = System.currentTimeMillis()
            val timeD = time - lastClickTime
            if (timeD in 1..799) {
                return true
            }
            lastClickTime = time
            return false
        }

        @JvmStatic
        fun saveBitmapToFile(bitmap: Bitmap, path: String, format: Bitmap.CompressFormat): Boolean {
            var ret = false
            val file = File(path)
            if (!bitmap.isRecycled) {
                try {
                    ret = bitmap.compress(format, 80, FileOutputStream(file, false))
                } catch (e: Exception) {
                }

                if (!ret) {
                    file.delete()
                }
            }
            return ret
        }

        @JvmStatic
        fun setTextViewLeftDrawable(context: Context, tv: TextView, id: Int) {
            @Suppress("DEPRECATION")
            val img = context.resources.getDrawable(id)
            // 调用setCompoundDrawables时，必须调用Drawable.setBounds()方法,否则图片不显示
            img.setBounds(0, 0, img.minimumWidth, img.minimumHeight)
            tv.setCompoundDrawables(img, null, null, null) //设置左图标
        }


        @JvmStatic
        fun installUpdateApp(context: Context, downloadUrl: String) {
            //    	String appName = FileUtil.getFileNameFromUrl(downloadUrl).replace("/", "");
            val appFile = File(downloadUrl)
            if (appFile.exists()) {
                /*if (!appName.endsWith(".apk")) {
    			appName = appName.substring(0, appName.lastIndexOf(".apk") + 4);
    			appFile.renameTo(new File(Globals.GAMEAPK_PATH + appName));
    		}*/
                val intent = Intent(Intent.ACTION_VIEW)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)//service中启动activity
                intent.setDataAndType(Uri.fromFile(appFile),
                        "application/vnd.android.package-archive")
                context.startActivity(intent)
            }
        }

        @JvmStatic
        fun getAppPackageName(context: Context, appName: String): String? {
            val mAppList = context.packageManager.getInstalledApplications(0)
            for (item in mAppList) {
                if (item.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
                    if (item.loadLabel(context.packageManager).toString()
                            .contains(appName)) {
                        return item.packageName
                    }
                } else {

                }
            }
            return null
        }

        @JvmStatic
        fun openApp(context: Context, appPackageName: String) {
            val resolveIntent = Intent(Intent.ACTION_MAIN, null)
            resolveIntent.addCategory(Intent.CATEGORY_LAUNCHER)
            resolveIntent.`package` = appPackageName
            val resolveInfoList = context.packageManager
                    .queryIntentActivities(resolveIntent, 0)
            if (resolveInfoList != null && resolveInfoList.size > 0) {
                val resolveInfo = resolveInfoList[0]
                val activityPackageName = resolveInfo.activityInfo.packageName
                val className = resolveInfo.activityInfo.name

                val intent = Intent(Intent.ACTION_MAIN)
                intent.addCategory(Intent.CATEGORY_LAUNCHER)
                val componentName = ComponentName(
                        activityPackageName, className)

                intent.component = componentName
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }
        }

        /**
         * 判断当前网络是否已经连接，并且是2G状态

         * @param ctx
         * *
         * @return
         */
        @JvmStatic
        fun is2GMobileNetwork(ctx: Context): Boolean {
            val manager = ctx.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val info: NetworkInfo?
            try {
                info = manager.activeNetworkInfo
                if (info != null && info.type == ConnectivityManager.TYPE_MOBILE) {
                    val currentNetworkType = info.subtype
                    /*if (currentNetworkType == TelephonyManager.NETWORK_TYPE_GPRS
                        || currentNetworkType == TelephonyManager.NETWORK_TYPE_CDMA
                        || currentNetworkType == TelephonyManager.NETWORK_TYPE_EDGE) {
                    return true;
                }*/
                    return true
                }
            } catch (e: Exception) {
            }

            return false
        }

        @JvmStatic
        fun isWifiNetwork(context: Context?): Boolean {
            if (context != null) {
                val mConnectivityManager = context
                        .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
                val info: NetworkInfo?
                try {
                    info = mConnectivityManager.activeNetworkInfo
                    if (info != null && info.type == ConnectivityManager.TYPE_WIFI) {
                        return true
                    }
                } catch (e: Exception) {
                    return false
                }

            }
            return false
        }


        /**

         * 截屏

         * @param  activity

         * *
         * @return
         */

        @JvmStatic
        fun captureScreen(activity: Activity): Bitmap {

            activity.window.decorView.isDrawingCacheEnabled = true

            val bmp = activity.window.decorView.drawingCache

            return bmp

        }

        /**
         * 是否是第一次使用软件
         * @return true:首次安装 false:升级了
         */
        @JvmStatic
        fun isFirstUse(context: Context): Int {
            try {
                val info = context.packageManager.getPackageInfo(context.packageName, 0)
                val curVersion = info.versionCode
                // SettingUtils.setEditor(context, "version", paramString2);
                // int lastVersion = SettingUtils.getSharedPreferences(context, "version", 0);
                val sp = PreferenceManager.getDefaultSharedPreferences(context)
                val lastVersion = sp.getInt("version", 0)
                if (curVersion > lastVersion && lastVersion == 0) {
                    // 如果当前版本大于上次版本，该版本属于第一次启动
                    // 将当前版本写入preference中，则下次启动的时候，据此判断，不再为首次启动
                    return 1// 首次安装
                } else {
                    if (curVersion != lastVersion) {
                        Log.i("TTT", " 升级 curVersion  " + curVersion)
                        return 2// 升级
                    } else {
                        Log.i("TTT", " 不升级 curVersion  " + curVersion)
                        return 0// 正常安装
                    }

                }
            } catch (e: NameNotFoundException) {
                Log.i("TTT", " isFirstUse e " + e.toString())
            }

            return 0// 正常安装
        }

        /**
         * setAPPUsed:设置APP已经使用过了. <br></br>
         * @author wangheng
         */
        @JvmStatic
        fun setAPPUsed(context: Context) {
            try {
                val info = context.packageManager.getPackageInfo(context.packageName, 0)
                val curVersion = info.versionCode
                val sp = PreferenceManager.getDefaultSharedPreferences(context)
                sp.edit().putInt("version", curVersion).apply()
                // SettingUtils.setEditor(context, "version", curVersion);
            } catch (e: NameNotFoundException) {
                Log.i("TTT", " setAPPUsed e " + e.toString())
            }

        }

        @JvmStatic
        fun inputStreamToString(`is`: InputStream): String {

            var s = ""
            val rd = BufferedReader(InputStreamReader(`is`))
            try {
                var line = rd.readLine()
                while (line != null) {
                    s += line
                    line = rd.readLine()
                }
            } catch (e: IOException) {
                e.printStackTrace()
            }

            return s
        }

        @JvmStatic
        fun lengthByChar(s: String?): Int {
            if (s == null) {
                return 0
            }
            val c = s.toCharArray()
            var len = 0
            for (i in c.indices) {
                len++
                if (!isLetter(c[i])) {
                    len++
                }
            }
            return len
        }

        @JvmStatic
        private fun isLetter(c: Char): Boolean {
            return c.toInt() / ASCII_UPPER_LIMIT == 0
        }

        private val ASCII_UPPER_LIMIT = 0x80

        @JvmStatic
        fun checkAndroidVersion(sdk_int: Int): Boolean {
            return Build.VERSION.SDK_INT == sdk_int
        }

        @JvmStatic
        fun checkGTAndroidVersion(sdk_int: Int): Boolean {
            return Build.VERSION.SDK_INT > sdk_int
        }

        @JvmStatic
        fun checkLTAndroidVersion(sdk_int: Int): Boolean {
            return Build.VERSION.SDK_INT < sdk_int
        }

        /**
         * 金额分制转元制，服务端接口涉及金额的数值全部为分制
         */
        @JvmStatic
        fun formatMoneyFenToYuan(money: Long): String =
                String.format(Locale.getDefault(), "%.2f", money / 100f)

        @JvmStatic
        fun formatMoneyYuanToYuan(money: Float): String =
                String.format(Locale.getDefault(), "%.2f", money)

        @JvmStatic
        fun valueMoneyFenToYuan(money: Long): Float = money / 100f
        @JvmStatic
        fun isAndroidN(): Boolean {
            return Build.VERSION.SDK_INT >= 24
        }
    }


}
