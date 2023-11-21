import { Injectable } from '@angular/core';
import { KeywordRule$v1, KeywordRuleGroup$v1, KeywordRuleset$v1 } from '@galileo/web_commonkeywords/_common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class KeywordRulesetStoreService {

    /** Use to roll back aster a discard changes event */
    private currentRuleset: KeywordRuleset$v1;

    /** The current state of the ruleset being edited */
    private ruleset = new BehaviorSubject<KeywordRuleset$v1>(null);

    /** List of groups that have unsaved changes */
    private unsavedGroups = new BehaviorSubject<string[]>([]);

    /** Observable to the ruleset */
    ruleset$ = this.ruleset.asObservable().pipe(
        filter(item => !!item)
    );

    /** Get list of rule groups */
    rulesetGroupList$ = this.ruleset$.pipe(
        map(ruleSet => {
            const groupList: KeywordRuleGroup$v1[] = [];
            ruleSet.groups.forEach(group => {
                groupList.push(group);
            });

            return groupList;
        })
    );

    /** Observable to a list that contains group ids that have been updated */
    unsavedGroups$ = this.unsavedGroups.asObservable();

    /** Add a new group to the list of groups */
    addGroup(group: KeywordRuleGroup$v1) {
        const ruleset = this.ruleset.getValue();
        ruleset.groups.set(group.id, group);

        this.ruleset.next(ruleset);
        this.markGroupAsUnsaved(group.id);
    }

    /**
      * Sets the store's ruleset
      * @param ruleset The current ruleset
      */
    setRuleset(ruleset: KeywordRuleset$v1) {
        this.currentRuleset = ruleset ? ruleset : new KeywordRuleset$v1();
        this.ruleset.next(new KeywordRuleset$v1(this.currentRuleset));

        this.unsavedGroups.next([]);
    }

    /**
     * Updates group in the store
     * @param group Updated group
     */
    updateGroup(group: KeywordRuleGroup$v1) {
        const ruleset = this.ruleset.getValue();
        if (ruleset.groups.has(group.id)) {
            ruleset.groups.set(group.id, group);

            this.ruleset.next(ruleset);
            this.markGroupAsUnsaved(group.id);
        } else {
            console.warn(`HxGN Connect:: CommonKeywords: keyword-ruleset-store.service.ts
                - Group not found to update`, group);
        }
    }

    /**
     * Updated a rule in the store
     * @param rule Updated rule
     */
    updateRule(rule: KeywordRule$v1) {
        const ruleset = this.ruleset.getValue();
        ruleset.rules = ruleset.rules.map(r => {
            if (r.resourceId === rule.resourceId) {
                r = rule;
            }

            return r;
        });
        this.ruleset.next(ruleset);
        this.markGroupAsUnsaved(rule.groupId);
    }

    /**
     * Deletes a group and any associated rules
     * @param groupId Id of group to delete
     */
    deleteGroup(groupId: string) {
        const ruleset = this.ruleset.getValue();
        ruleset.groups.delete(groupId);

        // Delete any rules in the group
        ruleset.rules = ruleset.rules.filter(rule => {
            return rule.groupId !== groupId;
        });

        this.ruleset.next(ruleset);
        this.markGroupAsUnsaved(groupId);
    }

    /**
     * Returns an observable to a singe group.
     * @param groupId Group ID to get
     */
    group$(groupId: string): Observable<KeywordRuleGroup$v1> {
        return this.rulesetGroupList$.pipe(
            map(groups => {
                return groups.find(group => group.id === groupId);
            })
        );
    }

    /**
     * Returns an observable to a list of rules for a given group
     * @param groupId Group id to get rules for
     */
    rules$(groupId: string): Observable<KeywordRule$v1[]> {
        return this.ruleset$.pipe(
            map(ruleSet => {
                return ruleSet.rules.filter(rule => rule.groupId === groupId);
            })
        );
    }

    /**
     * Adds a new keyword rule to the store
     * @param rule Keyword rule to add to store
     */
    addRule(rule: KeywordRule$v1) {
        const ruleset = this.ruleset.getValue();
        ruleset.rules = ruleset.rules.concat(rule);

        this.ruleset.next(ruleset);

        this.markGroupAsUnsaved(rule.groupId);
    }

    /**
     * Deletes a rule from the store
     * @param id Id of rule to delete
     */
    deleteRule(id: string) {
        const ruleset = this.ruleset.getValue();

        ruleset.rules = ruleset.rules.filter(rule => {
            if (rule.resourceId === id) {
                this.markGroupAsUnsaved(rule.groupId);
                return false;
            }

            return true;
        });

        this.ruleset.next(ruleset);
    }

    /**
     * Restore the store to a state that was last saved
     */
    discardChanges() {
        this.ruleset.next(new KeywordRuleset$v1(this.currentRuleset));
        this.unsavedGroups.next([]);
    }

    /**
     * Marks a groups as having unsaved changes
     * @param id Id of group that has unsaved changes
     */
    private markGroupAsUnsaved(groupId: string) {
        const groups = this.unsavedGroups.getValue();

        // Check if the group id is already in the list
        if (!groups.find(id => id === groupId)) {
            groups.push(groupId);
            this.unsavedGroups.next(groups);
        }
    }

}
