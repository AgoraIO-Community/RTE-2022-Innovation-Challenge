package tools

import (
	"bufio"
	"image"
	"image/draw"
	"image/png"
	"log"
	"os"

	"github.com/golang/freetype"
	"github.com/golang/freetype/truetype"
)

func GenerateWatermark(text string) {
	rgba := image.NewRGBA(image.Rect(0, 0, 100, 40))
	draw.Draw(rgba, rgba.Bounds(), image.Transparent, image.Point{}, draw.Src)

	ctx := freetype.NewContext()

	font := loadFont()
	ctx.SetFont(font)
	ctx.SetFontSize(16)
	ctx.SetDst(rgba)
	ctx.SetSrc(image.White)

	p := freetype.Pt(0, 0)
	ctx.DrawString(text, p)

	bf := bufio.NewWriter(os.Stdout)
	if err := png.Encode(bf, rgba); err != nil {
		log.Panic(err)
	}
	if err := bf.Flush(); err != nil {
		log.Panic(err)
	}
}

func loadFont() *truetype.Font {
	b, err := os.ReadFile("./JetBrainsMonoNL-Medium.ttf")
	if err != nil {
		log.Panic(err)
	}
	f, err := truetype.Parse(b)
	if err != nil {
		log.Panic(err)
	}

	return f
}
