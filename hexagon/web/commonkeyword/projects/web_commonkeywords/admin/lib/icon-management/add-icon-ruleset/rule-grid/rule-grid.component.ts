import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { KeywordRule$v1, KeywordRuleGroup$v1 } from '@galileo/web_commonkeywords/_common';
import { Observable } from 'rxjs';

import { KeywordRulesetStoreService } from '../../keyword-ruleset-store.service';
import { RuleGridTranslationTokens } from './rule-grid.translation';

@Component({
    selector: 'hxgn-commonkeywords-rule-grid',
    templateUrl: 'rule-grid.component.html',
    styleUrls: ['rule-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleGridComponent implements OnInit, OnChanges {

    /** Group that is being displayed in the grid */
    @Input() group: KeywordRuleGroup$v1;

    /** Event when a rule is being cloned */
    @Output() cloneRule = new EventEmitter<KeywordRule$v1>();

    /** Order to display columns */
    displayedColumns = ['icons', 'details', 'relatedEntries'];

    /** Name of new rule to add */
    newRuleName: string;

    /** Stream of rules to display in grid */
    rules$: Observable<KeywordRule$v1[]>;

    /** Expose RuleGridTranslationTokens to HTML */
    tokens: typeof RuleGridTranslationTokens = RuleGridTranslationTokens;

    constructor(public ruleStore: KeywordRulesetStoreService,
        private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.rules$ = this.ruleStore.rules$(this.group.id);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.rules$ = null;
        this.cdr.detectChanges();
        this.cdr.markForCheck();

        // Break angular tick
        setTimeout(() => {
            this.rules$ = this.ruleStore.rules$(this.group.id);
            this.cdr.detectChanges();
            this.cdr.markForCheck();
        });
    }

    /**
     * Update an existing rule
     * @param rule Updated rule
     */
    ruleUpdated(rule: KeywordRule$v1) {
        this.ruleStore.updateRule(rule);
    }

    /**
     * Delete an existing rule
     * @param rule Rule that is being delete
     */
    deleteRule(rule: KeywordRule$v1) {
        this.ruleStore.deleteRule(rule.resourceId);
    }

    /**
     * Improves performance. This informs the table how to uniquely identify rows.
     * @param index The index of the rule in the list
     * @param item The rule
     */
    trackByFunc(index, item: KeywordRule$v1,) {
        return item.resourceId;
    }
}
