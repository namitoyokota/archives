export class Batch {
    constructor(
        /** Identifier of the batch */
        public id: number = null,

        /** Incremental id for the batch item */
        public itemid: string = null,

        /** GunFun, M&P */
        public type: string = null,

        /** Low, Medium, High */
        public urgency: string = null,

        /** Date of the batch created date */
        public createddate: Date = null,

        /** Date of the last updated */
        public lastediteddate: Date = null,

        /** Date to run the print */
        public scheduleddate: Date = null,

        /** 50 lbs, 80 lbs, tag, heavy tag, other */
        public paperweight: string = null,

        /** Description of the batch */
        public description: string = null,

        /** Additional comments not mentioned */
        public comments: string = null,

        /** 1, 2, 3, 4, 6, 8 */
        public numberpersheet: string = null,

        /** 28x40, 24x40, 25x38, 23x35, other */
        public parentsheet: string = null,

        /** 28x40, 24x40, 23x35, 19x25, 19x24, 14x20, 11.25x23, 11.5x11.5, 9.5x12, 17.5x23, other */
        public finishedsheetsize: string = null,

        /** Rolls, sheets, double sided */
        public paperpackaging: string = null,

        /** Operator of the press */
        public pressoperator: string = null,

        /** Date that the press was completed */
        public completeddate: Date = null,

        /** Deadline for the print */
        public runbydate: Date = null,

        /** Date that the print was shipped */
        public shipdate: Date = null,

        /** Requested quantity from the customer */
        public quantityrequested: number = null,

        /** Total number of printed quantity */
        public quantityprinted: number = null,

        /** Id of the press used */
        public pressid: number = null,

        /** Indicates whether print is complete */
        public iscompleted = false,

        /** Name of the first ink color */
        public ink1name: string = null,

        /** Quantity of the first ink color */
        public ink1quantity: number = null,

        /** Name of the second ink color */
        public ink2name: string = null,

        /** Quantity of the second ink color */
        public ink2quantity: number = null,

        /** Name of the third ink color */
        public ink3name: string = null,

        /** Quantity of the third ink color */
        public ink3quantity: number = null,

        /** Name of the fourth ink color */
        public ink4name: string = null,

        /** Quantity of the fourth ink color */
        public ink4quantity: number = null,
    ) {}

    static create(item: Batch = null): Batch {
        return item == null
            ? new Batch()
            : new Batch(
                  item.id,
                  item.itemid,
                  item.type,
                  item.urgency,
                  item.createddate ? new Date(item.createddate) : null,
                  item.lastediteddate ? new Date(item.lastediteddate) : null,
                  item.scheduleddate ? new Date(item.scheduleddate) : null,
                  item.paperweight,
                  item.description,
                  item.comments,
                  item.numberpersheet,
                  item.parentsheet,
                  item.finishedsheetsize,
                  item.paperpackaging,
                  item.pressoperator,
                  item.completeddate ? new Date(item.completeddate) : null,
                  item.runbydate ? new Date(item.runbydate) : null,
                  item.shipdate ? new Date(item.shipdate) : null,
                  item.quantityrequested,
                  item.quantityprinted,
                  item.pressid,
                  item.iscompleted,
                  item.ink1name,
                  item.ink1quantity,
                  item.ink2name,
                  item.ink2quantity,
                  item.ink3name,
                  item.ink3quantity,
                  item.ink4name,
                  item.ink4quantity,
              );
    }
}
