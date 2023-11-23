#ifndef crud_h
#define crud_h

#include <stdio.h>
#include <string.h>
#include "../lib/rbt.h"
#include "../lib/logger.h"

extern void CREATE_MOVIE(char*, RBT**, char*, char*, char*, char*, char*, char*, char*, char*, char*);
extern void RETRIEVE_MOVIE(char*, RBT**, char*);
extern void UPDATE_MOVIE(char*, RBT**, char*, char*, char*, char*, char*, char*, char*, char*, char*);
extern void DELETE_MOVIE(char*, RBT**, char*);

#endif
