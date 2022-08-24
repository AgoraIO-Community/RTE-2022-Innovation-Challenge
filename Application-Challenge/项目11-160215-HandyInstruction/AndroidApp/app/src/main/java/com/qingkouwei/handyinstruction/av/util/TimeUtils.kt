package com.qingkouwei.handyinstruction.av.util

import android.annotation.SuppressLint
import com.qingkouwei.handyinstruction.R
import java.text.SimpleDateFormat
import java.util.*

class TimeUtils private constructor() {

    init {
        throw RuntimeException("NO INSTANCE !")
    }

    companion object {
        @JvmStatic
        fun formatSecond(seconds: Long): String {
            var minute = seconds / 60
            val hour = minute / 60
            val second = seconds % 60
            minute %= 60
            if (hour > 0) {
                return String.format("%02d:%02d:%02d", hour, minute,
                        second)
            } else {
                return String.format("%02d:%02d", minute, second)
            }
        }

        @JvmStatic
        @SuppressLint("SimpleDateFormat")
        fun getForecastFormat(milliseconds: Long): String {
            if (milliseconds <= 0) {
                return "1970-01-01"
            }
            return SimpleDateFormat(Resource.getString(R.string._forecast_time_format)).format(Date(milliseconds))
        }

        @JvmStatic
        fun  getForecastFormat4Unsubscribed(milliseconds: Long): String {
            if (milliseconds <= 0) {
                return Resource.getString(R.string._text_forecast_unsub_time_unknow)
            }
            val left = milliseconds - System.currentTimeMillis()
            val days = (left / (1000 * 60 * 60 * 24)).toInt()
            if (days > 0) {
                return Resource.getString(R.string._text_forecast_unsub_time_days, days)
            }
            val hours = (left / (1000 * 60 * 60)).toInt()
            if (hours > 0) {
                return Resource.getString(R.string._text_forecast_unsub_time_hours, hours)
            }

            val minutes = (left / (1000 * 60)).toInt()
            if (minutes > 0) {
                return  Resource.getString(R.string._text_forecast_unsub_time_minutes, minutes)
            }

            return Resource.getString(R.string._text_forecast_unsub_time_soon)
        }
    }
}
