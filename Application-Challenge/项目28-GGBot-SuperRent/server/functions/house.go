package functions

import (
	"github.com/leancloud/go-sdk/leancloud"
	"github.com/privatepppp/super-rent/easemob"
)

func init() {

	leancloud.Engine.AfterSave("House", afterSaveHouse)
}

func afterSaveHouse(req *leancloud.ClassHookRequest) error {

	// 创建对应的聊天室
	id, err := easemob.DefaultClient.CreateChatRooms("House直播带看群", "自动生成", req.Object.ID)
	if err != nil {
		return err
	}

	// 生成默认的水印

	ref := Client.Class("House").ID(req.Object.ID)

	if err := ref.Set(
		"chatRoomID", id,
		leancloud.UseMasterKey(true),
	); err != nil {
		return leancloud.CloudError{Code: 500, Message: err.Error()}
	}

	return nil

}
