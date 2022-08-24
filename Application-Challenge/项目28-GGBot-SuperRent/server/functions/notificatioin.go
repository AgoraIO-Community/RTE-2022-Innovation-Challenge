package functions

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/mitchellh/mapstructure"
	"github.com/privatepppp/super-rent/easemob"
	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/payload"
	"github.com/sideshow/apns2/token"

	"github.com/leancloud/go-sdk/leancloud"
)

var apnsClient *apns2.Client

func init() {

	// 定时推送
	leancloud.Engine.Define("schedulePushNotification", schedulePushNotification)

	// 开播提醒
	leancloud.Engine.Define("live_notification", liveNotification)

	authKeyStr := strings.ReplaceAll(os.Getenv("APNS_KEY_P8"), "|", "\n")
	authKey, err := token.AuthKeyFromBytes([]byte(authKeyStr))
	if err != nil {
		panic(err)
	}

	token := &token.Token{
		AuthKey: authKey,
		// KeyID from developer account (Certificates, Identifiers & Profiles -> Keys)
		KeyID: os.Getenv("APNS_KEY_ID"),
		// TeamID from developer account (View Account -> Membership)
		TeamID: os.Getenv("APNS_TEAM_ID"),
	}

	apnsClient = apns2.NewTokenClient(token)
}

func schedulePushNotification(req *leancloud.FunctionRequest) (interface{}, error) {

	payload := payload.NewPayload().Alert("随心租热点事件").AlertBody("附近有租友加入，赶紧登录看看吧👉")
	payload.Custom("f", "1059")

	pushed := notifyAllUsers(nil, payload)

	return pushed, nil
}

type liveNotificationParam struct {
	ChannelId string `mapstructure:"channel_id"`
	NickName  string `mapstructure:"nick_name"`
	UserName  string `mapstructure:"username"`
	Address   string `mapstructure:"address"`
}

func liveNotification(req *leancloud.FunctionRequest) (interface{}, error) {
	var lp liveNotificationParam

	err := mapstructure.Decode(req.Params, &lp)
	if err != nil {
		return nil, err
	}

	body := fmt.Sprintf("%s 正在带看 %s，赶紧去围观吧", lp.NickName, lp.Address)
	payload := payload.NewPayload().Alert("在线带看开播提醒").AlertBody(body)
	payload.Custom("channelId", lp.ChannelId)

	count := notifyAllUsers([]string{lp.UserName}, payload)

	return count, nil
}

func notifyAllUsers(excludes []string, payload *payload.Payload) int {

	excludesStr := strings.Join(excludes, "")

	users := easemob.DefaultClient.FetchAllUsers()

	pushed := 0

	for _, user := range users {
		if strings.Contains(excludesStr, user.Username) {
			continue
		}
		if len(user.DeviceToken) > 0 {
			count, _ := pushPayload(user.Username, payload)
			pushed += count
		}
	}

	return pushed
}

func pushPayload(username string, payload *payload.Payload) (int, error) {
	r, err := easemob.DefaultClient.GetUser(username)
	if err != nil {
		return 0, err
	}

	succeed := 0
	for _, u := range r.Entities {
		for _, pushInfo := range u.PushInfo {
			client := apnsClient.Production()
			if strings.Contains(pushInfo.NotifierName, "development") {
				client = apnsClient.Development()
			}

			n := apns2.Notification{
				DeviceToken: pushInfo.DeviceToken,
				Topic:       "top.rainbowbridge.app.rent.superRent",
				Priority:    apns2.PriorityHigh,
				Payload:     payload,
			}

			res, err := client.Push(&n)
			if err != nil {
				log.Println("There was an error", err)
				continue
			}

			if res.Sent() {
				succeed++
			} else {
				fmt.Printf("Not Sent: %v %v %v\n", res.StatusCode, res.ApnsID, res.Reason)
			}
		}
	}

	return succeed, nil
}
