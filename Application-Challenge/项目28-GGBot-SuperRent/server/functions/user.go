package functions

import (
	"fmt"
	"strconv"
	"time"

	"github.com/leancloud/go-sdk/leancloud"
	"github.com/privatepppp/super-rent/easemob"
	"github.com/privatepppp/super-rent/tools"
)

func init() {

	leancloud.Engine.AfterSave("_User", afterSaveUser)

	leancloud.Engine.Define("find_user_by_conversation_id", findUserByConversationId)
}

func afterSaveUser(req *leancloud.ClassHookRequest) error {

	fmt.Printf("afterSaveUser: %v \n", req.Object)

	if req.Object != nil {

		// 新用户注册 随机为其生成头像和用户名
		p := tools.RandomProfile()

		diff := map[string]interface{}{
			"nickname":       p.NickName,
			"avatar":         p.Avatar,
			"gender":         p.Gender,
			"lastLoggedInAt": time.Now(),
		}

		emUid := fmt.Sprintf("%.0f", req.Object.Float("emUid"))

		// 新注册用户为其生成环信账号并落库
		if err := easemob.DefaultClient.CreateUser(emUid, req.Object.ID, p.NickName); err != nil {
			return err
		}
		diff["easemobRegistered"] = true

		if err := Client.Users.ID(req.Object.ID).Update(diff, leancloud.UseMasterKey(true)); err != nil {
			fmt.Println(err)
			return err
		}

	}

	return nil
}

func findUserByConversationId(req *leancloud.FunctionRequest) (interface{}, error) {

	conversationId := req.Params.(map[string]interface{})["conversationId"].(string)

	emUid, err := strconv.Atoi(conversationId)
	if err != nil {
		return nil, err
	}
	ref := Client.Users.NewQuery().EqualTo("emUid", emUid)

	user := new(leancloud.User)
	err = ref.First(user, leancloud.UseMasterKey(true))

	return user, err
}

// TODO
// https://t3mpl.n4no.com/editor/#manifest=../templates/mobile-app-landing-page/template.yaml
