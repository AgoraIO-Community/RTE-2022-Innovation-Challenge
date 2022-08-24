package functions

import (
	"fmt"

	"github.com/leancloud/go-sdk/leancloud"
	"github.com/privatepppp/super-rent/easemob"
	"github.com/privatepppp/super-rent/tools"
)

func init() {

	leancloud.Engine.AfterSave("Post", afterSavePost)
}

func afterSavePost(req *leancloud.ClassHookRequest) error {

	// 创建对应的聊天室
	id, err := easemob.DefaultClient.CreateChatRooms("Post评论群", "自动生成", req.Object.ID)
	if err != nil {
		return err
	}

	ref := Client.Class("Post").ID(req.Object.ID)

	fmt.Print(tools.Prettify(ref))

	if err := ref.Set(
		"chatRoomID", id,
		leancloud.UseMasterKey(true),
	); err != nil {
		return leancloud.CloudError{Code: 500, Message: err.Error()}
	}

	return nil

}
