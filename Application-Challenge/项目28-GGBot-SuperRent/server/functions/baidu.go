package functions

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/leancloud/go-sdk/leancloud"
	"github.com/mitchellh/mapstructure"
)

func init() {
	leancloud.Engine.Define("baidu_place_search", placeSearch)
}

type placeSearchParam struct {
	Query     string `mapstructure:"query"`
	CityCode  string `mapstructure:"cityCode"`
	Latitude  string `mapstructure:"latitude"`
	Longitude string `mapstructure:"longitude"`
}

func placeSearch(req *leancloud.FunctionRequest) (interface{}, error) {
	var pg placeSearchParam
	err := mapstructure.Decode(req.Params, &pg)
	if err != nil {
		return nil, err
	}

	return _search(pg)
}

type searchResponse struct {
	Status     int      `json:"status"`
	Message    string   `json:"message"`
	Total      int      `json:"total"`
	ResultType string   `json:"result_type"`
	Results    []Result `json:"result"`
}
type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Result struct {
	Name      string   `json:"name"`
	Location  Location `json:"location"`
	Address   string   `json:"address"`
	Province  string   `json:"province"`
	City      string   `json:"city"`
	Area      string   `json:"area"`
	StreetID  string   `json:"street_id,omitempty"`
	Detail    int      `json:"detail"`
	UID       string   `json:"uid"`
	Telephone string   `json:"telephone,omitempty"`
	District  string   `json:"district,omitempty"`
	Business  string   `json:"business,omitempty"`
	CityID    string   `json:"cityid,omitempty"`
	Tag       string   `json:"tag,omitempty"`
	AdCode    string   `json:"adcode,omitempty"`
}

func _search(pg placeSearchParam) ([]Result, error) {
	data := url.Values{}

	if pg.Query != "" {
		data.Add("query", pg.Query)
	} else {
		data.Add("query", "住宅区")
	}

	data.Add("tag", "住宅区")
	data.Add("region", pg.CityCode)
	data.Add("city_limit", "true")
	// data.Add("location", fmt.Sprintf("%s,%s", pg.Latitude, pg.Longitude))
	data.Add("output", "json")
	data.Add("timestamp", fmt.Sprintf("%d", time.Now().Unix()))

	url := _signature("/place/v2/suggestion", data)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	sq := new(searchResponse)

	err = json.Unmarshal(body, sq)
	if err != nil {
		return nil, err
	}

	if sq.Status != 0 {
		return nil, errors.New(sq.Message)
	}

	return sq.Results, nil
}

func _signature(path string, data url.Values) string {
	//http://api.map.baidu.com/geocoder/v2/?address=百度大厦&output=json&ak=yourak +sk码

	ak := os.Getenv("BAIDU_AK")
	sk := os.Getenv("BAIDU_SK")
	host := "https://api.map.baidu.com"

	data.Add("ak", ak)
	o := path + "?" + data.Encode() + sk
	hash := md5.New()
	hash.Write([]byte(url.QueryEscape(o)))
	sn := hex.EncodeToString(hash.Sum(nil))
	data.Add("sn", sn)

	url := host + path + "?" + data.Encode()

	return url

}
