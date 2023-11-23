#include "../lib/logger.h"

// This function creates a new movie record with given parameters and inserts to the RBT. It then uses the logger program to write a .log line describing the operation
void CREATE_MOVIE(char* filename, RBT** root, char* index, char* title, char* year, char* runtime, char* genres, char* media, char* m, char* d, char* y) {
    // insert a new movie to the RBT
    *root = RB_INSERT_INDEX(*root, 1, atoi(index), title, atoi(year), atoi(runtime), genres, media, atoi(m), atoi(d), atoi(y));
    // if the log file exists,
    if (strcmp(filename, "./logs/") != 0) {
        char message[100] = "Create,"; strcat(message, index); strcat(message, ","); strcat(message, title); strcat(message, ",");
            strcat(message, year); strcat(message, ","); strcat(message, runtime); strcat(message, ","); strcat(message, genres); strcat(message, ","); 
            strcat(message, media); strcat(message, ","); strcat(message, m); strcat(message, ","); strcat(message, d); strcat(message, ",");
            strcat(message, y);
        printLog(filename, message);
    }
}

// This function retrieves a movie. With the given index, it searches for the record and updates the record to be retrieved. It then writes a .log file to describe the operation
void RETRIEVE_MOVIE(char* filename, RBT** root, char* index) {
    RBT* search = TREE_SEARCH_INDEX(*root, atoi(index));
    // if a record with given index IS NOT found,
    if (search == NULL) return;
    // if a record with given index IS found
    else RBT_MODIFY(search, 1, "", "", "", "", "", "", 0,0,0);
    // if a log file exists
    if (strcmp(filename, "./logs/") != 0) {
        char message[100] = "Retrieve,"; strcat(message, index);
        printLog(filename, message);
    }
}

// This function updates a movie. For the given index, all the other parameters that is not NULL is updated. Then the .log file is outputted with operation description
void UPDATE_MOVIE(char* filename, RBT** root, char* index, char* title, char* year, char* runtime, char* genres, char* media, char* m, char* d, char* y) {
    RBT* search = TREE_SEARCH_INDEX(*root, atoi(index));
    // if a record with a given index IS NOT found,
    if (search == NULL) return;
    // if a record with a given index IS found,
    else {
        RBT_MODIFY(search, 1, index, title, year, runtime, genres, media, atoi(m), atoi(d), atoi(y));
        // if index is ever changed, the node should be deleted then inserted again to sort in the right location
        //*root = RB_DELETE(*root, search);
        //*root = RB_INSERT_INDEX(*root, 1, atoi(index), title, atoi(year), atoi(runtime), genres);
    }
    // if a log file exists for the user
    if (strcmp(filename, "./logs/") != 0) {
        char message[100] = "Update,"; strcat(message, index); strcat(message, ","); strcat(message, title); strcat(message, ",");
            strcat(message, year); strcat(message, ","); strcat(message, runtime); strcat(message, ","); strcat(message, genres); strcat(message, ","); 
            strcat(message, media); strcat(message, ","); strcat(message, m); strcat(message, ","); strcat(message, d); strcat(message, ",");
            strcat(message, y);
        printLog(filename, message);
    }
}

// This function deletes a movie. With the fiven index, it searches for the record and updates the record to be deleted. It then writes a .log file to describe the operation
void DELETE_MOVIE(char* filename, RBT** root, char* index) {
    RBT* search = TREE_SEARCH_INDEX(*root, atoi(index));
    // if a record with a given index IS NOT found,
    if (search == NULL) return;
    // if a record wih a given index IS found,
    else RBT_MODIFY(search, 0, "", "", "", "", "", "", 0,0,0);
    // if a log file exists for the user
    if (strcmp(filename, "../log/") != 0) {
        char message[100] = "Delete,"; strcat(message, index);
        printLog(filename, message);
    }
}