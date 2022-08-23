echo "------build nginx start"

cd ./3rdlibs/nginx-1.22.0
./configure --prefix=../../nginx_server
make
sudo make install

echo "------build nginx end"
