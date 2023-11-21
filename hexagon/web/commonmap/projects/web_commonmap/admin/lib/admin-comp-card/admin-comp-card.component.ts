import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AdminCompInfo } from '@galileo/web_commonmap/_common';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonmapAdminService } from '../admin.service';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AdminCompCardTranslationTokens } from './admin-comp-card.translation';

@Component({
    selector: 'hxgn-commonmap-admin-comp-card',
    templateUrl: './admin-comp-card.component.html',
    styleUrls: ['./admin-comp-card.component.scss']
})
export class AdminCompCardComponent implements OnInit, OnDestroy {
    @Input() adminComp: AdminCompInfo;
    @Input() selected = false;
    @Output() cardClicked: EventEmitter<void> = new EventEmitter<void>();

    /**  Expose translation tokens to html template */
    tokens: typeof AdminCompCardTranslationTokens = AdminCompCardTranslationTokens;

    /** Indicate if admin component is registered yet */
    registered = false;
    private destroy$ = new Subject<void>();

    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService,
                private mapAdminSvc: CommonmapAdminService) {
    }

    async ngOnInit() {
        if (this.adminComp) {
            this.mapAdminSvc.mapAdminComponents$.pipe(
                filter((data) => !!data),
                takeUntil(this.destroy$)
            ).subscribe((adminCompInfos: AdminCompInfo[]) => {
                if (this.adminComp) {
                    const comp = adminCompInfos.find((compInfo) =>
                        compInfo.adminCompData.capabilityId === this.adminComp.adminCompData.capabilityId);
                    if (comp) {
                        this.registered = comp.registered;
                        this.adminComp = comp;
                    }
                }
            });
            this.registered = this.adminComp.registered;
            if (!this.registered) {
                await this.layoutCompilerSrv.loadCapabilityCoreAsync(this.adminComp.adminCompData.capabilityId);
            }
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    fireCardClicked() {
        this.cardClicked.emit();
    }
}
