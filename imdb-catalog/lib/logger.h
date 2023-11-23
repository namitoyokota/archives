#ifndef logger_h
#define logger_h

#include <stdio.h>
#include "../lib/rbt.h"
#include "../lib/crud.h"

extern void printLog(char*, char*);
extern void readLog(char*, RBT**);

#endif
