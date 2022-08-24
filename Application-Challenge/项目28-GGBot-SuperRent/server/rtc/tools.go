package rtc

import (
	"os"
	"time"
)

var appID = os.Getenv("AGORA_APP_ID")

func GenerateToken(channelName string, uid string, role Role) (string, error) {
	appCertificate := os.Getenv("AGORA_APP_CERTIFICATE")

	privilegeExpiredTs := uint32(time.Now().Add(time.Hour).Unix())

	return BuildTokenWithUserAccount(appID, appCertificate, channelName, uid, role, privilegeExpiredTs)
}
