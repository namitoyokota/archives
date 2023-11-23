compile:
	nvcc -c matrix.cu
	gcc -c main.c
	nvcc -L/usr/local/cuda/lib64 -o multiply main.o matrix.o -lcudart -lcuda -lcublas

clean:
	rm -f *.o
	rm -f *.out
	rm -f *.exe
	rm -f multiply