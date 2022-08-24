package functions

import (
	"fmt"
	"testing"

	"github.com/leancloud/go-sdk/leancloud"
)

func TestPlaceSearch(t *testing.T) {
	option := leancloud.WithSessionToken("fwjsvavunbvdky06tkp6hhpzg")

	r, err := leancloud.Engine.Run("baidu_place_search", map[string]interface{}{
		"query": "", "cityCode": "289", "latitude": "121.486864", "longitude": "31.218883",
	}, option)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("search place results: %s", r)
}
