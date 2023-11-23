#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

void printmatrix(float *matrix, int row, int col)
{
  int i, j;
  printf("dimensions: %d x %d\n", row, col);
  for (i = 0; i < row; i++)
  {
    for (j = 0; j < col; j++)
    {
      printf("%lf\t", matrix[j * row + i]);
    }
    printf("\n");
  }
  printf("\n");
}

float *readmatrix(char *filename, int *row, int *col)
{
  FILE *fp = fopen(filename, "r");
  fread(row, sizeof(int), 1, fp);
  fread(col, sizeof(int), 1, fp);
  float *matrix = (float *)calloc((*row) * (*col), sizeof(float));
  fread(matrix, sizeof(float), (*row) * (*col), fp);
  fclose(fp);

  return matrix;
}

int main(int argc, char *argv[])
{
  int row, col;
  float *matrix = readmatrix(argv[1], &row, &col);
  printmatrix(matrix, row, col);
  return 0;
}