#ifndef __HYBRID_INCLUDED__
#define __HYBRID_INCLUDED__

void hybrid_ijk(double *a, double *b, double *c, int n, int B);
void hybrid_jik(double *a, double *b, double *c, int n, int B);
void hybrid_ikj(double *a, double *b, double *c, int n, int B);
void hybrid_kij(double *a, double *b, double *c, int n, int B);
void hybrid_jki(double *a, double *b, double *c, int n, int B);
void hybrid_kji(double *a, double *b, double *c, int n, int B);

#endif