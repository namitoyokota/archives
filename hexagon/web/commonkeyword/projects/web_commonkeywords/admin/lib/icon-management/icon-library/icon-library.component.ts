import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { CommonConfirmDialogComponent, ConfirmDialogData, PanelState, Utils } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { capabilityId, CompatibleOptions, PrimitiveIcon$v2 } from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CapabilityManifest$v1, CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PrimitiveIconStoreService } from '../primitivie-icon-store.service';
import { TranslatedTokens, TranslationTokens } from './icon-library.translation';

export enum IconListType {
    groupIcon = 0,
    modifierIcon = 1
}

@Component({
    selector: 'hxgn-commonkeywords-icon-library',
    templateUrl: 'icon-library.component.html',
    styleUrls: ['icon-library.component.scss'],
    animations: [
        trigger('expansionState', [
            state(':enter', style({ height: '*' })),
            state(':leave', style({ height: '0' })),
            state('void', style({ height: '0' })),
            transition('* => *', animate('500ms ease-in-out'))
        ])
    ]
})
export class IconLibraryComponent implements OnInit, OnDestroy {

    /** Reference to tabs component */
    @ViewChild('iconTypeTabs', { static: true }) tabs: MatTabGroup;

    /** List of icon ids that are selected */
    @Input() selectedIcons: string[] = [];

    /** Output when an icon is clicked */
    @Output() iconClicked = new EventEmitter<PrimitiveIcon$v2>();

    /** List of primitive icon groups */
    groupList: string[] = [];

    /** Map of icons to groups */
    groupIconMap = new Map<string, PrimitiveIcon$v2[]>();

    /** String to use to filter down list of icons */
    searchString = '';

    /** Is true when the translations tokens are done loading */
    translationTokensLoaded = false;

    /** Which type of icons should be shown */
    selectedIconType: IconListType = IconListType.groupIcon;

    /** A flag that is true when the modifier tab is disabled */
    disableModifiers = false;

    /** Sets whether the panel starts expanded or collapsed */
    panelState: PanelState = PanelState.Collapsed;

    /** List of capabilities that support icon management */
    capabilityList: CapabilityManifest$v1[] = [];

    /** List of currently selected capability name tokens */
    selectedCapabilities: CapabilityManifest$v1[] = [];

    /** Describes the states of the Panel */
    PanelState: typeof PanelState = PanelState;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {
      searchIcons: '',
      groupIcons: '',
      modifierIcons: '',
      deleteIcon: '',
      deleteIconConfirm: '',
    } as TranslatedTokens;

    /** List of icons the user can pick from */
    private iconList: PrimitiveIcon$v2[] = [];

    /** Filter list of icons based on search string */
    private filterIconList: PrimitiveIcon$v2[] = [];

    /** List of icon translation tokens */
    private iconTokens: string[] = [];

    /** Map of tokens and strings */
    private translationMapping = new Map<string, string>();

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private primitiveIconStore: PrimitiveIconStoreService,
        private tenantAdapter: CommontenantAdapterService$v1,
        private dialog: MatDialog,
        private dataSrv: DataService,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) { }

    async ngOnInit() {
        this.initLocalization();

        this.capabilityList = (await this.tenantAdapter.getCapabilityListAsync(capabilityId))?.filter(manifest => {
            const settings: CompatibleOptions = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CompatibleOptions;
            if (settings?.featureFlag && !this.ffAdapter.isActive(settings.featureFlag)) {
                return false;
            }

            return true;
        });
        this.localizationAdapter.localizeStringsAsync(this.capabilityList.map(c => c.nameToken));
        this.selectedCapabilities = this.capabilityList;

        this.translationTokensLoaded = false;
        this.iconList = this.primitiveIconStore.list();
        this.transformRawIconList();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.localizationAdapter.localizeStringsAsync(this.capabilityList.map(c => c.nameToken));
            this.transformRawIconList();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Clears search string
     */
    clearText(): void {
        this.searchString = '';
        this.transformRawIconList();
    }

    /**
     * Returns true if the id is selected
     * @param id The id to check if it is selected
     */
    isSelected(id: string): boolean {
        return !!this.selectedIcons.find(iconId => iconId === id);
    }

    /**
     * Returns an array filled with the number of item needed to square up a group
     * @param length The length of the icons in the group
     */
    getSpacerArray(length: number) {
        const row = 4;
        const total = row * Math.ceil(length / row) - length;
        const arr = [];
        for (let i = 0; i < total; i++) {
            arr.push(i);
        }

        return arr;
    }

    /**
     * Transform the raw icon list into a form that can be used
     */
    async transformRawIconList() {
        this.filterIconList = Utils.deepCopy(this.iconList);

        this.searchString = this.searchString.trim();
        if (this.searchString) {
            await this.localizationAdapter.localizeStringsAsync(this.iconTokens);
            await this.localizationAdapter.localizeStringsAsync(
              this.filterIconList.map(icon => { return icon.categoryToken })
            );

            const nameTokenMap = await this.localizationAdapter.getTranslationAsync(this.iconTokens);
            const cateTokenMap = await this.localizationAdapter.getTranslationAsync(
                this.filterIconList.map(icon => { return icon.categoryToken })
            );

            this.filterIconList = this.filterIconList.filter(item => {
                const name = nameTokenMap[item.nameToken];
                const category = cateTokenMap[item.categoryToken];

                return name?.toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase()) ||
                    category?.toLocaleLowerCase().includes(this.searchString.toLocaleLowerCase());
            });
        }

        // Filter on selected capability
        this.filterIconList = this.filterIconList.filter(icon =>
            this.selectedCapabilities.some(capability =>
                capability.id === icon.capabilityId
            ) || icon.capabilityId === '*'
        );

        // Filter on selected type: group or modifier
        this.filterIconList = this.filterIconList.filter(icon => {
            if (this.selectedIconType === IconListType.groupIcon) {
                return !icon.isModifier;
            } else {
                return icon.isModifier;
            }
        });

        this.buildIconGroupList();

        this.localizeIconStrings().then(() => {
            this.groupList.sort((a, b) => this.sortByTokenMap(a, b));

            // Sort all the icons inside the groups
            this.groupIconMap.forEach((icons, group) => {
                icons.sort((a, b) => {
                    return this.sortByTokenMap(a.nameToken, b.nameToken);
                });
            });

            this.translationTokensLoaded = true;
        });
    }

    /**
     * Used to track groups in ngfor loop
     * @param index Index of item
     * @param item  Item
     */
    groupTrackByFn(index, item: string) {
        return item;
    }

    /**
     * Used to track icon in ngfor loop inside a group
     * @param index Index of item
     * @param item  Item
     */
    iconTrackByFn(index, item: PrimitiveIcon$v2) {
        return item.id;
    }

    /** Sets the selected list type */
    setSelectedType(type: IconListType) {
        this.selectedIconType = type;
        this.tabs.selectedIndex = type;
        this.transformRawIconList();
    }

    private async localizeIconStrings() {
        this.iconTokens = [];
        this.iconList.forEach((icon) => {
            if (!this.iconTokens.find(str => str === icon.nameToken)) {
                this.iconTokens.push(icon.nameToken);
            }
        });

        // Process group list tokens
        this.groupList.forEach(group => {
            this.iconTokens.push(group);
        });

        await this.localizationAdapter.localizeStringsAsync(this.iconTokens);

        // Build translation mapping
        for (const token of this.iconTokens) {
            this.translationMapping.set(token, await this.localizationAdapter.getTranslationAsync(token));
        }
    }

    /**
     * Build up the group list and groups the icons based on the groups
     */
    private buildIconGroupList() {
        this.groupList = [];
        this.groupIconMap = new Map<string, PrimitiveIcon$v2[]>();

        this.filterIconList.forEach((icon) => {
            if (!this.groupIconMap.has(icon.categoryToken)) {
                this.groupList.push(icon.categoryToken);
                this.groupIconMap.set(icon.categoryToken, [icon]);
            } else {
                const list = this.groupIconMap.get(icon.categoryToken);
                list.push(icon);
                this.groupIconMap.set(icon.categoryToken, list);
            }
        });
    }

    /**
     * Sort dictionary
     */
    private sortByTokenMap(a, b) {
        const aTranslation = this.translationMapping.get(a).toLocaleLowerCase();
        const bTranslation = this.translationMapping.get(b).toLocaleLowerCase();

        if (aTranslation < bTranslation) {
            return -1;
        } else {
            return 1;
        }
    }

    /**
     * Toggles the expanded/collapsed state of the panel
     */
    toggle(): void {
        this.panelState = this.panelState === PanelState.Expanded ? PanelState.Collapsed : PanelState.Expanded;
    }

    /**
     * Adds or removes capability from currently selected list
     */
    selectCapability(capability: CapabilityManifest$v1) {
        if (!this.selectedCapabilities.includes(capability)) {
            this.selectedCapabilities.push(capability);
        } else if (this.selectedCapabilities.length > 1) {
            this.selectedCapabilities = this.selectedCapabilities.filter(c => c !== capability);
        }

        this.transformRawIconList();
    }

    /**
     * Deletes icon
     */
    deleteIcon(id: string) {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: {
                titleToken: this.tokens.deleteIcon,
                msgToken: this.tokens.deleteIconConfirm
            } as ConfirmDialogData
        }).afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.dataSrv.primitiveIcon.delete$([id]).toPromise().then((ids: string[]) => {
                    ids.forEach(id => this.primitiveIconStore.remove(id));
                    this.iconList = this.primitiveIconStore.list();
                    this.transformRawIconList();
                });
            }
        });
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);

        await this.localizationAdapter.localizeStringsAsync(tokens);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.searchIcons = translatedTokens[TranslationTokens.searchIcons];
        this.tTokens.groupIcons = translatedTokens[TranslationTokens.groupIcons];
        this.tTokens.modifierIcons = translatedTokens[TranslationTokens.modifierIcons];
        this.tTokens.deleteIcon = translatedTokens[TranslationTokens.deleteIcon];
        this.tTokens.deleteIconConfirm = translatedTokens[TranslationTokens.deleteIconConfirm];
    }
}
