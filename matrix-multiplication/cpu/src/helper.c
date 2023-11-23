#include "../lib/helper.h"

double getRandom()
{
  return (5 - 2) * rand() / (double)RAND_MAX + 2;
}

void setMatrix(int n, double *a)
{
  for (int i = 0; i < n; i++)
  {
    for (int j = 0; j < n; j++)
    {
      a[i * j] = getRandom();
    }
  }
}

int optionOne()
{
  int option;
  printf("\nSelect the type of algorithm to use:\n");
  printf("\t1. Register Blocking\n\t2. Cache Blocking\n\t3. Hybrid (Register Blocking and Cache Blocking)\n\t4. Quit\n\n");
  printf("> ");
  scanf("%d", &option);
  return option;
}

int optionTwo()
{
  int option;
  printf("\nSelect the algorithm version:\n");
  printf("\t1. ijk\n\t2. ikj\n\t3. jik \n\t4. jki\n\t5. kij\n\t6. kji\n\t7. Back\n\n");
  printf("> ");
  scanf("%d", &option);
  return option;
}

int optionN()
{
  int n;
  printf("\nEnter size of the matrix:\n");
  printf("> ");
  scanf("%d", &n);
  return n;
}

int optionB()
{
  int b;
  printf("\nEnter size of the block:\n");
  printf("> ");
  scanf("%d", &b);
  return b;
}