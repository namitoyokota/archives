#ifndef __BLOCKED_INCLUDED__
#define __BLOCKED_INCLUDED__

void blocked_ijk(double *a, double *b, double *c, int n, int B);
void blocked_jik(double *a, double *b, double *c, int n, int B);
void blocked_ikj(double *a, double *b, double *c, int n, int B);
void blocked_kij(double *a, double *b, double *c, int n, int B);
void blocked_jki(double *a, double *b, double *c, int n, int B);
void blocked_kji(double *a, double *b, double *c, int n, int B);

#endif