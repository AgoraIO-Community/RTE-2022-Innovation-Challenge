package tools

import (
	"fmt"
	"testing"
)

func TestGenerateProfile(t *testing.T) {
	p := RandomProfile()
	fmt.Print(p)
}
