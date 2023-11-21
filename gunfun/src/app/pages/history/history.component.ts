import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { Batch } from 'src/app/abstractions/batch';
import { Ink } from 'src/app/abstractions/ink';
import { TreeNode } from 'src/app/abstractions/tree-node';
import { Types } from 'src/app/constants/types';
import { ColorFilterDialogComponent } from 'src/app/dialogs/color-filter/color-filter.dialog';
import { TypeFilterDialogComponent } from 'src/app/dialogs/type-filter/type-filter.dialog';
import { NavigationService } from 'src/app/services/navigation.service';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
    /** Data to display in table */
    data: TreeNode<Batch>[];

    /** Batches that has been completed */
    batchList: Batch[] = [];

    /** String in the search input field */
    searchString = '';

    /** Used to toggle show completed filter */
    showCompleted = false;

    /** List of existing inks in the database */
    existingInks: Ink[] = [];

    /** Currently types selected for filtering */
    private selectedTypes: string[] = Types;

    /** Currently colors selected for filtering */
    private selectedColors: string[] = [];

    /** Listening to batch list changes */
    private batchSubscription: Subscription;

    /** Listening to ink list changes */
    private inkSubscription: Subscription;

    /** Column headers for the table */
    readonly columnList = ['ID', 'Item ID', 'Description', 'Created', 'Used Inks', 'Comments', 'Scheduled', 'Completed'];

    constructor(
        private dialogService: NbDialogService,
        private navigationService: NavigationService,
        private supabaseService: SupabaseService,
    ) {}

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.readBatches();
        this.readInks();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.batchSubscription.unsubscribe();
        this.inkSubscription.unsubscribe();
    }

    /**
     * Creates string to display for ink column
     * @param batch Batch to display inks for
     * @returns Joined string
     */
    showInks(batch: Batch): string {
        return [batch.ink1name, batch.ink2name, batch.ink3name, batch.ink4name].filter(Boolean).join(', ');
    }

    /**
     * Search from completed batch list
     */
    search(): void {
        this.data = this.batchList
            .filter((batch) => (this.showCompleted ? batch.iscompleted : true))
            .filter((batch) => {
                const includedInType = this.selectedTypes.includes(batch.type);
                const showAllColors = this.selectedColors.length === this.existingInks.length;
                const includedInColor = [batch.ink1name, batch.ink2name, batch.ink3name, batch.ink4name].some((ink) =>
                    this.selectedColors.includes(ink),
                );

                return includedInType && (showAllColors || includedInColor);
            })
            .filter((batch) => {
                const searchString = this.searchString?.toLowerCase();
                const includedInId = batch.id.toString().toLowerCase().includes(searchString);
                const includedInDescription = batch.description?.toLowerCase().includes(searchString);
                const includedInOperator = batch.pressoperator?.toLowerCase().includes(searchString);
                const includedInComments = batch.comments?.toLowerCase().includes(searchString);
                const includedInPackaging = batch.paperpackaging?.toLowerCase().includes(searchString);

                return includedInId || includedInDescription || includedInOperator || includedInComments || includedInPackaging;
            })
            .map((batch) => {
                return { data: batch };
            });
    }

    /**
     * Opens dialog for filtering by type
     */
    openTypeFilter(): void {
        this.dialogService
            .open(TypeFilterDialogComponent, {
                hasScroll: true,
                context: {
                    currentlySelected: this.selectedTypes,
                },
            })
            .onClose.subscribe((selectedTypes: Map<string, boolean>) => {
                if (!selectedTypes) {
                    return;
                }

                this.selectedTypes = [];
                selectedTypes.forEach((value, key) => {
                    if (value) {
                        this.selectedTypes.push(key);
                    }
                });

                this.search();
            });
    }

    /**
     * Opens dialog for filtering by color
     */
    openColorFilter(): void {
        this.dialogService
            .open(ColorFilterDialogComponent, {
                hasScroll: true,
                context: {
                    currentlySelected: this.selectedColors,
                },
            })
            .onClose.subscribe((selectedColors: Map<string, boolean>) => {
                if (!selectedColors) {
                    return;
                }

                this.selectedColors = [];
                selectedColors.forEach((value, key) => {
                    if (value) {
                        this.selectedColors.push(key);
                    }
                });

                this.search();
            });
    }

    /**
     * Navigates to home page
     */
    goToHomePage(): void {
        this.navigationService.goToHomePage();
    }

    /**
     * Navigates to print page
     * @param id Identifier for the print
     */
    goToPrintPage(id?: number): void {
        this.navigationService.goToPrintPage(id);
    }

    /**
     * Get the list of batches from the table
     */
    private readBatches(): void {
        this.batchSubscription = this.supabaseService.batches$.subscribe((batches) => {
            if (batches) {
                this.batchList = batches
                    .filter((batch) => {
                        const wasAssigned = batch.pressid !== null;
                        const wasCompleted = batch.iscompleted && batch.completeddate < new Date();
                        const wasScheduled = batch.scheduleddate < new Date();

                        return wasAssigned && (wasCompleted || wasScheduled);
                    })
                    .sort((a, b) => {
                        if (a.completeddate && b.completeddate) {
                            return +new Date(a.completeddate) - +new Date(b.completeddate);
                        } else {
                            return a.id - b.id;
                        }
                    });
                this.search();
            }
        });
    }

    /**
     * Get the list of inks from the table
     */
    private readInks(): void {
        this.inkSubscription = this.supabaseService.inks$.subscribe((inks) => {
            if (inks) {
                this.existingInks = inks;
                this.selectedColors = inks.map((ink) => ink.name);
            }
        });
    }
}
