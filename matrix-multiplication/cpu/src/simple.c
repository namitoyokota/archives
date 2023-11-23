#include "../lib/simple.h"

void simple_ijk(double *a, double *b, double *c, int n)
{
  for (int i = 0; i < n; i++)
  {
    for (int j = 0; j < n; j++)
    {
      register double r = c[i * n + j];
      for (int k = 0; k < n; k++)
        r += a[i * n + k] * b[k * n + j];
      c[i * n + j] = r;
    }
  }
}

void simple_ikj(double *a, double *b, double *c, int n)
{
  for (int i = 0; i < n; i++)
  {
    for (int k = 0; k < n; k++)
    {
      register double r = a[i * n + k];
      for (int j = 0; j < n; j++)
        c[i * n + j] += r * b[k * n + j];
    }
  }
}

void simple_jik(double *a, double *b, double *c, int n)
{
  for (int j = 0; j < n; j++)
  {
    for (int i = 0; i < n; i++)
    {
      register double r = c[i * n + j];
      for (int k = 0; k < n; k++)
        r += a[i * n + k] * b[k * n + j];
      c[i * n + j] = r;
    }
  }
}

void simple_jki(double *a, double *b, double *c, int n)
{
  for (int j = 0; j < n; j++)
  {
    for (int k = 0; k < n; k++)
    {
      register double r = b[k * n + j];
      for (int i = 0; i < n; i++)
        c[i * n + j] += a[i * n + k] * r;
    }
  }
}

void simple_kij(double *a, double *b, double *c, int n)
{
  for (int k = 0; k < n; k++)
  {
    for (int i = 0; i < n; i++)
    {
      register double r = a[i * n + k];
      for (int j = 0; j < n; j++)
        c[i * n + j] += r * b[k * n + j];
    }
  }
}

void simple_kji(double *a, double *b, double *c, int n)
{
  for (int k = 0; k < n; k++)
  {
    for (int j = 0; j < n; j++)
    {
      register double r = b[k * n + j];
      for (int i = 0; i < n; i++)
        c[i * n + j] += a[i * n + k] * r;
    }
  }
}