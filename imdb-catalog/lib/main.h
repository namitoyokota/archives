#ifndef main_h
#define main_h

#include <curses.h>
#include <string.h>
#include <time.h>
#include "../lib/stack.h"
#include "../lib/rbt.h"
#include "../lib/crud.h"
#include "../lib/logger.h"

// Global Variables
    // RBT with different sorts
    RBT* RBT_INDEX;
    RBT* RBT_TITLE;
    RBT* RBT_YEAR;
    RBT* RBT_RUNTIME;
    // CRUD basics
    int yMax, xMax;
    // Main basics
    char str[30];
    char filename[30];
    int choice;
    int highlight=1;
    // Movie
    char *movie_index;
    char *movie_title;
    char *movie_year;
    char *movie_runtime;
    char *movie_genres;
    char *movie_media;
    char *movie_y, *movie_m, *movie_d;

    // Choices for menus
    char* mainChoices[6] = {"Sort", "Filter", "Search", "CRUD", "Help", "Quit"};
    char* sortChoices[8] = {"Ascending Index", "Descending Index", "Alphabetical Title", "Ascending Year", "Descending Year",
                        "Ascending Runtime", "Descending Runtime", "Back"};
    char* filterChoices[5] = {"Set Minimum Year", "Set Maximum Year", "Set Minimum Runtime", "Set Maximum Runtime", "Back"};
    char* searchChoices[4] = {"By Index", "By Title", "By Genre", "Back"};
    char* editChoices[5] = {"Create Movie", "Retrieve Movie", "Update Movie", "Delete Movie", "Back"};

// MENU
int mainMenu();
RBT* loadMenu();
    void sortMenu();
    void filterMenu();
    void searchMenu();
    // CRUD
    void editMenu(char*);
    void createMenu();
    void retrieveMenu(char*);
    void updateMenu(char*);
    void deleteMenu(char*);
    // curse tools
    void helpMenu();
    void clearBox(WINDOW*);
// FILE IO
void parseFILE(char*, RBT**);
void checkLog(char*);
// OTHER
void updateRBT();

#endif
