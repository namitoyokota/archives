import { Component, Inject, OnInit } from '@angular/core';
import { AlarmHistoryItemSettings$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { ChangeOperator$v1 } from '@galileo/web_common-libraries';

import { ChannelAssociationHistoryItemTranslationTokens } from './channel-association-history-item.translation';

@Component({
    templateUrl: 'channel-association-history-item.component.html',
    styleUrls: ['channel-association-history-item.component.scss']
})
export class ChannelAssociationHistoryItemComponent implements OnInit {

    /** Flag that is true if the history item is for a created */
    createdItem = false;

    /** Expose ChannelAssociationHistoryItemTranslationTokens to HTML */
    tokens: typeof ChannelAssociationHistoryItemTranslationTokens = ChannelAssociationHistoryItemTranslationTokens;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private historyItemSettings: AlarmHistoryItemSettings$v1) { }

    ngOnInit() {
        this.createdItem = this.historyItemSettings.operations[0]?.operator === ChangeOperator$v1.addition;
    }

}
