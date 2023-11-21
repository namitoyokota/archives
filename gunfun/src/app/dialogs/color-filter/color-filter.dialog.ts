import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
    templateUrl: './color-filter.dialog.html',
    styleUrls: ['./color-filter.dialog.scss'],
})
export class ColorFilterDialogComponent implements OnInit, OnDestroy {
    /** Selected colors sent by the child */
    currentlySelected: string[] = [];

    /** List of colors and its status */
    colorList = new Map<string, boolean>();

    /** Listening to ink list changes */
    private inkSubscription: Subscription;

    constructor(private dialogRef: NbDialogRef<ColorFilterDialogComponent>, private supabaseService: SupabaseService) {}

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.readInks();
    }

    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy(): void {
        this.inkSubscription.unsubscribe();
    }

    /**
     * Toggles checkbox
     * @param color Color to select
     * @param checked Checkbox State
     */
    check(color: string, checked: boolean): void {
        this.colorList.set(color, checked);
    }

    /**
     * Returns selected colors list
     */
    submit() {
        this.dialogRef.close(this.colorList);
    }

    /**
     * Close dialog without submitting
     */
    cancel() {
        this.dialogRef.close(false);
    }

    /**
     * Get the list of inks from the table
     */
    private readInks(): void {
        this.inkSubscription = this.supabaseService.inks$.subscribe((inks) => {
            if (inks) {
                inks.forEach((ink) => {
                    this.colorList.set(ink.name, this.currentlySelected.includes(ink.name));
                });
            }
        });
    }
}
