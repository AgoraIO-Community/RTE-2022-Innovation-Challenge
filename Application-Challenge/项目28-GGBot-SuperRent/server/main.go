package main

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/leancloud/go-sdk/leancloud"
	"github.com/privatepppp/super-rent/adapters"
	_ "github.com/privatepppp/super-rent/functions"
)

func main() {
	leancloud.Engine.Init(leancloud.NewEnvClient())

	port := os.Getenv("LEANCLOUD_APP_PORT")
	if port == "" {
		port = "3000"
	}

	e := echo.New()

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "time=${time_rfc3339}, method=${method}, uri=${uri}, host=${host}, status=${status}, error=${error}, remote=${remote_ip}\n",
		Output: os.Stdout,
	}))
	e.Use(middleware.Recover())
	e.Static("/", "./landing-page")

	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		if herr, ok := err.(*echo.HTTPError); ok {
			code = herr.Code
		}

		c.Logger().Error(err)
		c.Render(http.StatusInternalServerError, "error", struct {
			Message string
			Status  int
			Error   string
		}{
			Message: err.Error(),
			Status:  code,
			Error:   err.Error(),
		})
	}

	adapters.Echo(e)

	e.Logger.Fatal(e.Start(":" + port))
}
