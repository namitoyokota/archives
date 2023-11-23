#include "matrix.cuh"

void printmatrix(float *matrix, int row, int col)
{
  int i, j;
  printf("dimensions: %d x %d\n", row, col);
  for (i=0; i<row; i++) {
    for (j=0; j<col; j++) {
      printf("%f\t", matrix[j*row+i]);
    }
    printf("\n");
  }
  printf("\n");
}

float* readmatrix(char* filename, int *row, int *col)
{
  FILE* fp = fopen(filename,"r");

  fread(row, sizeof(int), 1, fp);
  fread(col, sizeof(int), 1, fp);

  float *matrix = (float *)calloc((*row)*(*col), sizeof(float));
  fread(matrix, sizeof(float), (*row)*(*col), fp);
  fclose(fp);

  return matrix;
}

void writematrix(const char* header, const char* output, float* matrix, int row, int col)
{
  char filename[100];
  strcpy(filename, header);
  strcat(filename, output);
  FILE* fp = fopen(filename, "w");

  fwrite(&row, sizeof(int), 1, fp);
  fwrite(&col, sizeof(int), 1, fp);

  fwrite(matrix, sizeof(float), row*col, fp);
  fclose(fp);
}

float cublas_multiply(const float *a, const float *b, float *c, const int m, const int k, const int n) {
  int lda = m, ldb = k, ldc = m;
  const float alf = 1;
  const float bet = 0;
  const float *alpha = &alf;
  const float *beta = &bet;

  cublasHandle_t handle;
  cublasCreate(&handle);

  float milliseconds = 0;
  cudaEvent_t start, stop;
  cudaEventCreate(&start);
  cudaEventCreate(&stop);
  cudaEventRecord(start);

  cublasSgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N, m, n, k, alpha, a, lda, b, ldb, beta, c, ldc);

  cudaEventRecord(stop);
  cudaEventSynchronize(stop);
  cudaEventElapsedTime(&milliseconds, start, stop);

  cublasDestroy(handle);

  return milliseconds;
}

__global__ void shared_multiply(float *Md, float *Nd, float * Pd, int a_row, int a_col, int b_col)
{
  __shared__ float Mds[TILE_WIDTH][TILE_WIDTH];
  __shared__ float Nds[TILE_WIDTH][TILE_WIDTH];

  int bx = blockIdx.x, by = blockIdx.y;
  int tx = threadIdx.x, ty = threadIdx.y;
  int Row = by*TILE_WIDTH+ty;
  int Col = bx*TILE_WIDTH+tx;
  float Pvalue = 0;

  for (int m = 0; m < (a_col-1)/TILE_WIDTH+1; ++m) {
       if (Row < a_row  && m*TILE_WIDTH+tx < a_col)
          Mds[ty][tx] = Md[Row+a_row*(m*TILE_WIDTH+tx)];
       else Mds[ty][tx] = 0;
       if (Col < b_col && m*TILE_WIDTH+ty < a_row)
          Nds[ty][tx] = Nd[(m*TILE_WIDTH+ty)+b_col*Col];
       else Nds[ty][tx] = 0;

       __syncthreads();
       for (int k = 0; k < TILE_WIDTH; ++k)
          Pvalue += Mds[ty][k] * Nds[k][tx];
       __syncthreads();
  }

  if (Row < a_row  && Col < b_col)
    Pd[((blockIdx.y * blockDim.y + threadIdx.y) + (blockIdx.x * blockDim.x + threadIdx.x)*b_col)] = Pvalue;
}

extern "C"
void wrapper(int argc, char *argv[])
{
  // check command line input
  if (argc != 4) {
    printf("invalid command line arguments :(\n");
    return;
  }

  // rows and columns
  int a_row, a_col;
  int b_row, b_col;

  // host arrays
  float *h_a = readmatrix(argv[1], &a_row, &a_col);
  float *h_b = readmatrix(argv[2], &b_row, &b_col);
  float *h_c = (float *)malloc(a_row*b_col*sizeof(float));

  // device arrays
  float *d_a;
  float *d_b;
  float *d_c;

  // allocate on GPU
  cudaMalloc(&d_a, a_row*a_col*sizeof(float));
  cudaMalloc(&d_b, b_row*b_col*sizeof(float));
  cudaMalloc(&d_c, a_row*b_col*sizeof(float));

  // CPU to GPU
  cudaMemcpy(d_a, h_a, a_row*a_col*sizeof(float), cudaMemcpyHostToDevice);
  cudaMemcpy(d_b, h_b, b_row*b_col*sizeof(float), cudaMemcpyHostToDevice);

  // print input matrices
  // printmatrix(h_a, a_row, a_col);
  // printmatrix(h_b, b_row, b_col);

  // dgemm using cublas
  float milliseconds = cublas_multiply(d_a, d_b, d_c, a_row, a_col, b_col);
  cudaMemcpy(h_c, d_c, a_row*b_col*sizeof(float), cudaMemcpyDeviceToHost);
  writematrix("cublas_", argv[3], h_c, a_row, b_col);
  // printmatrix(h_c, a_row, b_col);
  printf("cublas (%s) :\n\t%f seconds\n\t%.10f gflops\n\n", argv[3],  milliseconds/1000, (2*((double)(a_row*a_col*b_col)))/(milliseconds*1000000));

  // gemm using shared memory
  dim3 dimGrid((b_col-1)/TILE_WIDTH+1, (a_row-1)/TILE_WIDTH+1, 1);
  dim3 dimBlock(TILE_WIDTH, TILE_WIDTH, 1);
  cudaEvent_t start, stop;
  cudaEventCreate(&start);
  cudaEventCreate(&stop);
  cudaEventRecord(start);
  shared_multiply<<<dimGrid, dimBlock>>>(d_a, d_b, d_c, a_row, a_col, b_col);
  cudaEventRecord(stop);
  cudaEventSynchronize(stop);
  cudaEventElapsedTime(&milliseconds, start, stop);
  cudaMemcpy(h_c, d_c, a_row*b_col*sizeof(float), cudaMemcpyDeviceToHost);
  writematrix("shared_", argv[3], h_c, a_row, b_col);
  // printmatrix(h_c, a_row, b_col);
  printf("shared (%s) :\n\t%f seconds\n\t%.10f gflops\n\n", argv[3],  milliseconds/1000, (2*((double)(a_row*a_col*b_col)))/(milliseconds*1000000));

  // free GPU memory
  cudaFree(d_a);
  cudaFree(d_b);
  cudaFree(d_c);

  // free CPU memory
  free(h_a);
  free(h_b);
  free(h_c);
}