import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadComponent, Guid } from '@galileo/web_common-libraries';
import { ServerEntity$v1 } from '@galileo/web_commonlicensing/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1, MapData$v1, Tenant$v1 } from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AddTenantDialogTranslatedTokens, AddTenantDialogTranslationTokens } from './add-tenant-dialog.translation';

@Component({
    selector: 'hxgn-commontenant-add-tenant-dialog',
    templateUrl: './add-tenant-dialog.component.html',
    styleUrls: ['./add-tenant-dialog.component.scss']
})
export class AddTenantDialogComponent implements OnInit, OnDestroy {

    /** Reference to the icon upload component */
    @ViewChild(FileUploadComponent) iconUploadRef: FileUploadComponent;

    /** Tracks dialog page number. */
    currentPage = 1;

    /** Tenant icon */
    icon: File;

    /** List of supported cultures. */
    languageTokens: Map<string, string>;

    /** List of sectors. Denoted by sectorToken and associated Industry values. */
    sectors: Map<string, Industries$v1[]> = new Map<string, Industries$v1[]>();

    /** Tenant to be added */
    tenant: Tenant$v1 = new Tenant$v1();

    /**  Expose translation tokens to html template */
    tokens: typeof AddTenantDialogTranslationTokens = AddTenantDialogTranslationTokens;

    /** Translated tokens */
    tTokens: AddTenantDialogTranslatedTokens = {} as AddTenantDialogTranslatedTokens;

    /** Translated industries map values. */
    private industriesDisplay: Map<string, string> = new Map<string, string>();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<AddTenantDialogComponent>,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit(): void {
        this.initLocalizationAsync();

        this.tenant.mapData = new MapData$v1();
        this.tenant.licenseData = new ServerEntity$v1();

        this.sectors = this.data.sectors;
        this.industriesDisplay = this.data.industriesDisplay;
        this.languageTokens = this.data.languageTokens;

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Closes dialog.
     */
    close(): void {
        this.dialogRef.close();
    }

    /**
     * Returns a sorted industry list
     * @param industryList Industry list to sort
     */
    getIndustryListSorted(industryList: Industries$v1[]): Industries$v1[] {
        return industryList.sort((a, b) => {
            if (this.industriesDisplay.get(a.id) > this.industriesDisplay.get(b.id)) {
                return 1;
            } else if (this.industriesDisplay.get(a.id) < this.industriesDisplay.get(b.id)) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Goes back to the previous page.
     */
    goBack(): void {
        this.currentPage -= 1;

        // If first page set upload file if there is one
        if (this.currentPage === 1 && this.icon) {
            setTimeout(() => {
                this.iconUploadRef.form.get('file').setValue(this.icon);
            });
        }
    }

    /**
     * Goes forward to the next page.
     */
    goForward(): void {
        this.currentPage += 1;
    }

    /**
     * Saves new tenant and closes dialog.
     */
    save(): void {
        this.tenant.id = Guid.NewGuid();
        this.tenant.enabled = true;
        this.tenant.newIconFile = this.icon;
        this.dialogRef.close(this.tenant);
    }

    /**
     * Sets the tenant icon file
     * @param file Icon file
     */
    setNewIcon(file: File): void {
        this.icon = file;
    }

    /**
     * Updates the map data for the tenant
     * @param mapData Map Data to use for the update
     */
    updateMapData(mapData: MapData$v1): void {
        this.tenant.mapData = mapData;
    }


    /**
     * Updates the networks in the tenant
     * @param networks the currently selected networks
     */
    updateNetworks(networks: string[]) {
        this.tenant.dataSharingNetworks = networks;
    }

    /**
     * Updates selected industry ids.
     */
    updateSelectedIndustries(industryId: string): void {
        if (this.tenant.industryIds.includes(industryId)) {
            this.tenant.industryIds = this.tenant.industryIds.filter(x => x !== industryId);
        } else {
            this.tenant.industryIds.push(industryId);
        }
    }

    /**
     * Returns true if page one is valid
     */
    validatePageOne(): boolean {
        return (
            !!this.tenant.name &&
            !!this.tenant.culture &&
            !!this.tenant.industryIds.length &&
            this.tenant.abbreviation?.trim().length >= 2 &&
            this.tenant.abbreviation?.trim().length <= 4
        );
    }

    /**
     * Returns true if page two is valid
     */
    validatePageTwo(): boolean {
        return (
            !!this.tenant.city &&
            !!this.tenant.state &&
            !!this.tenant.country &&
            !!this.tenant.licenseData?.licenseFileContents &&
            this.emailIsValid()
        );
    }

    /**
     * Returns true if the email is valid
     */
    emailIsValid(): boolean {
        const re = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/;
        return re.test(this.tenant.contactAddress);
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(AddTenantDialogTranslationTokens).map(k => AddTenantDialogTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.chooseImage = translatedTokens[AddTenantDialogTranslationTokens.chooseImage];
        this.tTokens.dragAndDropImage = translatedTokens[AddTenantDialogTranslationTokens.dragAndDropImage];
    }
}
