package easemob

import (
	"errors"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/sirupsen/logrus"
)

var log = logrus.WithField("package", "easemob")

type Client struct {
	httpClient *resty.Client
}

func NewClient(debug bool) (*Client, error) {
	client := resty.New()
	client.SetTimeout(1 * time.Minute)
	client.SetBaseURL("https://a1.easemob.com/1122210207030661/demo")
	client.SetHeaders(map[string]string{
		"User-Agent": "super_rent v1.0",
	})

	client.
		// SetDebug(debug).
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

	c := &Client{
		httpClient: client,
	}

	log.Debugf("client base url %s", c.httpClient.BaseURL)

	err := c.login()
	if err != nil {
		return nil, err
	}

	go func() {
		// 6 小时更新一次token
		interval := time.Duration(time.Hour * 6)
		t := time.NewTicker(interval)
		defer t.Stop()
		for {
			<-t.C
			c.login()
		}
	}()

	return c, nil
}
