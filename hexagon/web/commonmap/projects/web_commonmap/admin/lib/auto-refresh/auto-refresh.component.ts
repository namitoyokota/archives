import { Component, OnInit, Input, OnDestroy, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { AutoRefreshTranslationTokens } from './auto-refresh.translation';
import { CommonmapAdminService } from '../admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'hxgn-commonmap-admin-auto-refresh',
    templateUrl: './auto-refresh.component.html',
    styleUrls: ['./auto-refresh.component.scss']
})
export class AutoRefreshComponent implements OnInit, OnChanges, OnDestroy {
    @Input() autoRefresh = false;
    @Input() autoRefreshInterval = 5;

    @Output() autoRefreshChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() autoRefreshIntervalChanged: EventEmitter<any> = new EventEmitter<any>();

    /**  Expose translation tokens to html template */
    tokens: typeof AutoRefreshTranslationTokens = AutoRefreshTranslationTokens;
    preFetchTokensList = [
        this.tokens.autoRefreshMinLabel,
        this.tokens.autoRefreshMinsLabel
    ];

    transStrings = {};

    autoRefreshIntervalLabel = '';

    private destroy$ = new Subject<boolean>();

    constructor(private mapAdminSvc: CommonmapAdminService) { }

    ngOnInit() {
        this.initLocalization();
        this.mapAdminSvc.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (typeof changes.autoRefresh !== 'undefined' || typeof changes.autoRefreshInterval !== 'undefined') {
            this.setAutoRefreshIntervalLabel();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    setAutoRefresh(event: any) {
        this.autoRefresh = event.checked;
        this.autoRefreshChanged.emit({autoRefresh: this.autoRefresh, autoRefreshInterval: this.autoRefreshInterval});
    }

    setAutoRefreshInterval(event: any) {
        this.autoRefreshInterval = event.value;
        this.setAutoRefreshIntervalLabel();
        this.autoRefreshIntervalChanged.emit({autoRefresh: this.autoRefresh, autoRefreshInterval: this.autoRefreshInterval});
    }

    setAutoRefreshIntervalLabel() {
        if (this.autoRefreshInterval === 1) {
            this.autoRefreshIntervalLabel = `${this.autoRefreshInterval} ${this.transStrings[this.tokens.autoRefreshMinLabel]}`;
        } else {
            this.autoRefreshIntervalLabel = `${this.autoRefreshInterval} ${this.transStrings[this.tokens.autoRefreshMinsLabel]}`;
        }

    }
    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
            this.setAutoRefreshIntervalLabel();
        });
    }
}
