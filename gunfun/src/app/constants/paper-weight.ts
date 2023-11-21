/**
 * Enum to represent all possible paper weights
 */
export enum PaperWeight {
    fiftyPounds = '50 lb Text',
    eightyPounds = '80 lb Text',
    tag = 'TAG',
    heavyTag = 'Heavy TAG',
}

/**
 * List of paper weights to select from
 */
export const PaperWeights = [PaperWeight.fiftyPounds, PaperWeight.eightyPounds, PaperWeight.tag, PaperWeight.heavyTag];
