if [ -d "ffmpeg" ]; then
    rm -rf ffmpeg
    mkdir ffmpeg
else
    mkdir ffmpeg
fi

cd ./3rdlibs/ffmpeg-4.1
echo "------build ffmpeg-4.1 start"
make clean
emconfigure ./configure --cc="emcc" --cxx="em++" --ar="emar" \
    --prefix=../../ffmpeg \
    --enable-cross-compile --target-os=none --arch=x86_32 --cpu=generic \
    --enable-gpl --enable-version3 \
    --disable-avdevice --disable-avformat --disable-swresample --disable-postproc --disable-avfilter \
    --disable-programs --disable-logging --disable-everything \
    --disable-ffplay --disable-ffprobe --disable-asm --disable-doc --disable-devices --disable-network \
    --disable-hwaccels --disable-parsers --disable-bsfs --disable-debug --disable-protocols --disable-indevs --disable-outdevs \
    --enable-decoder=hevc --enable-parser=hevc \
    --enable-decoder=h264  --enable-parser=h264
make
sudo make install
echo "------build ffmpeg-4.1 end"

