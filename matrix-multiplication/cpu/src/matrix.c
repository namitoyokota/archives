#include "../lib/helper.h"
#include "../lib/simple.h"
#include "../lib/blocked.h"
#include "../lib/hybrid.h"

int main(int agrc, char *argv[])
{
	// functions
	void (*simple[6])(double *, double *, double *, int) = {simple_ijk, simple_ikj, simple_jik, simple_jki, simple_kij, simple_kji};
	void (*blocked[6])(double *, double *, double *, int, int) = {blocked_ijk, blocked_ikj, blocked_jik, blocked_jki, blocked_kij, blocked_kji};
	void (*hybrid[6])(double *, double *, double *, int, int) = {hybrid_ijk, hybrid_ikj, hybrid_jik, hybrid_jki, hybrid_kij, hybrid_kji};

	struct timespec start, end;
	double t;
	int one, two;
	int n, B;

	while (1)
	{
		one = optionOne();
		if (one == 4)
			return 0;
		else if (one < 1 || one > 3)
			continue;
		else
		{
			while (1)
			{
				two = optionTwo();
				if (two == 7)
					break;
				else if (two < 1 || two > 6)
					continue;
				else if (one == 1)
				{
					n = optionN();
					double *a = (double *)calloc(sizeof(double), n * n);
					double *b = (double *)calloc(sizeof(double), n * n);
					double *c = (double *)calloc(sizeof(double), n * n);
					setMatrix(n, a);
					setMatrix(n, b);
					clock_gettime(CLOCK_REALTIME, &start);
					simple[two - 1](a, b, c, n);
					clock_gettime(CLOCK_REALTIME, &end);
					t = (end.tv_sec - start.tv_sec) + (end.tv_nsec - start.tv_nsec) / 1000000000.0;
					printf("\nReport: %lf seconds\n", t);
				}
				else if (one == 2 || one == 3)
				{
					n = optionN();
					B = optionB();
					double *a = (double *)calloc(sizeof(double), n * n);
					double *b = (double *)calloc(sizeof(double), n * n);
					double *c = (double *)calloc(sizeof(double), n * n);
					setMatrix(n, a);
					setMatrix(n, b);
					clock_gettime(CLOCK_REALTIME, &start);
					if (one == 2)
						blocked[two - 1](a, b, c, n, B);
					else
						hybrid[two - 1](a, b, c, n, B);
					clock_gettime(CLOCK_REALTIME, &end);
					t = (end.tv_sec - start.tv_sec) + (end.tv_nsec - start.tv_nsec) / 1000000000.0;
					printf("\nReport: %lf seconds\n", t);
				}
				else
					printf("\nhow did this happen\n");
			}
		}
	}

	return 0;
}
