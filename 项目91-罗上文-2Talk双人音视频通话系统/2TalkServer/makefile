all: main.o md5.o map.o
	gcc -o 2TalkServer main.o md5.o map.o
main.o: main.c
	gcc -D_ISOC99_SOURCE -std=c99 -Wall -g3 -c -o main.o main.c
md5.o: md5.c
	gcc -D_ISOC99_SOURCE -std=c99 -Wall -g3 -c -o md5.o md5.c
map.o: map.c
	gcc -D_ISOC99_SOURCE -std=c99 -Wall -g3 -c -o map.o map.c
clean:
	rm 2TalkServer main.o md5.o map.o