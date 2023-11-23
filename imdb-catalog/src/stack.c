#include "../lib/stack.h"

// Structure for STACK
struct stack {
    // STACK
	STACK* next;
    // MOVIE
	enum boo enable;
    int index;
    char* title;
    int year;
    int runtime;
    char* genres;
    char* media;
    int m;
    int d;
    int y;
};

void PUSH(bool enable, int index, char* title, int year, int runtime, char *genres, char* media, int m, int d, int y) {
        STACK* temp = (STACK*)malloc(sizeof(struct stack));
        temp->enable = enable;
        temp->index = index;
        temp->title = title;
        temp->year = year;
        temp->runtime = runtime;
        temp->genres = genres;
        temp->media = media;
        temp->m = m;
        temp->d = d;
        temp->y = y;
        temp->next = top;
        top = temp;
}

void POP(WINDOW* win, int y) {
    // if the stack is empty,
	if (ISEMPTY()) return;
    // if the stack is not empty,
    mvwprintw(win, y, 2, "%d\t%s\t%d\t%d\t%s\t%s\t%d/%d/%d", top->index, top->title, top->year, top->runtime, top->genres, top->media, top->m, top->d, top->y);
	STACK* temp;
	temp = top;
	temp = temp->next;
	top = temp;
}

int ISEMPTY() {
    if (top == NULL) return 1;
    else return 0;
}

void CLEAR() {
    top = NULL;
}