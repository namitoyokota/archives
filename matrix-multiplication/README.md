<!-- @format -->

# Matrix Multiplication

> performance optimization via register use and cache reuse in cpu and in gpu using CUDA with dynamically allocated matrix multiplication

## CPU instructions

1. `cd cpu`
2. `make` compiles all source files
3. `make test` executes the cli
4. `make valgrind` runs valgrind
5. `make clean` removes outputted files

## GPU instructions

1. `cd gpu`
2. `make compile` compiles and link all source files
3. `chmod +x submit.sh` make shell script executable
4. `run_gpu submit.sh` use script to run on gpu
5. `vi output_filename` view performance
6. `gcc read.c` compile reader program
7. `./a.out output_matrix.mtx` view outputted matrix
8. `make clean` removes outputted files

## Course Information

CS 481 - High Performance Computing, Instructor: Dingwen Tao
