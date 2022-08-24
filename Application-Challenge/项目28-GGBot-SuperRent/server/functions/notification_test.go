package functions

import (
	"fmt"
	"testing"

	"github.com/privatepppp/super-rent/tools"
)

func TestSchedulePushNotification(t *testing.T) {

	r, _ := schedulePushNotification(nil)

	fmt.Print(tools.Prettify(r))
}
