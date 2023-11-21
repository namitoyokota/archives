/* eslint-disable @angular-eslint/no-output-native */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * A calendar input in the style of angular materials.
 * Outputs a moment date object through the "date" output.
 */
@Component({
    selector: 'hxgn-common-datepicker',
    templateUrl: './common-datepicker.component.html',
    styleUrls: ['common-datepicker.component.scss']
})
export class CommonDatepickerComponent implements OnInit, OnDestroy {

    /** The minimum selectable date on the calendar */
    @Input() min: Date = null;

    /** The maximum selectable date on the calendar */
    @Input() max: Date = null;

    /** Sets the disabled state of the calendar input */
    @Input() disabled = false;

    /** Disables the input field but not the datepicker itself */
    @Input() disabledInput = false;

    /** Input date from parent */
    @Input() get date() {
        return this._date;
    }
    set date(val: any) {
        this._date = val;
        this.dateChange.emit(this._date);
    }

    /** Emits the date on calendar change */
    @Output() dateChange: EventEmitter<string> = new EventEmitter<string>();

    /** Emits min and max date validation errors */
    @Output() error: EventEmitter<any> = new EventEmitter<any>();

    /** The calendar icon color */
    currentColor = '#000';

    /** The selected date */
    _date: any;

    /** Destory subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dateAdapter: DateAdapter<any>,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.dateAdapter.setLocale(lang);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Emit the date value */
    emitDate() {
        if (this.rangeIsValid(this._date)) {
            this.dateChange.emit(this._date);
        }
    }

    /** Emits min and max error messages on date validation */
    emitError(error: any) {
        this.error.emit(error);
    }

    /** Check the date to see if it's in range of the min and max */
    rangeIsValid(date: any) {
        const errorMsg = { maxInvalid: false, minInvalid: false };

        /** Remove the timestamp of the min and max by converting to ISO and splitting off the timestamp */
        if (this.max && Date.parse(date._d) > Date.parse(this.max.toISOString().split('T')[0])) {
            errorMsg.maxInvalid = true;
        }
        if (this.min && Date.parse(date._d) < Date.parse(this.min.toISOString().split('T')[0])) {
            errorMsg.minInvalid = true;
        }
        if (errorMsg.minInvalid || errorMsg.maxInvalid) {
            this.error.emit(errorMsg);
            return false;
        }

        return true;
    }

    /** Update calendar icon color when opened */
    opened() {
        this.currentColor = '#3f51b5';
    }

    /** On calendar close, update the icon color and emit the date */
    closed() {
        this.currentColor = '#000';
        this.emitDate();
    }
}
