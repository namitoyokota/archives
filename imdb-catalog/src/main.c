#include "../lib/main.h"

int main(void) {
    // initialize curses screen and get find yMax and xMax from console
    initscr(); noecho(); cbreak();
    getmaxyx(stdscr, yMax, xMax);
    // read in date with loadMenu()
    RBT_INDEX = loadMenu();
    // update other sorrted rbts
    updateRBT();

    // initialize the 'getting started' window
    WINDOW* initial  = newwin(yMax, xMax, 0, 0);
    box(initial, 0,0); wrefresh(initial);
    keypad(initial, true); echo();
    mvwprintw(initial, 0, 0, "Getting Started");
    mvwprintw(initial, 2, 1, "Enter username (this will determine your .log filename)");
    mvwprintw(initial, 3, 1, "For example, type in 'monica' for a file 'monica.log'");
    mvwprintw(initial, 5, 2, ">> ");
    wgetstr(initial, str);
    checkLog(str);
    clearBox(initial);
    endwin();
    // close window

    // call mainMenu() to call different menu functions
    while(1) {
        int choice = mainMenu();
        switch(choice) {
            case 0: sortMenu(); break;
            case 1: filterMenu(); break;
            case 2: searchMenu(); break;
            case 3: editMenu(""); break;
            case 4: helpMenu(); break;
            case 5: return 0;
            default: break;
        }
    }

    // free 
    free(filename);
    free(str);
    freeTree(RBT_INDEX);
    freeTree(RBT_TITLE);
    freeTree(RBT_TITLE);
    freeTree(RBT_RUNTIME);

    // bye bye
    return 0;
}

// This function outputs the main menu for the user to interact from
int mainMenu() {
    // reset highlight
    highlight=1;
    // initialize window
    WINDOW* main = newwin(yMax, xMax, 0, 0);
    box(main, 0,0); wrefresh(main);
    keypad(main, true); noecho();
    mvwprintw(main, 0, 0, "IMDb Catalog");
    mvwprintw(main, 2, 3, "Use 'up arrow' and 'down arrow' and 'enter' to navigate through the menu");

    // select tool with up and down arrow
    while(1) {
        // print choices
        for (int i=1; i<=6; i++) {
            if (i == highlight) wattron(main, A_REVERSE);
            mvwprintw(main, i+3, 2, mainChoices[i-1]);
            wattroff(main, A_REVERSE);
        } choice = wgetch(main);
        switch(choice) {
            case KEY_UP:
                highlight--;
                if (highlight == 0)
                    highlight = 6;
                break;
            case KEY_DOWN:
                highlight++;
                if (highlight == 7)
                    highlight = 1;
                break;
            default: break;
        }
        // on the press of enter
        if (choice == 10) break;
    }
    endwin();
    // close window
    return highlight-1;
}

// This function allows users to pick one of the different sorting algorithms to be printed on the screen
void sortMenu() {
    // reset highlight
    highlight=1;
    // initialize window
    WINDOW* sort = newwin(yMax, xMax, 0, 0);
    box(sort, 0,0); wrefresh(sort); keypad(sort, true);
    mvwprintw(sort, 0, 0, "Sort Menu");

    // select tool
    while(1) {
        // print choices
        for (int i=1; i<=8; i++) {
            if (i == highlight) wattron(sort, A_REVERSE);
            mvwprintw(sort, i+1, 2, sortChoices[i-1]);
            wattroff(sort, A_REVERSE);
        } choice = wgetch(sort);
        switch(choice) {
            case KEY_UP:
                highlight--;
                if (highlight == 0)
                    highlight = 8;
                break;
            case KEY_DOWN:
                highlight++;
                if (highlight == 9)
                    highlight = 1;
                break;
            default: break;
        }
        // on the press of enter
        if (choice == 10) break;
    } clearBox(sort);

    // create stack
    switch(highlight-1) {
        case 0: INORDER_STACK(RBT_INDEX); break;
        case 1: OUTORDER_STACK(RBT_INDEX); break;
        case 2: INORDER_STACK(RBT_TITLE); break;
        case 3: INORDER_STACK(RBT_YEAR); break;
        case 4: OUTORDER_STACK(RBT_YEAR); break;
        case 5: INORDER_STACK(RBT_RUNTIME); break;
        case 6: OUTORDER_STACK(RBT_RUNTIME); break;
        case 7: return;
        default: break;
    }

    // print stack
    mvwprintw(sort, 2, 2, "INDEX\tTITLE\tYEAR\tRUNTIME\tGENRES\tMEDIA\tDATE");
    for (int i=4; i<yMax-5; i++) {
        if (ISEMPTY()) break;
        POP(sort, i);
    } 
    CLEAR();

    // crud option
    echo();
    mvwprintw(sort, yMax-3, 2, "Enter index to edit or 'q' to quit");
    mvwprintw(sort, yMax-2, 3, ">> ");
    wgetstr(sort, str);
    if (strcmp(str, "q") != 0 && strcmp(str, "") !=0) editMenu(str);
    return;
}

// This function allows the users to pick a filtering method then prints a list
void filterMenu() {
    // reset highlight
    highlight=1;
    // initialize window
    WINDOW* filter = newwin(yMax, xMax, 0, 0);
    box(filter, 0,0); wrefresh(filter); keypad(filter, true);
    mvwprintw(filter, 0, 0, "Filter Menu");

    // select tool
    while(1) {
        // print choices
        for (int i=1; i<=5; i++) {
            if (i == highlight) wattron(filter, A_REVERSE);
            mvwprintw(filter, i+1, 2, filterChoices[i-1]);
            wattroff(filter, A_REVERSE);
        } choice = wgetch(filter);
        switch(choice) {
            case KEY_UP:
                highlight--;
                if (highlight == 0)
                    highlight = 5;
                break;
            case KEY_DOWN:
                highlight++;
                if (highlight == 6)
                    highlight = 1;
                break;
            default:
                break;
        }
        // on the press of enter 
        if (choice == 10) break;
    } clearBox(filter);
    echo();

    // create stack
    switch(highlight-1) {
        case 0:
            mvwprintw(filter, 2, 1, "Year");   
            mvwprintw(filter, 3, 2, ">> ");
            wgetstr(filter, str);
            INORDER_TREE_WALK_YEAR_BIGGER(RBT_YEAR, atoi(str));
            break;
        case 1:
            mvwprintw(filter, 2, 1, "Year");   
            mvwprintw(filter, 3, 2, ">> ");
            wgetstr(filter, str);
            INORDER_TREE_WALK_YEAR_SMALLER(RBT_YEAR, atoi(str));
            break;
        case 2:
            mvwprintw(filter, 2, 1, "Runtime");   
            mvwprintw(filter, 3, 2, ">> ");
            wgetstr(filter, str);
            INORDER_TREE_WALK_RUNTIME_BIGGER(RBT_RUNTIME, atoi(str));
            break;
        case 3:
            mvwprintw(filter, 2, 1, "Runtime");   
            mvwprintw(filter, 3, 2, ">> ");
            wgetstr(filter, str);
            INORDER_TREE_WALK_RUNTIME_SMALLER(RBT_RUNTIME, atoi(str));
            break;
        case 4: return;
        default: break;
    }
    clearBox(filter);

    // print stack
    mvwprintw(filter, 2, 2, "INDEX\tTITLE\tYEAR\tRUNTIME\tGENRES\tMEDIA\tDATE");
    for (int i=4; i<yMax-5; i++) {
        if (ISEMPTY()) break;
        POP(filter, i);
    }
    CLEAR();

    // crud option
    echo();
    mvwprintw(filter, yMax-3, 2, "Enter index to edit or 'q' to quit");
    mvwprintw(filter, yMax-2, 3, ">> ");
    wgetstr(filter, str);
    if (strcmp(str, "q") != 0 && strcmp(str, "") !=0) editMenu(str);
    return;
}

// This function allows users to pick which search method then search to print the list
void searchMenu() {
    // reset highlight
    highlight=1;
    // initialize window
    WINDOW* search = newwin(yMax, xMax, 0, 0);
    box(search, 0,0); wrefresh(search);
    keypad(search, true); echo();
    mvwprintw(search, 0, 0, "Search Menu");

    // select tool
    while(1) {
        // print choices
        for (int i=1; i<=4; i++) {
            if (i == highlight)
                wattron(search, A_REVERSE);
            mvwprintw(search, i+1, 2, searchChoices[i-1]);
            wattroff(search, A_REVERSE);
        } choice = wgetch(search);
        switch(choice) {
            case KEY_UP:
                highlight--;
                if (highlight == 0)
                    highlight = 4;
                break;
            case KEY_DOWN:
                highlight++;
                if (highlight == 5)
                    highlight = 1;
                break;
            default:
                break;
        }
        // on the press of enter
        if (choice == 10) break;
    } clearBox(search);

    // create stack
    switch(highlight-1) {
        case 0:
            mvwprintw(search, 2, 1, "Index : ");   
            wgetstr(search, str);
            TREE_SEARCH_LIST_INDEX(RBT_INDEX, atoi(str));
            break;
        case 1:
            mvwprintw(search, 2, 1, "Title : "); 
            wgetstr(search, str);
            TREE_SEARCH_LIST_TITLE(RBT_TITLE, str);
            break;
        case 2:
            mvwprintw(search, 2, 1, "Genre : "); 
            wgetstr(search, str);
            TREE_SEARCH_LIST_GENRE(RBT_TITLE, str);
            break;
        default: return;
    } clearBox(search);

    // print stack
    mvwprintw(search, 2, 2, "INDEX\tTITLE\tYEAR\tRUNTIME\tGENRES\tMEDIA\tDATE");
    for (int i=4; i<yMax-5; i++) {
        if (ISEMPTY()) break;
        POP(search, i);
    }
    CLEAR();

    // crud options
    echo();
    mvwprintw(search, yMax-3, 2, "Enter index to edit or 'q' to quit");
    mvwprintw(search, yMax-2, 3, ">> ");
    wgetstr(search, str);
    if (strcmp(str, "q") != 0 && strcmp(str, "") !=0) editMenu(str);
    return;
}

// This function allows users to select which CRUD operation to perform
void editMenu(char* input) {
    // reset highlight
    highlight=1;
    // initialize window
    WINDOW* edit = newwin(yMax, xMax, 0, 0);
    box(edit, 0,0);
    wrefresh(edit);
    keypad(edit, true);
    mvwprintw(edit, 0, 0, "Edit Menu");
    // select tool
    while(1) {
        // print choices
        for (int i=1; i<=5; i++) {
            if (i == highlight) wattron(edit, A_REVERSE);
            mvwprintw(edit, i+1, 2, editChoices[i-1]);
            wattroff(edit, A_REVERSE);
        } choice = wgetch(edit);
        switch(choice) {
            case KEY_UP:
                highlight--;
                if (highlight == 0)
                    highlight = 5;
                break;
            case KEY_DOWN:
                highlight++;
                if (highlight == 6)
                    highlight = 1;
                break;
            default:
                break;
        }
        // on the press of enter
        if (choice == 10) break;
    } clearBox(edit);

    // call crud
    switch(highlight-1) {
        case 0: createMenu(); break;
        case 1: retrieveMenu(input); break;
        case 2: updateMenu(input); break;
        case 3: deleteMenu(input); break;
        case 4: return;
        default: break;
    }
    return;
}

// This function creates a new record and insert to RBT
void createMenu() {
    // initialize window
    WINDOW* create = newwin(yMax, xMax, 0, 0);
    box(create, 0,0); wrefresh(create);
    keypad(create, true); echo();

    char index[10], title[30], year[10], runtime[5], genres[5], media[30], y[10], m[10], d[10];

    // user inputs
    mvwprintw(create, 0, 0, "Create Menu");
    mvwprintw(create, 2, 1, "Index");
    mvwprintw(create, 3, 2, ">> ");
    wgetstr(create, index);

    if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(index)) != NULL) {
        clearBox(create);
        mvwprintw(create, 2, 1, "A movie with index %s already exists", index);
        mvwprintw(create, 3, 1, "Press any key to continue...");
        wgetch(create);
        return;
    }

    mvwprintw(create, 4, 1, "Title");
    mvwprintw(create, 5, 2, ">> ");
    wgetstr(create, title);
    mvwprintw(create, 6, 1, "Released Year");
    mvwprintw(create, 7, 2, ">> ");
    wgetstr(create, year);
    mvwprintw(create, 8, 1, "Runtime (mins)");
    mvwprintw(create, 9, 2, ">> ");
    wgetstr(create, runtime);
    mvwprintw(create, 10, 1, "Genres");
    mvwprintw(create, 11, 2, ">> ");
    wgetstr(create, genres);
    mvwprintw(create, 12, 1, "Media Type");
    mvwprintw(create, 13, 2, ">> ");
    wgetstr(create, media);
    mvwprintw(create, 14, 1, "Year Acquired");
    mvwprintw(create, 15, 2, ">> ");
    wgetstr(create, y);
    mvwprintw(create, 16, 1, "Month Acquired");
    mvwprintw(create, 17, 2, ">> ");
    wgetstr(create, m);
    mvwprintw(create, 18, 1, "Day Acquired");
    mvwprintw(create, 19, 2, ">> ");
    wgetstr(create, d);

    // create movie and update RBT
    CREATE_MOVIE(filename, &RBT_INDEX, index, title, year, runtime, genres, media, m, d, y);
    updateRBT();
    clearBox(create);
    mvwprintw(create, 2, 1, "A movie has been added to the catalog");
    mvwprintw(create, 3, 1, "Press any key to continue...");
    wgetch(create);
    endwin();
    // close window
    return;
}

// This function retrieves a record from the RBT
void retrieveMenu(char* input) {
    // initialize window
    WINDOW* retrieve = newwin(yMax, xMax, 0, 0);
    box(retrieve, 0,0); wrefresh(retrieve); keypad(retrieve, true);
    mvwprintw(retrieve, 0, 0, "Retrieve Menu");
    mvwprintw(retrieve, 2, 2, "DELETED MOVIES");
    // create stack
    INORDER_TREE_WALK_DELETED(RBT_INDEX);
    // print stack
    mvwprintw(retrieve, 4, 2, "INDEX\tTITLE\tYEAR\tRUNTIME\tGENRES\tMEDIA\tDATE");
    for (int i=6; i<yMax-3; i++) {
        if (ISEMPTY()) break;
        POP(retrieve, i);
    }
    CLEAR();

    // if input is NULL ask for input
    if (strcmp(input, "") == 0) {
        echo();
        mvwprintw(retrieve, yMax-3, 1, "Enter the index to retrieve or 'q' to quit");
        mvwprintw(retrieve, yMax-2, 2, ">> ");
        wgetstr(retrieve, str);
        if(strcmp(str, "q") == 0) return;
        clearBox(retrieve);
        if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(str)) == NULL) {
            mvwprintw(retrieve, 2, 1, "A movie with index of %s was not found", str);
            mvwprintw(retrieve, 3, 1, "Press any key to continue...");
            wgetch(retrieve);
        } else {
            mvwprintw(retrieve, 2, 1, "The movie has been retrieved");
            mvwprintw(retrieve, 3, 1, "Press any key to continue...");
            wgetch(retrieve);
            RETRIEVE_MOVIE(filename, &RBT_INDEX, str);
        }
    }
    // otherwise use the input as index to retrieve
    else {
        clearBox(retrieve);
        if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(input)) == NULL) {
            mvwprintw(retrieve, 2, 1, "A movie with index of %s was not found", str);
            mvwprintw(retrieve, 3, 1, "Press any key to continue...");
            wgetch(retrieve);
        } else {
            mvwprintw(retrieve, 2, 1, "The movie has been retrieved");
            mvwprintw(retrieve, 3, 1, "Press any key to continue...");
            wgetch(retrieve);
            RETRIEVE_MOVIE(filename, &RBT_INDEX, input);
        }
    }
    updateRBT();
    endwin();
    // close window
    return;
}

// This function updates a record from the RBT
void updateMenu(char* input) {
    // initialize window
    WINDOW* update = newwin(yMax, xMax, 0, 0);
    box(update, 0,0); wrefresh(update);
    keypad(update, true); echo();

    char index[10], title[30], year[10], runtime[5], genres[5], media[30], y[10], m[10], d[10];

    // take user input
    mvwprintw(update, 0, 0, "Update Menu");
    mvwprintw(update, 2, 1, "Index");
    if (strcmp(input, "") == 0) {
        mvwprintw(update, 3, 2, ">> ");
        wgetstr(update, index);
    } else {
        mvwprintw(update, 3, 2, ">> %s", input);
        strcpy(index, input);
    }

    if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(index)) == NULL) {
        clearBox(update);
        mvwprintw(update, 2, 1, "A movie with index %s does not exist", index);
        mvwprintw(update, 3, 1, "Press any key to continue...");
        wgetch(update);
        return;
    }

    mvwprintw(update, 4, 1, "Title");
    mvwprintw(update, 5, 2, ">> ");
    wgetstr(update, title);
    mvwprintw(update, 6, 1, "Released Year");
    mvwprintw(update, 7, 2, ">> ");
    wgetstr(update, year);
    mvwprintw(update, 8, 1, "Runtime (mins)");
    mvwprintw(update, 9, 2, ">> ");
    wgetstr(update, runtime);
    mvwprintw(update, 10, 1, "Genres");
    mvwprintw(update, 11, 2, ">> ");
    wgetstr(update, genres);
    mvwprintw(update, 12, 1, "Media Type");
    mvwprintw(update, 13, 2, ">> ");
    wgetstr(update, media);
    mvwprintw(update, 14, 1, "Year Acquired");
    mvwprintw(update, 15, 2, ">> ");
    wgetstr(update, y);
    mvwprintw(update, 16, 1, "Month Acquired");
    mvwprintw(update, 17, 2, ">> ");
    wgetstr(update, m);
    mvwprintw(update, 18, 1, "Day Acquired");
    mvwprintw(update, 19, 2, ">> ");
    wgetstr(update, d);
        
    // update movie and update RBT
    UPDATE_MOVIE(filename, &RBT_INDEX, index, title, year, runtime, genres, media, m, d, y);
    updateRBT();
    clearBox(update);
    mvwprintw(update, 2, 1, "A movie has been updated");
    mvwprintw(update, 3, 1, "Press any key to continue...");
    wgetch(update);
    endwin();
    // close window
    return;
}

// This function delets a record from the RBT
void deleteMenu(char* input) {
    // initialize window
    WINDOW* delete = newwin(yMax, xMax, 0, 0);
    box(delete, 0,0); wrefresh(delete); keypad(delete, true);
    mvwprintw(delete, 0, 0, "Delete Menu");

    // if user input is NULL ask for input
    if (strcmp(input, "") == 0) {
        echo();
        mvwprintw(delete, 2, 1, "Enter the index to delete or 'q' to quit");
        mvwprintw(delete, 3, 2, ">> ");
        wgetstr(delete, str);
        if (strcmp(str, "q") == 0) return;
        clearBox(delete);
        if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(str)) == NULL) {
            mvwprintw(delete, 2, 1, "A movie with index of %s was not found", str);
            mvwprintw(delete, 3, 1, "Press any key to continue...");
            wgetch(delete);
        } else {
            mvwprintw(delete, 2, 1, "The movie has been deleted");
            mvwprintw(delete, 3, 1, "Press any key to continue...");
            wgetch(delete);
            DELETE_MOVIE(filename, &RBT_INDEX, str);
        }
    }
    // otherwise use the given input as index to delete from rbt
    else {
        clearBox(delete);
        if (TREE_SEARCH_INDEX(RBT_INDEX, atoi(input)) == NULL) {
            mvwprintw(delete, 2, 1, "A movie with index of %s was not found", str);
            mvwprintw(delete, 3, 1, "Press any key to continue...");
            wgetch(delete);
        } else {
            mvwprintw(delete, 2, 1, "The movie has been deleted");
            mvwprintw(delete, 3, 1, "Press any key to continue...");
            wgetch(delete);
            DELETE_MOVIE(filename, &RBT_INDEX, input);
        }
    }
    updateRBT();
    endwin();
    // close window
    return;
}

// This function is called at the initial point of the program to read in the database
RBT* loadMenu() {
    // initialize window
    WINDOW* load = newwin(yMax, xMax, 0, 0);
    box(load, 0,0);
    wrefresh(load);
    keypad(load, true);
    mvwprintw(load, 0, 0, "Load Menu");

    // on a press of a key start loading
    mvwprintw(load, 2, 1, "Press any key to start loading data");
    wgetch(load);
    mvwprintw(load, 4, 1, "Loading...");
    wrefresh(load);

    // parse the tsv file
    parseFILE("./data/movie_records.tsv", &RBT_INDEX);
    mvwprintw(load, 6, 1, "Loading process has completed. The data is now stored in memory");
    mvwprintw(load, 7, 1, "Press any key to continue..");
    wgetch(load);
    endwin();
    // close window
    return RBT_INDEX;
}

// This function is a help menu to help users when stuck with controls
void helpMenu() {
    // initialize window
    WINDOW* help = newwin(yMax, xMax, 0, 0);
    box(help, 0,0);
    wrefresh(help);
    keypad(help, true);
    mvwprintw(help, 0, 0, "Help Menu");
    mvwprintw(help, 2, 2, "Keybinds");
    mvwprintw(help, 3, 2, "\t'up arrow'");
    mvwprintw(help, 4, 2, "\t'down arrow'");
    mvwprintw(help, 5, 2, "\t'enter'");
    mvwprintw(help, 6, 2, "Sort");
    mvwprintw(help, 7, 2, "\tIndex : ascending and descending");
    mvwprintw(help, 8, 2, "\tTitle : aphabetical");
    mvwprintw(help, 9, 2, "\tYear : ascending and descending");
    mvwprintw(help, 10, 2, "\tRuntime : ascending and descending");
    mvwprintw(help, 12, 2, "Press any key to continue..");
    wgetch(help);
    endwin();
    // close window
    return;
}

// This function is my own ncurses tool to clear the entire window except for the border lines and the title
void clearBox(WINDOW* win) {
    for (int j=1; j<yMax-1; j++) // rows
        for (int i=1; i<xMax-1; i++) // columns
            mvwprintw(win, j, i, " ");
    return;
}

// This function parses the .tsv file downloaded from the IMDb website. During the download process,
// the makefile script edits the file to ignore all the other lines except for movies.
// this function assumes that the script is ran and stores all of the movie datasets
void parseFILE(char *tsvfile, RBT** RBT_INDEX) {
    // open file
	FILE *fp = fopen(tsvfile, "r");
    // file does not exist
	if (fp == 0) return;
    // file does exist
	else {
        // initialize time variable to get current date
        time_t t = time(NULL); struct tm tm = *localtime(&t);
		char line[500]; int row=0, col=0;

        // get line until NULL
		while (fgets(line, 500, fp)) {
            // cut the line at '\n'
			strtok(line, "\n"); char *ptr = strdup(line), *str;
			while ((str = strsep(&ptr, "\t"))) {
                if (strcmp(str, "\\N") == 0) str = "(null)";
				switch(col) {
					case 0: str[0]='0'; str[1]='0'; movie_index = str; break;
					case 2: movie_title = str; break;
					case 5: movie_year = str; break;
					case 7: movie_runtime = str; break;
					case 8: movie_genres = str; break;
					default: break;
				}
				if (strcmp(str, "\0") == 0) break;
				col++;
			}
            // insert to the rbt
			*RBT_INDEX = RB_INSERT_INDEX(*RBT_INDEX, '1', atoi(movie_index), movie_title, atoi(movie_year), atoi(movie_runtime), movie_genres, NULL, tm.tm_mon+1, tm.tm_mday, tm.tm_year+1900);
            row++; col=0;
		}
	}
    fclose(fp);
}

// This function updates the sorted RBTs according to the RBT sorted by index
void updateRBT() {
    RBT_TITLE = NULL; RBT_YEAR = NULL; RBT_RUNTIME = NULL;
    RBT_EXPORT_TITLE(RBT_INDEX, &RBT_TITLE);
    RBT_EXPORT_YEAR(RBT_INDEX, &RBT_YEAR);
    RBT_EXPORT_RUNTIME(RBT_INDEX, &RBT_RUNTIME);
}

// This function is called at the initial point of the program to ensure that the log file for the user gets inputted
void checkLog(char* username) {
    strcpy(filename, "./log/"); strcat(filename, username); strcat(filename, ".log");
    readLog(filename, &RBT_INDEX);
    updateRBT();
}