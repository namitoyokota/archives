import { Component, OnInit, ChangeDetectorRef, OnDestroy, ComponentRef, ViewChild } from '@angular/core';
import { CommonmapAdminService } from '../admin.service';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { takeUntil, filter } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { DirtyComponent$v1 } from '@galileo/web_common-libraries';
import { MapConfigTranslationTokens } from './map-configuration.translation';
import { AdminCompInfo } from '@galileo/web_commonmap/_common';

@Component({
    selector: 'hxgn-commonmap-admin-configuration',
    templateUrl: './map-configuration.component.html',
    styleUrls: ['./map-configuration.component.scss']
})
export class MapConfigurationComponent implements OnInit, OnDestroy, DirtyComponent$v1 {
    /** View child for notification manager component. */
    @ViewChild('commonMapAdminComp') cmDirtyComp: DirtyComponent$v1;
    /**  Expose translation tokens to html template */
    tokens: typeof MapConfigTranslationTokens = MapConfigTranslationTokens;

    mapDataLoaded = false;
    adminComps: AdminCompInfo[];
    selectedAdminComp: AdminCompInfo;
    adminDirtyComp: DirtyComponent$v1;

    /** Bus for is dirty. */
    isDirtySub$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** IsDirty implementation from DirtyComponent. */
    isDirty$ = this.isDirtySub$.asObservable();
    /** Bus for disable save. */
    disabledSaveSub$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Disable implementation from DirtyComponent. */
    disabledSave$ = this.disabledSaveSub$.asObservable();

    /** Reference to the injected component */
    private adminCompRef: ComponentRef<any>;
    private destroy$ = new Subject<void>();
    private destroyIsDirty$ = new Subject<void>();

    constructor(private mapAdminSvc: CommonmapAdminService,
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private titleSrv: Title,
        private changeRef: ChangeDetectorRef) {

        this.mapAdminSvc.mapDataLoaded$.pipe(
            filter((data) => !!data),
            takeUntil(this.destroy$)
        ).subscribe((dataLoaded) => {
            this.mapDataLoaded = true;

            this.mapAdminSvc.mapAdminComponents$.pipe(
                takeUntil(this.destroy$)
            ).subscribe((adminComps: AdminCompInfo[]) => {
                this.adminComps = adminComps;
                this.selectedAdminComp =
                    this.adminComps.find(comp => comp.adminCompData.nameToken === this.tokens.standardMapComponentName);
            });
        });
        this.mapAdminSvc.isDirty$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((isDirty) => {
            if (this.isDirtySub$.getValue() !== isDirty) {
                this.isDirtySub$.next(isDirty);
            }
        });
        this.mapAdminSvc.disableSave$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((disableSave) => {
            if (this.disabledSaveSub$.getValue() !== disableSave) {
                this.disabledSaveSub$.next(disableSave);
            }
        });
    }

    ngOnInit() {
        this.titleSrv.setTitle('HxGN Connect');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        this.destroyIsDirty$.next();
        this.destroyIsDirty$.complete();

        if (this.adminCompRef) {
            this.adminCompRef.destroy();
            this.adminCompRef = null;
        }
    }

    async setAdminComp(adminComp) {
        this.selectedAdminComp = adminComp;
        this.changeRef.detectChanges();

        if (this.selectedAdminComp.adminCompData.nameToken !== this.tokens.standardMapComponentName) {
            await this.layoutCompilerSrv.loadCapabilityCoreAsync(this.selectedAdminComp.adminCompData.capabilityId);
            this.adminCompRef = await this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
                this.selectedAdminComp.adminCompData.componentName, this.selectedAdminComp.adminCompData.capabilityId,
                '#adminComp', {}, 'mapConfiguration'
            );
            if (this.adminCompRef) {
                this.adminDirtyComp = this.adminCompRef.instance as DirtyComponent$v1;
                this.isDirtySub$.next(false);
                if (this.adminDirtyComp?.isDirty$) {
                    this.adminDirtyComp.isDirty$.pipe(
                        takeUntil(this.destroyIsDirty$)
                    ).subscribe((isDirty) => {
                        if (this.isDirtySub$.getValue() !== isDirty) {
                            this.isDirtySub$.next(isDirty);
                        }
                    });
                }

                if (this.adminDirtyComp?.disabledSave$) {
                    this.adminDirtyComp.disabledSave$.pipe(
                        takeUntil(this.destroyIsDirty$)
                    ).subscribe((disableSave) => {
                        if (this.disabledSaveSub$.getValue() !== disableSave) {
                            this.disabledSaveSub$.next(disableSave);
                        }
                    });
                }
            }
        } else if (this.adminCompRef) {
            this.destroyIsDirty$.next();
            this.adminCompRef.destroy();
            this.adminCompRef = null;
            this.isDirtySub$.next(false);
        }

    }

    /**
     * Saves all active changes.
     */
     async saveChangesAsync(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (this.adminDirtyComp?.saveChangesAsync) {
                let err = false;
                this.adminDirtyComp.saveChangesAsync().catch((reason) => {
                    err = true;
                    console.log('Error saving changes from call to admin component' + reason);
                    reject();
                }).then(() => {
                    if (!err) {
                        resolve();
                    }
                });
            } else {
                let err = false;
                if (this.cmDirtyComp) {
                    await this.cmDirtyComp.saveChangesAsync().catch((reason) => {
                        err = true;
                        console.log('Error saving changes from call to saveChangesAsync' + reason);
                        reject();
                    }).then(() => {
                        if (!err) {
                            resolve();
                        }
                    });
                }
            }
        });
     }
}
