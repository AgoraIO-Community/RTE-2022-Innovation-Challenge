package functions

import "github.com/leancloud/go-sdk/leancloud"

var Client *leancloud.Client

func init() {
	Client = leancloud.NewEnvClient()

	leancloud.Engine.Init(Client)
}
