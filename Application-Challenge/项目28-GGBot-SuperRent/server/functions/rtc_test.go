package functions

import (
	"fmt"
	"testing"

	"github.com/leancloud/go-sdk/leancloud"
)

func TestGenerateRtcToken(t *testing.T) {

	option := leancloud.WithSessionToken("ddorw4u9l3tza0vjz7hvfqnji")

	r, err := leancloud.Engine.Run("fetch_rtc_token", map[string]interface{}{"channel": "default_house", "role": "admin"}, option)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("RtcToken: %s", r)
}

func TestRecordChannel(t *testing.T) {

	option := leancloud.WithSessionToken("ddorw4u9l3tza0vjz7hvfqnji")

	r, err := leancloud.Engine.Run("request_record", map[string]interface{}{"channel": "62e3586a49de945a2adb0964", "houseObjectId": "62e3586a49de945a2adb0964"}, option)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("request task: %s", r)
}
