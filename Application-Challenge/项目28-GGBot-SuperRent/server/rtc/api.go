package rtc

import (
	"errors"
	"fmt"
	"os"
)

// docs： https://docs.agora.io/cn/cloud-recording/cloud_recording_api_start?platform=RESTful

type AcquireResourceIdResponse struct {
	Channel    string
	Uid        string
	ResourceId string
}

// 获取云端录制资源
func (c *Client) AcquireResourceId(channel string) (*AcquireResourceIdResponse, error) {

	var result struct {
		ResourceId string `json:"resourceId"`
	}

	uid := c.getUid(channel)
	// 先看看有没有
	resp, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"cname": channel,
			"uid":   uid,
			"clientRequest": map[string]interface{}{
				"region":              "CN",
				"resourceExpiredHour": 72,
				"scene":               0,
			},
		}).
		SetResult(&result).
		Post(fmt.Sprintf("v1/apps/%s/cloud_recording/acquire", appID))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("restful err: %s", resp.Status())
	}

	return &AcquireResourceIdResponse{
		Channel:    channel,
		Uid:        uid,
		ResourceId: result.ResourceId,
	}, nil
}

type StartRecordingResponse struct {
	Resource AcquireResourceIdResponse
	Sid      string `json:"sid"`
}

// 开始云端录制
func (c *Client) StartRecording(req AcquireResourceIdResponse) (*StartRecordingResponse, error) {
	var result struct {
		Sid string `json:"sid"`
	}

	token, err := GenerateToken(req.Channel, req.Uid, RoleAdmin)
	if err != nil {
		return nil, err
	}
	// 先看看有没有
	resp, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"cname": req.Channel,
			"uid":   req.Uid,
			"clientRequest": map[string]interface{}{
				"token": token,
				"appsCollection": map[string]interface{}{
					"combinationPolicy": "default",
				},
				"recordingConfig": map[string]interface{}{
					"channelType": 1,
					"streamTypes": 2,
					// 大流
					"videoStreamType": 0,
					// 1分钟
					"maxIdleTime": 60,
				},
				"recordingFileConfig": map[string]interface{}{
					"avFileType": []string{
						"hls",
					},
				},
				"storageConfig": map[string]interface{}{
					// 七牛
					"vendor": 0,
					// 华东
					"region":    0,
					"bucket":    "rainbow-bridge-top",
					"accessKey": os.Getenv("QINIU_ACCESSKEY"),
					"secretKey": os.Getenv("QINIU_SECERTKEY"),
					"fileNamePrefix": []string{
						"superRent",
						"records",
					},
				},
			},
		}).
		SetResult(&result).
		Post(fmt.Sprintf("v1/apps/%s/cloud_recording/resourceid/%s/mode/mix/start", appID, req.ResourceId))

	if err != nil {
		return nil, err
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("restful err: %s", resp.Status())
	}

	return &StartRecordingResponse{
		Resource: req,
		Sid:      result.Sid,
	}, nil
}

type QueryRecordingResponse struct {
	ResourceID     string `json:"resourceId"`
	ServerResponse struct {
		FileListMode string `json:"fileListMode"`
		FileList     []struct {
			FileName       string `json:"fileName"`
			TrackType      string `json:"trackType"`
			UID            string `json:"uid"`
			MixedAllUser   bool   `json:"mixedAllUser"`
			IsPlayable     bool   `json:"isPlayable"`
			SliceStartTime int64  `json:"sliceStartTime"`
		} `json:"fileList"`
		Status         int   `json:"status"`
		SliceStartTime int64 `json:"sliceStartTime"`
	} `json:"serverResponse"`
}

// 查询录制状态
func (c *Client) QueryRecording(resourceId string, sid string) (*QueryRecordingResponse, error) {
	var result QueryRecordingResponse

	// 先看看有没有
	resp, err := c.httpClient.R().
		SetResult(&result).
		Get(fmt.Sprintf("v1/apps/%s/cloud_recording/resourceid/%s/sid/%s/mode/mix/query", appID, resourceId, sid))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("restful err: %s", resp.Status())
	}

	return &result, nil
}

type StopRecordingResponse struct {
	ResourceID     string `json:"resourceId"`
	Sid            string `json:"sid"`
	ServerResponse struct {
		FileListMode    string `json:"fileListMode"`
		FileList        string `json:"fileList"`
		UploadingStatus string `json:"uploadingStatus"`
	} `json:"serverResponse"`
}

// 停止录制
func (c *Client) StopRecording(req StartRecordingResponse) (*StopRecordingResponse, error) {
	var result StopRecordingResponse

	// 先看看有没有
	resp, err := c.httpClient.R().
		SetResult(&result).
		SetBody(map[string]interface{}{
			"cname": req.Resource.Channel,
			"uid":   req.Resource.Uid,
			"clientRequest": map[string]interface{}{
				"async_stop": false,
			},
		}).
		Post(fmt.Sprintf("v1/apps/%s/cloud_recording/resourceid/%s/sid/%s/mode/mix/stop", appID, req.Resource.ResourceId, req.Sid))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("restful err: %s", resp.Status())
	}

	return &result, nil
}

// https://docs.agora.io/cn/live-streaming-premium-4.x/rtc_channel_management_restfulapi?platform=All%20Platforms#查询项目的频道列表
type Channel struct {
	Name         string
	Exist        bool
	Broadcasters []int
	Audience     []int
}

// 频道管理
func (c *Client) GetChannels() ([]string, error) {
	var result struct {
		Success bool
		Data    struct {
			Channels []struct {
				Name string `json:"channel_name"`
			} `json:"channels"`
		}
	}

	// 拿到所有channel
	_, err := c.httpClient.R().
		SetResult(&result).
		Get(fmt.Sprintf("/dev/v1/channel/%s", appID))
	if err != nil {
		return nil, err
	}

	if !result.Success {
		return nil, errors.New("get channel failed")
	}

	var channels []string
	// 拿到每一个channel中的人
	for _, channel := range result.Data.Channels {
		channels = append(channels, channel.Name)
	}

	return channels, nil
}

// 获取某个频道内的用户
func (c *Client) GetChannelUsers(name string) (Channel, error) {
	var userResult struct {
		Success bool
		Data    struct {
			Exist        bool `json:"channel_exist"`
			Broadcasters []int
			Audience     []int
		}
	}

	c.httpClient.R().
		SetResult(&userResult).
		Get(fmt.Sprintf("/dev/v1/channel/user/%s/%s", appID, name))

	return Channel{
		Name:         name,
		Exist:        userResult.Data.Exist,
		Broadcasters: userResult.Data.Broadcasters,
		Audience:     userResult.Data.Audience,
	}, nil
}
