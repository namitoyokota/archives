import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommonCardTranslatedTokens, CommonCardTranslationTokens } from './common-card.translation';

export enum CardExpansionState {
    expanded = 'expanded',
    collapsed = 'collapsed',
    hidden = 'hidden',
    locked = 'locked'
}

// Action pane template area
@Component({
    selector: 'hxgn-common-card-action-pane',
    styles: [`
        :host {
            display: flex;
            min-width: 22px;
        }`
    ],
    template: `<ng-content></ng-content>`
})
export class CommonCardActionPaneComponent { }

// Icon pane template area
@Component({
    selector: 'hxgn-common-card-icon',
    styles: [`
        :host {
            display: flex;
            height: 100%;
        }`
    ],
    template: `<ng-content></ng-content>`
})
export class CommonCardIconPaneComponent { }

// Title pane template area
@Component({
    selector: 'hxgn-common-card-title',
    styles: [`
        :host {
            display: flex;
            height: 100%;
        }`
    ],
    template: `<ng-content></ng-content>`
})
export class CommonCardTitlePaneComponent { }


// Info content area
@Component({
    selector: 'hxgn-common-card-info-content',
    styles: [`
        :host {
            display: flex;
            height: 100%;
        }`
    ],
    template: `<ng-content></ng-content>`
})
export class CommonCardInfoContentPaneComponent { }

@Component({
    selector: 'hxgn-common-card-status-content',
    styles: [`
        :host {
            height: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }`
    ],
    template: `<ng-content></ng-content>`
})
export class CommonCardStatusContentPaneComponent { }

// Main card component
@Component({
    selector: 'hxgn-common-card',
    templateUrl: 'common-card.component.html',
    styleUrls: ['common-card.component.scss'],
    animations: [
        trigger('expansionState', [
            state(':enter', style({ height: '*' })),
            state(':leave', style({ height: '0' })),
            state('void', style({ height: '0' })),
            transition('* => *', animate('300ms ease-in-out'))
        ])
    ]
})

export class CommonCardComponent {

    /** Flag that is true if the card is expanded */
    @Input() expansionState = CardExpansionState.collapsed;

    /** Flag that is true if the card is selected */
    @Input() isSelected = false;

    /** Ref to expanded pane template */
    @Input() expandedPane: TemplateRef<any>;

    /** Flag that is true if the card was expanded*/
    @Input() wasExpanded: boolean;

    /** Text that is displayed in the card's header */
    @Input() headerTitle: string;

    /** Flag that is true if the card is editable */
    @Input() isEditable = false;

    /** Event when the card is clicked */
    @Output() cardClicked = new EventEmitter<void>();

    /** Event when the expansion state of the card changes */
    @Output() expansionStateChange = new EventEmitter<CardExpansionState>();

    /** Expose CardExpansionState to HTML */
    cardExpansionState: typeof CardExpansionState = CardExpansionState;

    /** Translated tokens */
    tTokens: CommonCardTranslatedTokens = {
        editable: ''
    }

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.intLocalization();

        this.localizationAdapter.adapterEvents.languageChanged$.subscribe(() => {
            this.intLocalization();
        });
    }

    /**
     * Toggles the expanded state
     * @param event Mouse event
     */
    toggleExpanded(event: MouseEvent) {
        event.stopPropagation();
        if (this.expansionState === CardExpansionState.expanded) {
            this.expansionState = CardExpansionState.collapsed;
        } else if (this.expansionState === CardExpansionState.collapsed) {
            this.expansionState = CardExpansionState.expanded;
        }

        this.expansionStateChange.emit(this.expansionState);
    }

    /**
   * Initialize localization
   */
    private async intLocalization(): Promise<void> {
        this.tTokens.editable = await this.localizationAdapter.getTranslationAsync(CommonCardTranslationTokens.editable);
    }
}
