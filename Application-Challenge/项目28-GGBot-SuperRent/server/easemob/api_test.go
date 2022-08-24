package easemob

import (
	"fmt"
	"os"
	"testing"

	"github.com/privatepppp/super-rent/tools"
	"github.com/stretchr/testify/assert"
)

var c *Client

func TestMain(m *testing.M) {
	c, _ = NewClient(true)
	os.Exit(m.Run())
}

func TestNewEmClient(t *testing.T) {
	_, err := NewClient(true)
	assert.NoError(t, err)
}

func TestUsersOp(t *testing.T) {
	err := c.CreateUser("username_1", "password_1", "nickname_1")
	assert.NoError(t, err)

	err = c.DeleteUser("username_1")
	assert.NoError(t, err)
}

func TestSendSystemMessage(t *testing.T) {
	c.SendSystemMessage("欢迎来到随心租[TODO]", []string{"jnmsxu"})
}

func TestCreateChatRoom(t *testing.T) {
	fmt.Println(c.CreateChatRooms("随心租社群", "随心租全国大群", ""))
}

func TestFetchAllUsers(t *testing.T) {
	fmt.Print(tools.Prettify(c.FetchAllUsers()))
}
