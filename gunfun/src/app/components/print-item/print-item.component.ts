import { Component, Input } from '@angular/core';
import { Batch } from 'src/app/abstractions/batch';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
    selector: 'print-item',
    templateUrl: './print-item.component.html',
    styleUrls: ['./print-item.component.scss'],
})
export class PrintItemComponent {
    /** Print to display */
    @Input('batch')
    set setBatch(batch: Batch) {
        this.batch = batch;
        this.setUsedColors();
    }

    /** Add drag effect on hover */
    @Input() drag = true;

    /** Batch to display */
    batch: Batch;

    /** List of used colors */
    colors = '';

    constructor(private navigationService: NavigationService) {}

    /**
     * Sets string to display used colors
     */
    private setUsedColors(): void {
        const usedColors: string[] = [];
        if (this.batch.ink1name) {
            usedColors.push(this.batch.ink1name);
        }
        if (this.batch.ink2name) {
            usedColors.push(this.batch.ink2name);
        }
        if (this.batch.ink3name) {
            usedColors.push(this.batch.ink3name);
        }
        if (this.batch.ink4name) {
            usedColors.push(this.batch.ink4name);
        }

        this.colors = usedColors.join(', ');
    }

    /**
     * Navigates to print page
     */
    goToPrintPage(): void {
        this.navigationService.goToPrintPage(this.batch.id);
    }
}
