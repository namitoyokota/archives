import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { KeywordRule$v1, KeywordRuleGroup$v1 } from '@galileo/web_commonkeywords/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Industries$v1 } from '@galileo/web_commontenant/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KeywordRulesetStoreService } from '../keyword-ruleset-store.service';
import { TranslatedTokens, TranslationTokens } from './group-list-pane.translation';
import { GroupListComponent } from './group-list/group-list.component';

@Component({
    selector: 'hxgn-commonkeywords-group-list-pane',
    templateUrl: 'group-list-pane.component.html',
    styleUrls: ['group-list-pane.component.scss']
})
export class GroupListPaneComponent implements OnInit, OnChanges, OnDestroy {

    /** The ruleset groups for a industry */
    @Input() rulesetGroups: KeywordRuleGroup$v1[];

    /** List of group ids that have have unsaved changes in them */
    @Input() unsavedGroups: string[] = [];

    /** List of industry's that icons can be made for */
    @Input() industryList: Industries$v1[] = [];

    /** The industry that is currently selected */
    @Input() selectedIndustry: string;

    /** List of rules used for searching */
    @Input() searchRules: KeywordRule$v1[] = [];

    /** Event out the selected keyword node */
    @Output() selection = new EventEmitter<KeywordRuleGroup$v1>();

    /** Event out the selected industry changed */
    @Output() industrySelection = new EventEmitter<string>();

    /** Reference to the group list */
    @ViewChild('grouplist') groupList: GroupListComponent;

    /** Ordered and filter version of ruleset group */
    filterGroup: KeywordRuleGroup$v1[];

    /** The group that is currently selected */
    selectedGroup: KeywordRuleGroup$v1;

    /** String to use to filter down list */
    searchString = '';

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private ruleStore: KeywordRulesetStoreService
    ) { }

    async ngOnInit() {
        this.initLocalization();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.localizationAdapter.localizeStringsAsync(this.industryList.map(i => i.nameToken));

        this.sortFilterRuleset();

        // make default selection
        if (!this.selectedGroup && this.filterGroup && this.filterGroup.length) {
            this.setSelectedGroup(this.filterGroup[0]);
        }
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Clears search text
     */
    clearText(): void {
        this.searchString = '';
        this.filterGroup = this.rulesetGroups;
    }

    /**
     * Sorts and filters the ruleset group
     */
    sortFilterRuleset(): void {
        this.filterGroup = this.rulesetGroups;
        if (this.filterGroup) {
            this.sortRuleset();

            if (this.searchString.length) {
                const searchString: string = this.searchString.trim().toLocaleLowerCase();

                this.filterGroup = this.filterGroup.filter((group: KeywordRuleGroup$v1) => {

                    // Do any group names match
                    const groupMatch: boolean = group.name?.toLocaleLowerCase().includes(searchString);

                    if (groupMatch) {
                        return true;
                    }

                    // Do any rule names match
                    const ruleNameMatch: boolean = this.searchRules.some((rule: KeywordRule$v1) => {
                        return group.id === rule.groupId && rule.friendlyName?.toLocaleLowerCase().includes(searchString);
                    });

                    if (ruleNameMatch) {
                        return true;
                    }

                    // Do any rules in the group match the keyword
                    const ruleKeywordMatch: boolean = this.searchRules.some((rule: KeywordRule$v1) => {
                        return group.id === rule.groupId &&
                            rule.keywords.some((keyword: string) => {
                                return keyword.toLocaleLowerCase().includes(searchString);
                            });
                    });

                    return ruleKeywordMatch;
                });
            }
        }
    }

    /**
     * Sets the selected group as the active keyword node
     */
    setSelectedGroup(group: KeywordRuleGroup$v1) {
        this.selectedGroup = group;
        this.selection.emit(this.selectedGroup);
    }

    /**
     * Adds a new rule to the ruleset tree
     */
    addNewRuleNode(groupName: string) {
        const newGroup = new KeywordRuleGroup$v1({
            name: groupName
        });
        this.ruleStore.addGroup(newGroup);

        setTimeout(() => {
            // Scroll to new item
            this.groupList.scrollToGroup(newGroup.id);
        });

        this.setSelectedGroup(newGroup);
    }

    /**
     * Sets the selected industry
     * @param event Angular selection change object
     */
    setSelectedIndustry(event: MatSelectChange) {
        this.industrySelection.emit(event.value);

        this.selectedGroup = null;
    }

    /**
     * Updates a group in the store
     * @param group The updated group
     */
    updateGroup(group: KeywordRuleGroup$v1) {
        this.ruleStore.updateGroup(group);
    }

    /**
     * Deletes a group from the store
     * @param groupId Id of the group to delete
     */
    deleteGroup(groupId: string) {
        // Update the selected group
        if (this.rulesetGroups.length > 1) {
            const removeIndex = this.rulesetGroups.findIndex(group => group.id === groupId);

            if (removeIndex >= 0) {
                if (this.rulesetGroups[removeIndex - 1]) {
                    this.setSelectedGroup(this.rulesetGroups[removeIndex - 1]);
                } else {
                    this.setSelectedGroup(null);
                }
            } else {
                if (this.rulesetGroups[1]) {
                    this.setSelectedGroup(this.rulesetGroups[1]);
                } else {
                    this.setSelectedGroup(null);
                }
            }

        } else {
            this.setSelectedGroup(null);
        }

        this.ruleStore.deleteGroup(groupId);
    }

    /**
     * Puts the ruleset in order by keyword
     */
    private sortRuleset() {
        this.filterGroup.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);

        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.searchGroups = translatedTokens[TranslationTokens.searchGroups];
    }
}
