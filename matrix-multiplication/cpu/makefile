OBJS = matrix.o helper.o simple.o blocked.o hybrid.o
OOPTS = -Wall -Wextra -g -c
LOPTS = -Wall -Wextra -g

all : matrix

matrix : $(OBJS)
		gcc $(LOPTS) $(OBJS) -o matrix

helper.o : ./src/helper.c ./lib/helper.h
		gcc $(OOPTS) ./src/helper.c

simple.o : ./src/simple.c ./lib/simple.h
		gcc $(OOPTS) ./src/simple.c

blocked.o : ./src/blocked.c ./lib/blocked.h
		gcc $(OOPTS) ./src/blocked.c

hybrid.o : ./src/hybrid.c ./lib/hybrid.h
		gcc $(OOPTS) ./src/hybrid.c

matrix.o : ./src/matrix.c ./lib/helper.h ./lib/simple.h ./lib/blocked.h ./lib/hybrid.h
		gcc $(OOPTS) ./src/matrix.c

test : matrix
		./matrix

valgrind : matrix
		valgrind ./matrix

clean	:
		rm -f $(OBJS) matrix