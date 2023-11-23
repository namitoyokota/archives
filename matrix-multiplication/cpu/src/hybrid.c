#include "../lib/hybrid.h"

void hybrid_ijk(double *a, double *b, double *c, int n, int B)
{
  for (int i = 0; i < n; i += B)
  {
    for (int j = 0; j < n; j += B)
    {
      for (int k = 0; k < n; k += B)
      {
        for (int i1 = i; i1 < B + i; i1 += 2)
        {
          for (int j1 = j; j1 < B + j; j1 += 2)
          {
            register int t = i1 * n + j1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int k1 = k; k1 < B + k; k1 += 2)
            {

              register int ta = i1 * n + k1;
              register int tta = ta + n;
              register int tb = k1 * n + j1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}

void hybrid_ikj(double *a, double *b, double *c, int n, int B)
{
  for (int i = 0; i < n; i += B)
  {
    for (int k = 0; k < n; k += B)
    {
      for (int j = 0; j < n; j += B)
      {
        for (int i1 = i; i1 < B + i; i1 += 2)
        {
          for (int k1 = k; k1 < B + k; k1 += 2)
          {
            register int t = i1 * n + k1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int j1 = j; j1 < B + j; j1 += 2)
            {

              register int ta = i1 * n + j1;
              register int tta = ta + n;
              register int tb = j1 * n + k1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}

void hybrid_jik(double *a, double *b, double *c, int n, int B)
{
  for (int j = 0; j < n; j += B)
  {
    for (int i = 0; i < n; i += B)
    {
      for (int k = 0; k < n; k += B)
      {
        for (int j1 = j; j1 < B + j; j1 += 2)
        {
          for (int i1 = i; i1 < B + i; i1 += 2)
          {
            register int t = j1 * n + i1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int k1 = k; k1 < B + k; k1 += 2)
            {

              register int ta = j1 * n + k1;
              register int tta = ta + n;
              register int tb = k1 * n + i1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}

void hybrid_jki(double *a, double *b, double *c, int n, int B)
{
  for (int j = 0; j < n; j += B)
  {
    for (int k = 0; k < n; k += B)
    {
      for (int i = 0; i < n; i += B)
      {
        for (int j1 = j; j1 < B + j; j1 += 2)
        {
          for (int k1 = k; k1 < B + k; k1 += 2)
          {
            register int t = j1 * n + k1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int i1 = i; i1 < B + i; i1 += 2)
            {

              register int ta = j1 * n + i1;
              register int tta = ta + n;
              register int tb = i1 * n + k1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}

void hybrid_kij(double *a, double *b, double *c, int n, int B)
{
  for (int k = 0; k < n; k += B)
  {
    for (int i = 0; i < n; i += B)
    {
      for (int j = 0; j < n; j += B)
      {
        for (int k1 = k; k1 < B + k; k1 += 2)
        {
          for (int i1 = i; i1 < B + i; i1 += 2)
          {
            register int t = k1 * n + i1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int j1 = j; j1 < B + j; j1 += 2)
            {

              register int ta = k1 * n + j1;
              register int tta = ta + n;
              register int tb = j1 * n + i1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}

void hybrid_kji(double *a, double *b, double *c, int n, int B)
{
  for (int k = 0; k < n; k += B)
  {
    for (int j = 0; j < n; j += B)
    {
      for (int i = 0; i < n; i += B)
      {
        for (int k1 = k; k1 < B + k; k1 += 2)
        {
          for (int j1 = j; j1 < B + j; j1 += 2)
          {
            register int t = k1 * n + j1;
            register int tt = t + n;

            register double c00 = c[t];
            register double c01 = c[t + 1];
            register double c10 = c[tt];
            register double c11 = c[tt + 1];

            for (int i1 = i; i1 < B + i; i1 += 2)
            {

              register int ta = k1 * n + i1;
              register int tta = ta + n;
              register int tb = i1 * n + j1;
              register int ttb = tb + n;

              register double a00 = a[ta];
              register double a10 = a[tta];
              register double b00 = b[tb];
              register double b01 = b[tb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;

              a00 = a[ta + 1];
              a10 = a[tta + 1];
              b00 = b[ttb];
              b01 = b[ttb + 1];

              c00 += a00 * b00;
              c01 += a00 * b01;
              c10 += a10 * b00;
              c11 += a10 * b01;
            }

            c[t] = c00;
            c[t + 1] = c01;
            c[tt] = c10;
            c[tt + 1] = c11;
          }
        }
      }
    }
  }
}