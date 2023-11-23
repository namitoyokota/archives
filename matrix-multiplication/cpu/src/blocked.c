#include "../lib/blocked.h"

void blocked_ijk(double *a, double *b, double *c, int n, int B)
{
  for (int i = 0; i < n; i += B)
  {
    for (int j = 0; j < n; j += B)
    {
      for (int k = 0; k < n; k += B)
      {
        for (int i1 = i; i1 < i + B; i1++)
        {
          for (int j1 = j; j1 < j + B; j1++)
          {
            for (int k1 = k; k1 < k + B; k1++)
              c[i1 * n + j1] += a[i1 * n + k1] * b[k1 * n + j1];
          }
        }
      }
    }
  }
}

void blocked_ikj(double *a, double *b, double *c, int n, int B)
{
  for (int i = 0; i < n; i += B)
  {
    for (int k = 0; k < n; k += B)
    {
      for (int j = 0; j < n; j += B)
      {
        for (int i1 = i; i1 < B + i; i1++)
        {
          for (int k1 = k; k1 < B + k; k1++)
          {
            for (int j1 = j; j1 < B + j; j1++)
            {
              c[i1 * n + j1] += a[i1 * n + k1] * b[k1 * n + j1];
            }
          }
        }
      }
    }
  }
}

void blocked_jik(double *a, double *b, double *c, int n, int B)
{
  for (int j = 0; j < n; j += B)
  {
    for (int i = 0; i < n; i += B)
    {
      for (int k = 0; k < n; k += B)
      {
        for (int i1 = j; i1 < B + j; i1++)
        {
          for (int j1 = i; j1 < B + i; j1++)
          {
            for (int k1 = k; k1 < B + k; k1++)
            {
              c[j1 * n + i1] += a[j1 * n + k1] * b[k1 * n + i1];
            }
          }
        }
      }
    }
  }
}

void blocked_jki(double *a, double *b, double *c, int n, int B)
{
  for (int j = 0; j < n; j += B)
  {
    for (int k = 0; k < n; k += B)
    {
      for (int i = 0; i < n; i += B)
      {
        for (int i1 = j; i1 < B + j; i1++)
        {
          for (int j1 = k; j1 < B + k; j1++)
          {
            for (int k1 = i; k1 < B + i; k1++)
            {
              c[k1 * n + i1] += a[k1 * n + j1] * b[j1 * n + i1];
            }
          }
        }
      }
    }
  }
}

void blocked_kij(double *a, double *b, double *c, int n, int B)
{
  for (int k = 0; k < n; k += B)
  {
    for (int i = 0; i < n; i += B)
    {
      for (int j = 0; j < n; j += B)
      {
        for (int i1 = k; i1 < B + k; i1++)
        {
          for (int j1 = i; j1 < B + i; j1++)
          {
            for (int k1 = j; k1 < B + j; k1++)
            {
              c[j1 * n + k1] += a[j1 * n + i1] * b[i1 * n + k1];
            }
          }
        }
      }
    }
  }
}

void blocked_kji(double *a, double *b, double *c, int n, int B)
{
  for (int k = 0; k < n; k += B)
  {
    for (int j = 0; j < n; j += B)
    {
      for (int i = 0; i < n; i += B)
      {
        for (int i1 = k; i1 < B + k; i1++)
        {
          for (int j1 = j; j1 < B + j; j1++)
          {
            for (int k1 = i; k1 < B + i; k1++)
            {
              c[k1 * n + j1] += a[k1 * n + i1] * b[i1 * n + j1];
            }
          }
        }
      }
    }
  }
}