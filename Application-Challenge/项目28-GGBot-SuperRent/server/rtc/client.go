package rtc

import (
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/sirupsen/logrus"
)

var log = logrus.WithField("package", "easemob")

type Client struct {
	httpClient      *resty.Client
	channelUidPools map[string]*IDPool
}

func NewClient(debug bool) (*Client, error) {
	client := resty.New()
	client.SetTimeout(1 * time.Minute)
	client.SetBaseURL("https://api.agora.io/")
	client.SetHeaders(map[string]string{
		"User-Agent": "super_rent v1.0",
	})

	client.
		SetDebug(debug).
		// Set retry count to non zero to enable retries
		SetRetryCount(3).
		// You can override initial retry wait time.
		// Default is 100 milliseconds.
		SetRetryWaitTime(5 * time.Second).
		// MaxWaitTime can be overridden as well.
		// Default is 2 seconds.
		SetRetryMaxWaitTime(20 * time.Second).
		// SetRetryAfter sets callback to calculate wait time between retries.
		// Default (nil) implies exponential backoff with jitter
		SetRetryAfter(func(client *resty.Client, resp *resty.Response) (time.Duration, error) {
			return 0, errors.New("quota exceeded")
		})

	key := os.Getenv("AGORA_KEY")
	secret := os.Getenv("AGORA_SECRET")

	// 拼接客户 ID 和客户密钥并使用 base64 进行编码
	plainCredentials := key + ":" + secret
	base64Credentials := base64.StdEncoding.EncodeToString([]byte(plainCredentials))

	client.SetAuthScheme("Basic")
	client.SetAuthToken(base64Credentials)
	client.SetHeader("Content-Type", "application/json")

	c := &Client{
		httpClient:      client,
		channelUidPools: make(map[string]*IDPool),
	}

	log.Debugf("client base url %s", c.httpClient.BaseURL)

	return c, nil
}

func (c *Client) getUid(channel string) string {
	pool := c.channelUidPools[channel]
	if pool == nil {
		pool = NewIDPool(100)
		for i := 1; i <= 100; i++ {
			// 默认 1-100 为云端录制id
			// 先放100个id进去
			pool.Put(uint32(i))
		}
		c.channelUidPools[channel] = pool
	}
	return fmt.Sprintf("%d", pool.Get())
}
