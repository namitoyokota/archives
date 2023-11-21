import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HTTPCode } from '@galileo/web_common-http';
import { Guid } from '@galileo/web_common-libraries';
import { CompositeIcon$v1, KeywordRule$v1, KeywordRuleGroup$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { first } from 'rxjs/operators';

import { CompositeIconService } from '../composite-icon.service';
import { IconEditorDialogData } from '../icon-editor-dialog/icon-editor-dialog-data';
import { IconEditorDialogComponent } from '../icon-editor-dialog/icon-editor-dialog.component';
import { IconListType } from '../icon-library/icon-library.component';
import { KeywordRulesetStoreService } from '../keyword-ruleset-store.service';
import { TranslationTokens } from './add-icon-ruleset.translation';

@Component({
    selector: 'hxgn-commonkeywords-add-icon-ruleset',
    templateUrl: 'add-icon-ruleset.component.html',
    styleUrls: ['add-icon-ruleset.component.scss']
})

export class AddIconRulesetComponent implements OnChanges {

    /** Rules for the currently selected rules */
    @Input() rules: KeywordRule$v1[] = [];

    /** The current group selected */
    @Input() group: KeywordRuleGroup$v1;

    /** Event out the new rule to create */
    @Output() newRule = new EventEmitter<KeywordRule$v1>();

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** The default composite icon for the group */
    groupCompositeIcon: CompositeIcon$v1;

    constructor(private dialog: MatDialog,
        private compositeIconSrv: CompositeIconService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private errorNotification: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private ruleStore: KeywordRulesetStoreService) { }

    async ngOnChanges(changes: SimpleChanges) {

        this.loadCompositeIcons();
        this.groupCompositeIcon = await this.compositeIconSrv.getAsync(this.group.resourceId) as CompositeIcon$v1;

        // If group is empty add a new entry
        this.ruleStore.rules$(this.group.id).pipe(
            first()
        ).subscribe(icons => {
            if (!icons?.length) {
                this.addNewRule(null);
            }
        });

        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }

    /**
     * Open the icon editor for the default icon
     */
    editDefault(): void {
        const dialogRef = this.dialog.open(IconEditorDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: {
                compositeIcon: this.groupCompositeIcon,
                maxLayers: 10,
                titleToken: TranslationTokens.chooseDefaultIcon,
                descriptionToken: TranslationTokens.chooseDefaultIconDialogMsg,
                allowCancel: true,
                ruleFriendlyName: this.group.name,
                iconType: IconListType.groupIcon
            } as IconEditorDialogData
        });

        dialogRef.afterClosed().subscribe(async (compositeIcon: CompositeIcon$v1) => {

            await this.compositeIconSrv.updateAsync(compositeIcon).then(icon => {
                this.groupCompositeIcon = icon;

                this.cdr.detectChanges();
                this.cdr.markForCheck();
            }).catch(async err => {
                let errorMsg: string;
                if (err.statusCode === HTTPCode.Conflict) {
                    errorMsg = await this.localizationAdapter.getTranslationAsync(TranslationTokens.cannotSaveIconConflict);
                } else {
                    errorMsg = await this.localizationAdapter.getTranslationAsync(TranslationTokens.cannotSaveUnexpectedError);
                }

                this.errorNotification.open(errorMsg, err.status, {
                    duration: 8000
                });
            });
        });
    }

    /**
     * Creates a new empty rule
     * @param name Friendly name of new rule to create
     */
    addNewRule(name: string) {
        // Copy composite icon
        // Need to get the default composite icon and clone it
        const icon = new CompositeIcon$v1(this.groupCompositeIcon);
        icon.id = Guid.NewGuid();
        icon.etag = null;

        this.compositeIconSrv.addNew(icon);
        const rule = new KeywordRule$v1({
            friendlyName: name,
            resourceId: icon.id,
            groupId: this.group.id
        });

        this.newRule.emit(rule);
    }

    /**
     * Clones a given rule
     * @param rule Rule to clone
     */
    async cloneRule(rule: KeywordRule$v1) {
        // Copy composite icon
        // Need to get the composite icon and clone it
        const icon = new CompositeIcon$v1(await this.compositeIconSrv.getAsync(rule.resourceId) as CompositeIcon$v1);
        icon.id = Guid.NewGuid();
        icon.etag = null;

        this.compositeIconSrv.addNew(icon);
        const newRule = new KeywordRule$v1(rule);
        newRule.resourceId = icon.id;

        this.newRule.emit(newRule);
    }

    /**
     * Preload all the composite icons for this node branch
     */
    private async loadCompositeIcons() {
        const idList: string[] = [];

        if (this.group.resourceId) {
            idList.push(this.group.resourceId);
        }

        // Get from data service
        // This will likely be changed to a bulk call
        for (const i of idList) {
            // Load all icons into cache
            await this.compositeIconSrv.getAsync(i);
        }
    }
}
