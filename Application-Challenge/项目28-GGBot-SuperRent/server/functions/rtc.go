package functions

import (
	"fmt"
	"time"

	"github.com/leancloud/go-sdk/leancloud"
	"github.com/mitchellh/mapstructure"
	"github.com/privatepppp/super-rent/easemob"
	"github.com/privatepppp/super-rent/rtc"
)

func init() {

	// token 鉴权
	leancloud.Engine.Define("fetch_rtc_token", fetchRtcToken)

	// 云录制
	leancloud.Engine.Define("request_record", requestRecord)
	leancloud.Engine.Define("stop_record", stopRecord)
	leancloud.Engine.Define("handleUnexpectedRecordTask", handleUnexpectedRecordTask)

	// 频道管理
	leancloud.Engine.Define("get_channels", getChannels)
	leancloud.Engine.Define("get_channel", getChannel)
}

func getChannel(req *leancloud.FunctionRequest) (interface{}, error) {
	p := req.Params.(map[string]string)
	return rtc.DefaultClient.GetChannelUsers(p["channel"])
}

func getChannels(req *leancloud.FunctionRequest) (interface{}, error) {

	names, err := rtc.DefaultClient.GetChannels()
	if err != nil {
		return nil, err
	}

	var channels []rtc.Channel
	for _, name := range names {
		channel, err := rtc.DefaultClient.GetChannelUsers(name)
		if err != nil {
			return nil, err
		}
		channels = append(channels, channel)
	}

	return channels, nil

}

//////////////////
type requestRecordReq struct {
	HouseObjectId string
	Channel       string
	ChatRoomId    string
}

// 录制直播
func requestRecord(req *leancloud.FunctionRequest) (interface{}, error) {
	var request requestRecordReq
	if err := mapstructure.Decode(req.Params, &request); err != nil {
		return nil, err
	}

	// 尝试去申请录制资源
	resp, err := rtc.DefaultClient.AcquireResourceId(request.Channel)
	if err != nil {
		return nil, err
	}

	// 开始录制
	startResponse, err := rtc.DefaultClient.StartRecording(*resp)
	if err != nil {
		return nil, err
	}

	// 0：没有开始云服务。
	// 1：云服务初始化完成。
	// 2：云服务组件开始启动。
	// 3：云服务部分组件启动完成。
	// 4：云服务所有组件启动完成。
	// 5：云服务正在进行中。
	// 6：云服务收到停止请求。
	// 7：云服务所有组件均停止。
	// 8：云服务已退出。
	// 20：云服务异常退出

	// 将这个录制任务 插入到数据库中，后续会有定时任务 每隔5分钟 处理一下相关任务
	ref, err := Client.Class("RecordTask").Create(map[string]interface{}{
		"resourceId": startResponse.Resource.ResourceId,
		"uid":        startResponse.Resource.Uid,
		"sid":        startResponse.Sid,
		"channel":    startResponse.Resource.Channel,
		"houseId":    request.HouseObjectId,
		"chatRoomId": request.ChatRoomId,
		"status":     "recording",
	})
	if err != nil {
		return nil, err
	}

	go func() {
		// 30s 更新一次录制状态
		interval := time.Duration(time.Second * 30)
		t := time.NewTicker(interval)
		defer t.Stop()
		for {
			r, err := rtc.DefaultClient.QueryRecording(startResponse.Resource.ResourceId, startResponse.Sid)
			if err != nil {
				break
			}
			status := r.ServerResponse.Status
			if status > 0 && status < 6 {
				// 发消息给客户端，录制一切正常
				easemob.DefaultClient.SendCMDMessageToChatroom(map[string]interface{}{
					"action": "record_task",
					"status": r.ServerResponse.Status,
				}, []string{request.ChatRoomId})
			} else {
				break
			}
		}
	}()

	return ref.ID, nil
}

type stopRecordRequest struct {
	TaskObjectId string
}

func stopRecord(req *leancloud.FunctionRequest) (interface{}, error) {
	var request stopRecordRequest
	if err := mapstructure.Decode(req.Params, &request); err != nil {
		return nil, err
	}

	// 将recordTask 查出来
	recordTask := new(leancloud.Object)
	if err := Client.Class("RecordTask").ID(request.TaskObjectId).Get(recordTask); err != nil {
		return nil, err
	}

	return stopRecordTask(recordTask)
}

// 处理录制任务
//
func stopRecordTask(recordTask *leancloud.Object) (bool, error) {
	resourceId := recordTask.String("resourceId")
	uid := recordTask.String("uid")
	sid := recordTask.String("sid")
	channel := recordTask.String("channel")

	response, err := rtc.DefaultClient.StopRecording(rtc.StartRecordingResponse{
		Resource: rtc.AcquireResourceIdResponse{
			ResourceId: resourceId,
			Uid:        uid,
			Channel:    channel,
		},
		Sid: sid,
	})

	if err != nil {
		if err := Client.Object(recordTask).Update(map[string]interface{}{
			"status": "err-on-stop",
		}); err != nil {
			return false, err
		}
		return false, nil
	}

	if err := Client.Object(recordTask).Update(map[string]interface{}{
		"file": response.ServerResponse.FileList, "status": "waiting-assign"}); err != nil {
		return false, nil
	}

	return true, nil
}

// 处理异常退出的录制任务
//
func handleUnexpectedRecordTask(req *leancloud.FunctionRequest) (interface{}, error) {

	// 查找所有状态不对的recordTask
	tasks := new([]*leancloud.Object)
	if err := Client.Class("RecordTask").NewQuery().EqualTo("status", "recording").Find(tasks); err == nil {
		for _, task := range *tasks {
			resourceId := task.String("resourceId")
			sid := task.String("sid")
			r, err := rtc.DefaultClient.QueryRecording(resourceId, sid)
			if err != nil {
				go stopRecordTask(task)
			}
			status := r.ServerResponse.Status
			if status > 0 && status < 6 {
				// 发消息给客户端，录制一切正常
				easemob.DefaultClient.SendCMDMessageToChatroom(map[string]interface{}{
					"action": "record_task",
					"status": r.ServerResponse.Status,
				}, []string{task.String("chatRoomId")})
			} else {
				go stopRecordTask(task)
			}
		}
	}

	return nil, nil
}

///////////////
type fetchRtcTokenReq struct {
	Channel string
	Role    string // admin,publisher,subscriber,attendee
}

func fetchRtcToken(req *leancloud.FunctionRequest) (interface{}, error) {
	var r fetchRtcTokenReq
	if err := mapstructure.Decode(req.Params, &r); err != nil {
		return nil, err
	}

	role := rtc.RoleSubscriber

	switch r.Role {
	case "admin":
		role = rtc.RoleAdmin
	case "subscriber":
		role = rtc.RoleSubscriber
	case "publisher":
		role = rtc.RolePublisher
	case "attendee":
		role = rtc.RoleAttendee
	default:
		return nil, fmt.Errorf("unknown role type: %s", r.Role)
	}

	emUID := req.CurrentUser.Get("emUid").(float64)

	return rtc.GenerateToken(r.Channel, fmt.Sprintf("%.0f", emUID), role)
}
