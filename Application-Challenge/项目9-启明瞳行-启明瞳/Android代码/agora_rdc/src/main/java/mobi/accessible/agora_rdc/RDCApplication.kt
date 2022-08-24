package mobi.accessible.agora_rdc

import android.app.Application

object RDCApplication {

    var mApplication: Application? = null

    fun onCreate(application: Application) {
        mApplication = application
    }


}