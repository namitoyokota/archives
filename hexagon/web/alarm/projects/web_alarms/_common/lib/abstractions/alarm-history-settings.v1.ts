import { ChangeOperation$v1 } from '@galileo/web_common-libraries';

export class AlarmHistoryItemSettings$v1 {

    /** The alarm to show history for. Needed for displaying attachments. */
    alarmId: string;

    /** Whether or not to show the concise history item view. Defaults to non-concise view. */
    concise: boolean;

    /** Operations to display. */
    operations: ChangeOperation$v1[];

    constructor(params: AlarmHistoryItemSettings$v1 = {} as AlarmHistoryItemSettings$v1) {
        const {
            alarmId,
            concise,
            operations = []
        } = params;

        this.alarmId = alarmId;
        this.concise = concise;
        this.operations = operations;
    }
}
