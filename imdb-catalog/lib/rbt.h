#ifndef rbt_h
#define rbt_h

#include <stdio.h>
#include <stdlib.h>
#define _GNU_SOURCE
#include <string.h>
#include <ctype.h>
#include <curses.h>
#include "../lib/stack.h"

enum type {RED,BLACK};
typedef struct rbt RBT;

// MAIN
void LEFT_ROTATE(RBT**, RBT**);                   // PAGE 313
void RIGHT_ROTATE(RBT**, RBT**);
RBT* TREE_MINIMUM(RBT*);                          // PAGE 291

// INSERET
void RB_INSERT_FIXUP(RBT**, RBT**);               // PAGE 316
    RBT* RB_INSERT_INDEX(RBT*, bool, int, char*, int, int, char*, char*, int, int, int);
    RBT* RB_INSERT_TITLE(RBT*, bool, int, char*, int, int, char*, char*, int, int, int);
    RBT* RB_INSERT_YEAR(RBT*, bool, int, char*, int, int, char*, char*, int, int, int);
    RBT* RB_INSERT_RUNTIME(RBT*, bool, int, char*, int, int, char*, char*, int, int, int);

// DELETE
void RB_TRANSPLANT(RBT**, RBT**, RBT**);          // PAGE 323
void RB_DELETE_FIXUP(RBT**, RBT**);               // PAGE 326
RBT* RB_DELETE(RBT*, RBT*);                       // PAGE 324

// PRINT
    // DELETED List
    void INORDER_TREE_WALK_DELETED(RBT*);
    // FILTERED List
    void INORDER_TREE_WALK_YEAR_BIGGER(RBT*, int);
    void INORDER_TREE_WALK_YEAR_SMALLER(RBT*, int);
    void INORDER_TREE_WALK_RUNTIME_BIGGER(RBT*, int);
    void INORDER_TREE_WALK_RUNTIME_SMALLER(RBT*, int);
    void OUTORDER_STACK(RBT*);
    void INORDER_STACK(RBT*);

// SEARCH
    RBT* TREE_SEARCH_INDEX(RBT*, int);            // PAGE 290
    RBT* TREE_SEARCH_TITLE(RBT*, char*);
    void TREE_SEARCH_LIST_INDEX(RBT*, int);
    void TREE_SEARCH_LIST_TITLE(RBT*, char*);
    void TREE_SEARCH_LIST_GENRE(RBT*, char*);

// UPDATE
void RBT_MODIFY(RBT*, bool, char*, char*, char*, char*, char*, char*, int, int, int);

// RBT to RBT
    void RBT_EXPORT_TITLE(RBT*, RBT**);
    void RBT_EXPORT_YEAR(RBT*, RBT**);
    void RBT_EXPORT_RUNTIME(RBT*, RBT**);
    
// FREE
void freeTree(RBT*);

#endif
