#include "../lib/logger.h"

// This function simply writes a given message to the log file with given path
void printLog(char* filename, char* message) {
    FILE* fp = fopen(filename, "ab+");
    // if file exists
    if (fp != 0) {
        fprintf(fp, "%s\n", message);
        fclose(fp);
    }
}

// This function reads in a log file with the given path and performs CRUD operations to update their history
void readLog(char* filename, RBT** root) {
    FILE* fp = fopen(filename, "r");
    // if file does NOT exist,
    if (fp == 0) return;
    // if file does exist,
    else {
        // read in each line
        char line[100]; int row=0, col=0;
		while (fgets(line, 100, fp)) {
            // cut the line at '\n'
			strtok(line, "\n"); char *ptr = strdup(line), *word, *function, *index, *title, *year, *runtime, *genres, *media, *m, *d, *y;
			while ((word = strsep(&ptr, ","))) {
				switch(col) {
                    case 0: function = word; break;
                    case 1: index = word; break;
                    case 2: title = word; break;
                    case 3: year = word; break;
                    case 4: runtime = word; break;
                    case 5: genres = word; break;
                    case 6: media = word; break;
                    case 7: m = word; break;
                    case 8: d = word; break;
                    case 9: y = word; break;
					default: break;
				}
				if (strcmp(word, "\0") == 0) break;
				col++;
			}
            // perform CRUD operations
            if (strcmp(function, "Create") == 0) CREATE_MOVIE("", root, index, title, year, runtime, genres, media, m, d, y);
            else if (strcmp(function, "Retreive") == 0) RETRIEVE_MOVIE("", root, index);
            else if (strcmp(function, "Update") == 0) UPDATE_MOVIE("", root, index, title, year, runtime, genres, media, m, d, y);
            else DELETE_MOVIE("", root, index);
			row++; col=0;
		}
    }
    fclose(fp);
}