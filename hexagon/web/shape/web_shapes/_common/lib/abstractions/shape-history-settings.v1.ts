import { ChangeOperation$v1 } from '@galileo/web_common-libraries';

export class ShapeHistoryItemSettings$v1 {

    /** The shape to show history for. Needed for displaying attachments. */
    shapeId: string;

    /** Whether or not to show the concise history item view. Defaults to non-concise view. */
    concise: boolean;

    /** Operations to display. */
    operations: ChangeOperation$v1[];

    constructor(params: ShapeHistoryItemSettings$v1 = {} as ShapeHistoryItemSettings$v1) {
        const {
            shapeId,
            concise,
            operations = []
        } = params;

        this.shapeId = shapeId;
        this.concise = concise;
        this.operations = operations;
    }
}
