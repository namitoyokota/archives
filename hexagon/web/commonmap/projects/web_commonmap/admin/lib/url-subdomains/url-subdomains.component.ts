import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { URLSubdomainsTranslationTokens } from './url-subdomains.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-url-subdomains',
    templateUrl: './url-subdomains.component.html',
    styleUrls: ['./url-subdomains.component.scss']
})
export class URLSubdomainsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() url: string;
    @Input() subdomains: string[];
    @Output() subdomainsChanged: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof URLSubdomainsTranslationTokens = URLSubdomainsTranslationTokens;

    preFetchTokensList = [
        this.tokens.optionSubdomainsPlaceholder
    ];

    transStrings = {};

    subdomainsStr: string;
    subdomainsErrorMsg: string;
    urlNeedsSubdomains = false;

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
            this.urlNeedsSubdomains = this.url.includes('{s}');
        }
        // Go ahead and create the subdomain string if values present
        this.createSubdomainStr();
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.url && this.initialized) {
            if (this.url) {
                this.urlNeedsSubdomains = this.url.includes('{s}');
            } else {
                this.urlNeedsSubdomains = false;
            }

            // Go ahead and create the subdomain string if values present
            if (this.subdomains) {
                this.subdomainsStr = this.subdomains.join(',');
            }

            this.setIsValid(true);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    createSubdomainStr() {
        // Go ahead and create the subdomain string if values present
        if (this.subdomains) {
            this.subdomainsStr = this.subdomains.join(',');
        }
    }
    fireSubdomainsChanged(subdomains: string[]) {
        this.subdomainsChanged.emit(subdomains);
    }

    validateSubdomainsStr(event: any) {
        this.subdomainsErrorMsg = this.mapAdminSvc.validateSubdomainsString(this.subdomainsStr);
        if (this.subdomainsErrorMsg) {
            this.setIsValid(false);
        } else {
            this.setIsValid(true);
        }
    }

    setSubdomains(event: any) {
        this.subdomainsErrorMsg = this.mapAdminSvc.validateSubdomainsString(this.subdomainsStr);
        if (this.subdomainsErrorMsg) {
            this.setIsValid(false);
        } else {
            const temp = this.subdomainsStr.split(/[ ,]+/).map(item => item.trim()).filter(item => item !== '');
            if (temp) {
               this.subdomains = temp;
               this.createSubdomainStr();
            }
            this.setIsValid(true);
        }
        this.fireSubdomainsChanged(this.subdomains);
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
