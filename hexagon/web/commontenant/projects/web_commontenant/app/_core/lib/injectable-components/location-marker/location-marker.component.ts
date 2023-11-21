import {
    Component, OnInit, Inject,
    ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { Marker$v1} from '@galileo/web_commonmap/adapter';
import * as Common from '@galileo/web_commontenant/_common';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
    templateUrl: 'location-marker.component.html',
    styleUrls: ['location-marker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeout', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(300)
            ]),
            transition(':leave', [
                animate(300, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' })),
        ])
    ]
})
/**
 * A component that is intended to be displayed on a map.
 */
export class LocationMarkerInjectableComponent implements OnInit, OnDestroy {


    /** URL of icon */
    iconUrl: string;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private cdr: ChangeDetectorRef,
        @Inject(Common.LAYOUT_MANAGER_SETTINGS) private marker:
            Marker$v1) {
    }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        const tenant$ = this.marker.markerSettings.properties.tenant$;
        if (tenant$) {
            tenant$.pipe(
                takeUntil(this.destroy$)
            ).subscribe( (tenant: Common.Tenant$v1) => {

                if (tenant) {
                    this.iconUrl = tenant.tenantIconUrl;
                } else {
                    this.iconUrl = 'assets/commontenant-core/Organization-default-icon.png';
                }
                this.cdr.detectChanges();
            });
        }
    }


    /**
     * On destroy lifecycle hook
     */
    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }



}
