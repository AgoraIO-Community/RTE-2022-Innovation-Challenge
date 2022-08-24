package functions

import (
	"fmt"
	"testing"

	"github.com/leancloud/go-sdk/leancloud"
)

func TestLogin(t *testing.T) {
	option := leancloud.WithSessionToken("uckr77dxqv7x0rf4sqbzhr7ae")

	r, err := leancloud.Engine.Run("find_user_by_conversation_id", map[string]interface{}{"conversationId": "1025"}, option)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("user: %s", r)
}
