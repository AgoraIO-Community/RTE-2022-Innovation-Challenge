package rtc

import (
	"fmt"
	"testing"
	"time"

	"github.com/privatepppp/super-rent/tools"
)

func TestCloudRecording(t *testing.T) {

	response, err := DefaultClient.AcquireResourceId("62e3586a49de945a2adb0964")
	if err != nil {
		t.Fatal(err)
	}

	r, err := DefaultClient.StartRecording(*response)
	if err != nil {
		t.Fatal(err)
	}

	time.Sleep(time.Second * 5)

	queryResponse, err := DefaultClient.QueryRecording(r.Resource.ResourceId, r.Sid)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(queryResponse)
}

var resourceId = "nUwUbQf9Zg6tsgtLslGnDg0lk8RYaUE09pqOuSIgwfxMk-VWHQuTKH_iZaOwqIVRY0FWrZNQkSqY9dGPijyclctlSsGT8yZ7RmZOYs0tIE_jfApfsYw4DqsFjjQ5Qnoy3vBT4izZnwa7DPVPWzhBtrdwWz5HLo_Sf0wRUg0p7bEUUroLe_UEX-tvAfppHbTcuuDdi5ukEGfP9FN0V2L4PHyeqlRiiZHsc2LaXZTFB3ntAxBDEXgXzNXKx2Ym0qL0yw-Y26LZE21Ss_V7nSAhArWgftcaIVKg4cCzdMpTJet_lAzglbO5nsfVFFdyGUpJWoUNonNfREY4n4SI9luDawrfo9ybRuluTzNcZKkMBFWbLvXzBXdCSYCkjHvligk7"
var sid = "47bdb170c048c49f9eb1f4bbcdad0db0"

func TestQueryRecordingStatus(t *testing.T) {

	queryResponse, err := DefaultClient.QueryRecording(resourceId, sid)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(queryResponse)
}

func TestStopRecord(t *testing.T) {
	DefaultClient.StopRecording(StartRecordingResponse{
		Sid: sid,
		Resource: AcquireResourceIdResponse{
			Channel:    "62e3586a49de945a2adb0964",
			ResourceId: resourceId,
			Uid:        "33",
		},
	})
}

func TestGetChannels(t *testing.T) {
	channels, err := DefaultClient.GetChannels()
	if err != nil {
		t.Fatal(err)
	}

	tools.Prettify(channels)
}
