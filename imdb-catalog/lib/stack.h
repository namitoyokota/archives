#ifndef stack_h
#define stack_h

#include <stdio.h>
#include <stdlib.h>
#include <curses.h>

enum boo {T,F};
typedef struct stack STACK;

STACK* top;

void PUSH(bool enable, int index, char* title, int year, int runtime, char *genres, char* media, int m, int d, int y);
void POP(WINDOW*, int);
int ISEMPTY();
void CLEAR();

#endif