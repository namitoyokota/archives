import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { TranslatedTokens, TranslationTokens } from './restore-dialog.translation';

export interface DialogSetting {
    /** Run id of the pipeline */
    runId?: string;

    /** Tenant id used for restore */
    tenantId?: string;
}

@Component({
    templateUrl: 'restore-dialog.component.html',
    styleUrls: ['restore-dialog.component.scss']
})
export class RestoreDialogComponent implements OnInit, OnDestroy {

    /** Possible capability ids to restore */
    capabilities: string[];

    /** Currently selected capability ids */
    selectedIds: string[] = [];

    /** Map for capability id and name token */
    capabilityMap: Map<string, string> = new Map<string, string>();

    /** String entered by user to confirm action */
    confirmString: string;

    /** True until capabilities are loaded */
    isLoading = true;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** List of capability name tokens to translate */
    private capabilityNameTokens: string[] = [];

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private dialogRef: MatDialogRef<RestoreDialogComponent>,
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1,
        @Inject(MAT_DIALOG_DATA) private setting: DialogSetting) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.capabilities = await this.dataSrv.getCapabilities$(this.setting.tenantId, this.setting.runId).toPromise();
        const capabilityManifests = await this.tenantSrv.getCapabilityListAsync();
        this.capabilityNameTokens = [];

        this.capabilities.map(id => {
            const capability = capabilityManifests.find(c => c.id === id);
            if (capability) {
                const token = capability.nameToken;
                this.capabilityNameTokens.push(token);
                this.capabilityMap.set(id, token);
            }
        });

        this.capabilities = this.capabilities.filter(capability => this.capabilityMap.has(capability));
        this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);

        this.isLoading = false;

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
            this.localizationSrv.localizeStringsAsync(this.capabilityNameTokens);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Select or unselect all capabilities
     */
    selectAll(event: MatCheckboxChange): void {
        if (event.checked) {
            this.selectedIds = this.capabilities;
        } else {
            this.selectedIds = [];
        }
    }

    /**
     * Returns true if all capabilities are selected
     */
    allSelected(): boolean {
        return JSON.stringify(this.capabilities) === JSON.stringify(this.selectedIds);
    }

    /**
     * Returns true if the given capability is selected
     * @param capabilityId Capability Id to check
     */
    isSelected(capabilityId: string): boolean {
        return this.selectedIds.some(id => id === capabilityId);
    }

    /**
     * Returns the name token for the given capability id
     * @param capabilityId Capability Id to return token for
     */
    getNameToken(capabilityId: string): string {
        return this.capabilityMap.get(capabilityId);
    }

    /**
     * Adds or removes a capability from the selected capability list
     * @param event Angular material checkbox change event
     * @param capabilityId The capability to add or remove
     */
    toggleCapabilityAsync(event: MatCheckboxChange, capabilityId: string) {
        if (event.checked) {
            this.selectedIds = [...this.selectedIds, capabilityId];
        } else {
            this.selectedIds = this.selectedIds.filter(id => {
                return id !== capabilityId;
            });
        }
    }

    /** Closes the dialog and emits the selected capabilities */
    confirm() {
        this.dialogRef.close(this.selectedIds);
    }

    /** Closes the dialog and emits the cancel flag */
    close() {
        this.dialogRef.close();
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.confirmMsg = translatedTokens[TranslationTokens.confirmMsg];
        this.tTokens.title = translatedTokens[TranslationTokens.title];
    }
}
