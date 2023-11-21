import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as Common from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../admin.service';
import { CoordSystemsControlTranslationTokens } from './coord-systems-control.translation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'hxgn-commonmap-admin-coord-systems-control',
    templateUrl: './coord-systems-control.component.html',
    styleUrls: ['./coord-systems-control.component.scss']
})
export class CoordSystemsControlComponent implements OnInit, OnChanges, OnDestroy {
    @Input() coordSystems: string[];
    @Input() selectedCoordSystem: string;
    @Input() swapAxes: boolean;
    @Output() coordSystemChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() swapAxesChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof CoordSystemsControlTranslationTokens = CoordSystemsControlTranslationTokens;

    preFetchTokensList = [
        this.tokens.coordSystemPlaceholder
    ];

    transStrings = {};

    supportedCoordSystems: string[] = [];
    selectedCoordSys;

    showSwapAxes: false;

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

        if (this.coordSystems) {
            for (const crs of this.coordSystems) {
                if (this.mapAdminSvc.isValidReferenceId(crs)) {
                    this.supportedCoordSystems.push(crs);
                }
            }
        } else {
            this.supportedCoordSystems = this.mapAdminSvc.supportedCRS.slice();
        }

        if (this.selectedCoordSystem) {
            const temp = this.supportedCoordSystems.find((crs) => crs === this.selectedCoordSystem);
            if (temp) {
                this.selectedCoordSys = this.selectedCoordSystem;
            }
        }
        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.coordSystems && this.initialized) {
            this.supportedCoordSystems = [];
            if (this.coordSystems) {
                for (const crs of this.coordSystems) {
                    if (this.mapAdminSvc.isValidReferenceId(crs)) {
                        this.supportedCoordSystems.push(crs);
                    }
                }
            } else {
                this.supportedCoordSystems = this.mapAdminSvc.supportedCRS.slice();
            }
            if (this.selectedCoordSystem) {
                const temp = this.supportedCoordSystems.find((crs) => crs === this.selectedCoordSystem);
                if (temp) {
                    this.selectedCoordSys = this.selectedCoordSystem;
                }
            }
        } else if (changes.selectedCoordSystem && this.initialized) {
            if (this.selectedCoordSystem) {
                const temp = this.supportedCoordSystems.find((crs) => crs === this.selectedCoordSystem);
                if (temp) {
                    this.selectedCoordSys = this.selectedCoordSystem;
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    setCRS(event: any) {
        this.selectedCoordSys = event.value;
        this.coordSystemChanged.emit(this.selectedCoordSys);
    }

    setSwapAxes(event: any) {
        this.swapAxes = event.checked;
        this.swapAxesChanged.emit(this.swapAxes);
    }

    /** Set up routine for localization. */
    private initLocalization() {
        this.mapAdminSvc.getTranslatedStrings(this.preFetchTokensList).then((response) => {
            this.transStrings = response;
        });
    }
}
