import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { Ink } from 'src/app/abstractions/ink';
import { Item } from 'src/app/abstractions/item';
import { Operator } from 'src/app/abstractions/operator';
import { Press } from 'src/app/abstractions/press';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { NavigationService } from 'src/app/services/navigation.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
    /** List of presses in the system */
    pressList: Press[] = [];

    /** List of inks in the system */
    inkList: Ink[] = [];

    /** List of operators in the system */
    operatorList: Operator[] = [];

    /** List of items in the system */
    itemList: Item[] = [];

    /** Name of the press to be added */
    newPressName = '';

    /** Name of the ink to be added */
    newInkName = '';

    /** Name of the operator to be added */
    newOperatorName = '';

    /** Name of the item to be added */
    newItemName = '';

    /** Listening to press list changes */
    private pressSubscription: Subscription;

    /** Listening to ink list changes */
    private inkSubscription: Subscription;

    /** Listening to operator list changes */
    private operatorSubscription: Subscription;

    /** Listening to item list changes */
    private itemSubscription: Subscription;

    constructor(
        private dialogService: NbDialogService,
        private supabaseService: SupabaseService,
        private navigationService: NavigationService,
    ) {}

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.readPresses();
        this.readInks();
        this.readOperators();
        this.readItems();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.pressSubscription.unsubscribe();
        this.inkSubscription.unsubscribe();
        this.operatorSubscription.unsubscribe();
        this.itemSubscription.unsubscribe();
    }

    /**
     * Adds new press to the database
     */
    addPress(): void {
        this.newPressName = this.newPressName.trim();

        if (this.newPressName) {
            this.supabaseService.createPress({ name: this.newPressName } as Press);
            this.newPressName = '';
        }
    }

    /**
     * Adds new ink to the database
     */
    addInk(): void {
        this.newInkName = this.newInkName.trim();

        if (this.newInkName) {
            this.supabaseService.createInk({ name: this.newInkName } as Ink);
            this.newInkName = '';
        }
    }

    /**
     * Adds new operator to the database
     */
    addOperator(): void {
        this.newOperatorName = this.newOperatorName.trim();

        if (this.newOperatorName) {
            this.supabaseService.createOperator({ name: this.newOperatorName } as Operator);
            this.newOperatorName = '';
        }
    }

    /**
     * Adds new item to the database
     */
    addItem(): void {
        this.newItemName = this.newItemName.trim();

        if (this.newItemName) {
            this.supabaseService.createItem({ name: this.newItemName } as Item);
            this.newItemName = '';
        }
    }

    /**
     * Removes press from list
     * @param id Id of press
     */
    deletePress(id: number): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Delete Press',
                    subtitle: 'Are you sure you want to continue? This action cannot be undone.',
                    buttonText: 'Delete',
                    buttonStatus: 'danger',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    this.supabaseService.deletePress(id);
                }
            });
    }

    /**
     * Removes ink from list
     * @param id Id of ink
     */
    deleteInk(id: number): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Delete Ink',
                    subtitle: 'Are you sure you want to continue? This action cannot be undone.',
                    buttonText: 'Delete',
                    buttonStatus: 'danger',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    this.supabaseService.deleteInk(id);
                }
            });
    }

    /**
     * Removes operator from list
     * @param id Id of operator
     */
    deleteOperator(id: number): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Delete Operator',
                    subtitle: 'Are you sure you want to continue? This action cannot be undone.',
                    buttonText: 'Delete',
                    buttonStatus: 'danger',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    this.supabaseService.deleteOperator(id);
                }
            });
    }

    /**
     * Removes item from list
     * @param id Id of item
     */
    deleteItem(id: number): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Delete Item',
                    subtitle: 'Are you sure you want to continue? This action cannot be undone.',
                    buttonText: 'Delete',
                    buttonStatus: 'danger',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    this.supabaseService.deleteItem(id);
                }
            });
    }

    /**
     * Navigates to previously visited page
     */
    goToPreviousPage(): void {
        this.navigationService.goToPreviousPage();
    }

    /**
     * Navigates to print page
     * @param id Identifier for the print
     */
    goToPrintPage(id?: number): void {
        this.navigationService.goToPrintPage(id);
    }

    /**
     * Get the list of presses from the table
     */
    private readPresses(): void {
        this.pressSubscription = this.supabaseService.presses$.subscribe((presses) => {
            if (presses) {
                this.pressList = presses;
            }
        });
    }

    /**
     * Get the list of inks from the table
     */
    private readInks(): void {
        this.inkSubscription = this.supabaseService.inks$.subscribe((inks) => {
            if (inks) {
                this.inkList = inks;
            }
        });
    }

    /**
     * Get the list of operators from the table
     */
    private readOperators(): void {
        this.operatorSubscription = this.supabaseService.operators$.subscribe((operators) => {
            if (operators) {
                this.operatorList = operators;
            }
        });
    }

    /**
     * Get the list of items from the table
     */
    private readItems(): void {
        this.itemSubscription = this.supabaseService.items$.subscribe((items) => {
            if (items) {
                this.itemList = items;
            }
        });
    }
}
