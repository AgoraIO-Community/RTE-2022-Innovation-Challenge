from agora_token_builder import RtcTokenBuilder
import time
import random
import leancloud

class AgoraUtil:

    def __init__(self,cfg):
        '''
        :param cfg: config.yaml解析成cfg
        '''
        self.appId = cfg["leancloud_appId"]
        self.appKey = cfg["leancloud_appKey"]
        self.masterKey = cfg["leancloud_masterKey"]

        leancloud.init(app_id=self.appId, master_key=self.masterKey)
        self.AGORA_INFO_TABLE = cfg["leanCloud_agora_info"]

        '''获取agora账号信息'''
        query = leancloud.Query(self.AGORA_INFO_TABLE)
        agora_object = None
        try:
            agora_object = query.first()
        except:
            raise Exception("未读取到Agora账号信息")

        self.appId = agora_object.get("appId")
        self.appCertificate = agora_object.get("appCertificate")

    def getAgoraToken(self,channelName, userAccount):

        '''
        :return: 返回token,uid
        '''
        channelName = channelName
        # uid = random.randint(1, 230)
        userAccount = userAccount
        expirationTimeInSeconds = 3600
        currentTimeStamp = int(time.time())
        privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
        role = 1  #role = 1为内容分发者，role = 2为内容订阅者

        # Build token with uid
        # token = RtcTokenBuilder.buildTokenWithUid(self.appId, self.appCertificate, channelName, uid, role, privilegeExpiredTs)
        # Build token with userAccount
        token = RtcTokenBuilder.buildTokenWithAccount(self.appId, self.appCertificate, channelName, userAccount, role, privilegeExpiredTs)
        return token, self.appId