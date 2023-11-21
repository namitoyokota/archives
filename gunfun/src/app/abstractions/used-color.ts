/**
 * Represents one of the 4 colors
 */
export default interface UsedColor {
    /** Identifier of the used color */
    id: number;

    /** Id of the batch attached */
    batchId: number;

    /** Color identifier */
    color: string;

    /** Quantity of ink used */
    quantityUsed: number;
}
