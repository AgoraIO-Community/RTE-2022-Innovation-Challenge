package mobi.accessible.agora_rdc

import mobi.accessible.net.bean.QMResponseData
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.POST

interface Api {



    @POST("/v2/help/askForHelpv1")
    suspend fun askForHelp(@Body requestBody: RequestBody): QMResponseData<String>


}