package easemob

import (
	"fmt"
	"net/http"
	"os"
)

// 登录
func (c *Client) login() error {

	var result struct {
		AccessToken string `json:"access_token"`
	}

	_, err := c.httpClient.R().
		SetResult(&result).
		SetBody(map[string]interface{}{
			"grant_type":    "client_credentials",
			"client_id":     os.Getenv("EM_CLIENT_ID"),
			"client_secret": os.Getenv("EM_CLIENT_SECRET"),
			"ttl":           fmt.Sprintf("%d", 3600*13)}). // 13个小时有效期
		Post("/token")

	if err == nil {
		c.httpClient.SetAuthScheme("Bearer")
		c.httpClient.SetAuthToken(result.AccessToken)
		c.httpClient.SetHeader("Accept", "application/json")
	}

	return err
}

// 注册用户
func (c *Client) CreateUser(username string, password string, nickname string) error {
	resp, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"username": username,
			"password": password,
			"nickname": nickname,
		}).
		Post("/users")
	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("status: %s", resp.Status())
	}
	return err
}

// 删除用户
func (c *Client) DeleteUser(username string) error {
	resp, err := c.httpClient.R().
		Delete("/users/" + username)
	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("status: %s", resp.Status())
	}
	return err
}

// 发送系统消息
func (c *Client) SendSystemMessage(message string, to []string) error {
	resp, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"from": "19900328",
			"to":   to,
			"type": "txt",
			"body": map[string]interface{}{
				"msg": message,
			},
			"sync_device": true,
		}).
		Post("/messages/users")
	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("status: %s", resp.Status())
	}
	return err
}

// 发送透传消息
func (c *Client) SendCMDMessageToChatroom(cmd map[string]interface{}, to []string) error {
	resp, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"from":        "19900328",
			"to":          to,
			"type":        "cmd",
			"body":        cmd,
			"sync_device": true,
		}).
		Post("/messages/chatrooms")
	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("status: %s", resp.Status())
	}
	return err
}

// 创建聊天室
// api: https://docs-im.easemob.com/ccim/rest/chatroom#创建聊天室
// 返回群组id
func (c *Client) CreateChatRooms(name string, description string, custom string) (string, error) {
	var result struct {
		Data struct {
			ID string
		}
	}
	_, err := c.httpClient.R().
		SetBody(map[string]interface{}{
			"name":        name,
			"description": description,
			"maxusers":    10000,
			// 默认为系统管理员
			"owner":  "19900328",
			"custom": custom,
		}).
		SetResult(&result).
		Post("/chatrooms")
	if err == nil {
		return result.Data.ID, nil
	}
	return "", err
}

type GetUserResponse struct {
	Path      string `json:"path"`
	URI       string `json:"uri"`
	Timestamp int64  `json:"timestamp"`
	Entities  []struct {
		Created  int64  `json:"created"`
		Type     string `json:"type"`
		UUID     string `json:"uuid"`
		Nickname string `json:"nickname"`
		Modified int64  `json:"modified"`
		PushInfo []struct {
			DeviceID     string `json:"device_Id"`
			DeviceToken  string `json:"device_token"`
			NotifierName string `json:"notifier_name"`
		} `json:"pushInfo"`
		Username  string `json:"username"`
		Activated bool   `json:"activated"`
	} `json:"entities"`
	Count    int    `json:"count"`
	Action   string `json:"action"`
	Duration int    `json:"duration"`
}

// https://docs-im.easemob.com/ccim/rest/userprofile#获取用户属性
func (c *Client) GetUser(username string) (*GetUserResponse, error) {
	var result GetUserResponse
	resp, err := c.httpClient.R().
		SetResult(&result).
		Get("/users/" + username)
	if resp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("status: %s", resp.Status())
	}

	return &result, err
}

type User struct {
	UUID         string `json:"uuid"`
	Type         string `json:"type"`
	Created      int64  `json:"created"`
	Modified     int64  `json:"modified"`
	Username     string `json:"username"`
	Activated    bool   `json:"activated"`
	Nickname     string `json:"nickname,omitempty"`
	NotifierName string `json:"notifier_name,omitempty"`
	DeviceToken  string `json:"device_token,omitempty"`
}

type fetchAllUsersResponse struct {
	Path      string `json:"path"`
	URI       string `json:"uri"`
	Timestamp int64  `json:"timestamp"`
	Entities  []User `json:"entities"`
	Count     int    `json:"count"`
	Action    string `json:"action"`
	Duration  int    `json:"duration"`
}

func (c *Client) FetchAllUsers() []User {
	var users []User

	for {
		var r fetchAllUsersResponse
		_, err := c.httpClient.R().
			SetResult(&r).
			Get("/users?limit=100&cursor=")

		if err != nil {
			return nil
		}

		users = append(users, r.Entities...)

		if r.Count < 100 {
			break
		}
	}

	return users
}
