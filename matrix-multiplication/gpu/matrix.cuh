#ifndef MATRIX_HPP
#define MATRIX_HPP

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <cuda_runtime.h>
#include "cublas_v2.h"

#define TILE_WIDTH 16

extern "C" void wrapper(int argc, char *argv[]);

#endif