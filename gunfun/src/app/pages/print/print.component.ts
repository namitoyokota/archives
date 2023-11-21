import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { Batch } from 'src/app/abstractions/batch';
import { Ink } from 'src/app/abstractions/ink';
import { Operator } from 'src/app/abstractions/operator';
import { FinishedSheetSize, FinishedSheetSizes } from 'src/app/constants/finished-sheet-size';
import { NumberPerSheets } from 'src/app/constants/numberPerSheet';
import { PaperPackaging, PaperPackagings } from 'src/app/constants/paper-packaging';
import { PaperWeight, PaperWeights } from 'src/app/constants/paper-weight';
import { ParentSheet, ParentSheets } from 'src/app/constants/parent-sheet';
import { Types } from 'src/app/constants/types';
import { NavigationService } from 'src/app/services/navigation.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    templateUrl: './print.component.html',
    styleUrls: ['./print.component.scss'],
})
export class PrintComponent implements OnInit, OnDestroy {
    /** Batch to edit */
    batch: Batch = new Batch();

    /** Whether page is in add mode */
    addMode = true;

    /** List of all batches in the database */
    batches: Batch[] = [];

    /** List of operators in the system */
    operatorList: Operator[] = [];

    /** List of inks in the system */
    inkList: Ink[] = [];

    /** Expose const to HTML */
    readonly Types: string[] = Types;

    /** Expose const to HTML */
    readonly ParentSheets: ParentSheet[] = ParentSheets;

    /** Expose const to HTML */
    readonly FinishedSheetSizes: FinishedSheetSize[] = FinishedSheetSizes;

    /** Expose const to HTML */
    readonly PaperPackagings: PaperPackaging[] = PaperPackagings;

    /** Expose const to HTML */
    readonly NumberPerSheets: string[] = NumberPerSheets;

    /** Expose const to HTML */
    readonly PaperWeights: PaperWeight[] = PaperWeights;

    /** Listening to batch list changes */
    private batchSubscription: Subscription;

    /** Listening to operator list changes */
    private operatorSubscription: Subscription;

    /** Listening to ink list changes */
    private inkSubscription: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private navigationService: NavigationService,
        private supabaseService: SupabaseService,
        private dialogService: NbDialogService,
    ) {}

    /**
     * On init lifecycle hook
     */
    async ngOnInit(): Promise<void> {
        const id = this.activatedRoute.snapshot.paramMap.get('id');

        this.addMode = !id;
        if (!this.addMode) {
            this.batch = await this.supabaseService.readBatch(+id);
        } else {
            this.batch.urgency = 'Low';
            this.batch.type = 'GunFun';
            this.batch.createddate = new Date();
        }

        this.readBatches();
        this.readOperators();
        this.readInks();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.batchSubscription.unsubscribe();
        this.operatorSubscription.unsubscribe();
        this.inkSubscription.unsubscribe();
    }

    /**
     * Creates a new batch with filled in data
     */
    async create(): Promise<void> {
        await this.supabaseService.createBatch(this.batch);
        this.goToPreviousPage();
    }

    /**
     * Updates an existing batch in the database
     */
    async update(): Promise<void> {
        await this.supabaseService.updateBatch(this.batch);
        this.goToPreviousPage();
    }

    /**
     * Loads previously created item if exists
     * @param itemId Item id entered
     */
    loadItem(itemId: string) {
        let mostRecentBatch: Batch;
        this.batches.forEach((batch) => {
            if (batch.id !== this.batch.id && batch.itemid === itemId) {
                mostRecentBatch = batch;
            }
        });

        if (mostRecentBatch) {
            const oldBatch = this.supabaseService.copyObject(this.batch);

            this.batch = mostRecentBatch;
            this.batch.id = oldBatch.id;
            this.batch.scheduleddate = oldBatch.scheduleddate;
            this.batch.completeddate = oldBatch.completeddate;
            this.batch.iscompleted = oldBatch.iscompleted;
            this.batch.createddate = oldBatch.createddate;
            this.batch.shipdate = oldBatch.shipdate;
            this.batch.runbydate = oldBatch.runbydate;
            this.batch.pressid = oldBatch.pressid;
            this.batch.lastediteddate = new Date();
        }
    }

    /**
     * Deletes currently editing batch
     */
    delete(): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Are you sure?',
                    subtitle: 'This action cannot be reverted.',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    await this.supabaseService.deleteBatch(this.batch.id);
                    this.goToPreviousPage();
                }
            });
    }

    /**
     * Completes a form and adds to history
     */
    complete(): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                context: {
                    title: 'Complete Print',
                    subtitle: 'Please confirm that the printing process has been completed.',
                    buttonText: 'Confirm',
                    buttonStatus: 'success',
                },
            })
            .onClose.subscribe(async (answer) => {
                if (answer) {
                    this.batch.iscompleted = true;
                    this.batch.completeddate = new Date();

                    await this.supabaseService.updateBatch(this.batch, true, true);

                    this.emailAdmin();
                    this.goToPreviousPage();
                }
            });
    }

    /**
     * Navigates to previously viewed page
     */
    goToPreviousPage(): void {
        this.navigationService.goToPreviousPage();
    }

    /**
     * Triggers email tab for completed print batch
     */
    private emailAdmin(): void {
        window.open(`mailto:test@example.com?subject=Completed ${this.batch.id}&body=body`);
    }

    /**
     * Get the list of batches from the table
     */
    private readBatches(): void {
        this.batchSubscription = this.supabaseService.batches$.subscribe((batches) => {
            if (batches) {
                this.batches = batches;
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
     * Get the list of inks from the table
     */
    private readInks(): void {
        this.inkSubscription = this.supabaseService.inks$.subscribe((inks) => {
            if (inks) {
                this.inkList = inks;
            }
        });
    }
}
