import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonmapAdminService } from '../admin.service';
import { URLControlTranslationTokens } from './url-control.translation';

@Component({
    selector: 'hxgn-commonmap-admin-url-control',
    templateUrl: './url-control.component.html',
    styleUrls: ['./url-control.component.scss']
})
export class URLControlComponent implements OnInit, OnChanges, OnDestroy {

    @Input() url: string;
    @Output() urlChanged: EventEmitter<string> = new EventEmitter<string>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof URLControlTranslationTokens = URLControlTranslationTokens;

    preFetchTokensList = [
        this.tokens.addingLayerUrlPlaceholder
    ];

    transStrings = {};

    urlVisited = false;
    urlErrorMsg: string;

    initialized = false;
    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) {
    }
    async ngOnInit() {
        this.initLocalization();

        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });

        if (this.url) {
            this.urlVisited = true;
        }
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.url && this.initialized) {
            this.urlErrorMsg = null;            
            if (changes.url.currentValue) {
                this.urlVisited = true;
            }
            const errorToken = this.mapAdminSvc.validateLayerUrl(this.url);
            if (errorToken) {
                this.urlErrorMsg = errorToken;
            }
        }
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    fireURLChanged(url: string) {
        this.urlChanged.emit(url);
    }

    urlValidate(event: any) {
        if (!this.urlVisited) {
            return;
        }

        let url = event.target.value;
        url = url.trim();
        const errorToken = this.mapAdminSvc.validateLayerUrl(url);
        if (errorToken) {
            this.urlErrorMsg = errorToken;
            this.setIsValid(false);
        } else {
            this.urlErrorMsg = null;
            this.setIsValid(true);
        }
    }

    setURL(event: any) {
        this.urlVisited = true;
        this.urlErrorMsg = null;

        let url = event.target.value;
        url = url.trimEnd().trimStart();
        event.target.value = url;
        this.url = url;

        this.checkUrl();
        this.fireURLChanged(this.url);
    }

    checkUrl() {
        const errorToken = this.mapAdminSvc.validateLayerUrl(this.url);
        if (errorToken) {
            this.setIsValid(false);
            this.urlErrorMsg = errorToken;
        } else {
            this.urlErrorMsg = null;
            this.setIsValid(true);
        }
    }

    setIsValid(valid: boolean) {
        this.isValid.emit(valid);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
