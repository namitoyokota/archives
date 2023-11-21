import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbMenuItem, NbMenuService } from '@nebular/theme';
import { Subscription, filter, map } from 'rxjs';
import { Batch } from 'src/app/abstractions/batch';
import { Ink } from 'src/app/abstractions/ink';
import { Types } from 'src/app/constants/types';
import { ColorFilterDialogComponent } from 'src/app/dialogs/color-filter/color-filter.dialog';
import { TypeFilterDialogComponent } from 'src/app/dialogs/type-filter/type-filter.dialog';
import { CalendarService } from 'src/app/services/calendar.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SupabaseService } from 'src/app/services/supabase.service';

enum ContextMenuOptions {
    admin = 'Administrator',
    history = 'History',
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    /** List of all batches in the database */
    allBatches: Batch[] = [];

    /** Batches assigned for press 1 */
    pressOneBatches: Batch[] = [];

    /** Batches assigned for press 2 */
    pressTwoBatches: Batch[] = [];

    /** Batches assigned for press 3 */
    pressThreeBatches: Batch[] = [];

    /** Batches not assigned for a press */
    unassignedBatches: Batch[] = [];

    /** Currently selected day */
    selectedDate = new Date(new Date().toDateString());

    /** List of all inks in the database */
    existingInks: Ink[] = [];

    /** Currently selected types to display */
    private selectedTypeFilters = Types;

    /** Currently selected colors to display */
    private selectedColorFilters: string[] = [];

    /** Listening to date change */
    private dateSubscription: Subscription;

    /** Listening to batch list changes */
    private batchSubscription: Subscription;

    /** Listening to ink list changes */
    private inkSubscription: Subscription;

    /** List of admin pages */
    readonly menuItems: NbMenuItem[] = [
        {
            title: ContextMenuOptions.history,
        },
        {
            title: ContextMenuOptions.admin,
        },
    ];

    constructor(
        private calendarService: CalendarService,
        private dialogService: NbDialogService,
        private nbMenuService: NbMenuService,
        private navigationService: NavigationService,
        private supabaseService: SupabaseService,
    ) {}

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.readDate();
        this.readBatches();
        this.readInks();
        this.listenToMenuClick();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.dateSubscription.unsubscribe();
        this.batchSubscription.unsubscribe();
        this.inkSubscription.unsubscribe();
    }

    /**
     * Selects date for filtering
     * @param date Date selected by the picker
     */
    selectDate(date: Date): void {
        this.calendarService.updateDate(date);
        this.resetLists();
        this.setLists();
    }

    /**
     * Move selected day to the day before
     */
    goToPreviousDay(): void {
        const previousDay = new Date(this.selectedDate);
        previousDay.setDate(previousDay.getDate() - 1);
        this.selectDate(previousDay);
    }

    /**
     * Move selected day to the day after
     */
    goToNextDay(): void {
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        this.selectDate(nextDay);
    }

    /**
     * Opens type filter dialog
     */
    openTypeFilter(): void {
        this.dialogService
            .open(TypeFilterDialogComponent, {
                hasScroll: true,
                context: {
                    currentlySelected: this.selectedTypeFilters,
                },
            })
            .onClose.subscribe((selectedTypes: Map<string, boolean>) => {
                if (!selectedTypes) {
                    return;
                }

                this.selectedTypeFilters = [];
                selectedTypes.forEach((value, key) => {
                    if (value) {
                        this.selectedTypeFilters.push(key);
                    }
                });

                this.resetLists();
                this.setLists();
            });
    }

    /**
     * Opens color filter dialog
     */
    openColorFilter(): void {
        this.dialogService
            .open(ColorFilterDialogComponent, {
                hasScroll: true,
                context: {
                    currentlySelected: this.selectedColorFilters,
                },
            })
            .onClose.subscribe((selectedColors) => {
                if (!selectedColors) {
                    return;
                }

                this.selectedColorFilters = [];
                selectedColors.forEach((value, key) => {
                    if (value) {
                        this.selectedColorFilters.push(key);
                    }
                });

                this.resetLists();
                this.setLists();
            });
    }

    /**
     * Triggered on card drop
     * @param event Event object
     */
    drop(event: CdkDragDrop<Batch[]>, pressId: number) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }

        event.item.data.pressid = pressId;
        event.item.data.scheduleddate = pressId ? this.selectedDate : null;
        this.supabaseService.updateBatch(event.item.data, false);
    }

    /**
     * Navigates to history page
     */
    goToHistoryPage(): void {
        this.navigationService.goToHistoryPage();
    }

    /**
     * Navigates to print page
     * @param id Identifier for the print
     */
    goToPrintPage(id?: number): void {
        this.navigationService.goToPrintPage(id);
    }

    /**
     * Get the saved date
     */
    private readDate(): void {
        this.dateSubscription = this.calendarService.selectedDate$.subscribe((date) => {
            this.selectedDate = date;
        });
    }

    /**
     * Get the list of batches from the table
     */
    private readBatches(): void {
        this.batchSubscription = this.supabaseService.batches$.subscribe((batches) => {
            if (batches) {
                this.allBatches = batches;
                this.resetLists();
                this.setLists();
            }
        });
    }

    /**
     * Empties all batch lists
     */
    private resetLists(): void {
        this.pressOneBatches = [];
        this.pressTwoBatches = [];
        this.pressThreeBatches = [];
        this.unassignedBatches = [];
    }

    /**
     * Sets press batches lists from entire list
     */
    private setLists(): void {
        const batchesToDisplay = this.allBatches.filter((batch) => {
            const isNotCompleted = !batch.iscompleted;
            const isInTypeFilter = this.selectedTypeFilters.includes(batch.type);
            const showAllColors = this.selectedColorFilters.length === this.existingInks.length;
            const isInColorFilter = [batch.ink1name, batch.ink2name, batch.ink3name, batch.ink4name].some((ink) =>
                this.selectedColorFilters.includes(ink),
            );

            return isNotCompleted && isInTypeFilter && (showAllColors || isInColorFilter);
        });

        batchesToDisplay
            .filter((batch) => batch.scheduleddate?.toLocaleDateString() === this.selectedDate?.toLocaleDateString())
            .forEach((batch) => {
                if (batch.pressid === 1) {
                    this.pressOneBatches.push(batch);
                } else if (batch.pressid === 2) {
                    this.pressTwoBatches.push(batch);
                } else if (batch.pressid === 3) {
                    this.pressThreeBatches.push(batch);
                }
            });

        this.unassignedBatches = batchesToDisplay.filter((batch) => batch.scheduleddate === null && batch.pressid === null);
    }

    /**
     * Listens to menu click to navigate to different pages
     */
    private listenToMenuClick(): void {
        this.nbMenuService
            .onItemClick()
            .pipe(
                filter(({ tag }) => tag === 'navigation-menu'),
                map(({ item: { title } }) => title),
            )
            .subscribe((title) => {
                switch (title) {
                    case ContextMenuOptions.admin:
                        this.navigationService.goToAdminPage();
                        break;
                    case ContextMenuOptions.history:
                        this.navigationService.goToHistoryPage();
                        break;
                    default:
                        break;
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
                this.selectedColorFilters = inks.map((ink) => ink.name);
            }
        });
    }
}
