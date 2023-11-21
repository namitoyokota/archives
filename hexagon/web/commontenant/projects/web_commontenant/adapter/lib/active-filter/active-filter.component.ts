import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { TranslationGroup } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActiveFilterTranslationTokens } from './active-filter.translation';

export enum ActiveFilterButtonType {
    delete = 'delete', // Show delete button
    edit = 'edit', // Show edit button
    toggle = 'toggle' // Show toggle button
}

@Component({
    selector: 'hxgn-commontenant-active-filter',
    templateUrl: 'active-filter.component.html',
    styleUrls: ['active-filter.component.scss']
})
/**
 * Component that is used as part of property restriction component
 */
export class ActiveFilterComponent implements OnInit, OnDestroy {

    /** What type of action button should be shown */
    @Input() buttonType: ActiveFilterButtonType = ActiveFilterButtonType.delete;

    /** Is the toggle slider set to the true position */
    @Input() toggleEnabled = true;

    /** Event that the edit button has been clicked */
    @Output() edit = new EventEmitter<void>();

    /** Event that the delete button has been clicked */
    @Output() delete = new EventEmitter<void>();

    /** Event that the toggle component has changed state */
    @Output() toggle = new EventEmitter<boolean>();

    /** Expose ActiveFilterButtonType to the HTML */
    ActiveFilterButtonType: typeof ActiveFilterButtonType = ActiveFilterButtonType;

    /** Expose the translation tokens to the html */
    tokens: typeof ActiveFilterTranslationTokens = ActiveFilterTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On init life cycle hook */
    ngOnInit(): void {
        this.localizationSrv.localizeGroup(TranslationGroup.common);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeGroup(TranslationGroup.common);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Fired when the edit button is clicked
     */
    onEdit(): void {
        event.stopPropagation();
        this.edit.emit();
    }

    /**
     * Fired when the delete button is clicked
     */
    onDelete(): void {
        event.stopPropagation();
        this.delete.emit();
    }

    /**
     * Fired when the state of the toggle component changes (enabled or disabled)
     * @param checked The state of the toggle component
     */
    onToggle(checked: boolean): void {
        this.toggle.emit(checked);
    }

    /**
     * Fired when the toggle component is clicked.
     * Note: this is here to stop the click propagation
     */
    onToggleClick(): void {
        event.stopPropagation();
    }
}
