/**
 * Possible package types
 */
export enum PaperPackaging {
    rolls = 'Rolls',
    sheets = 'Sheets',
    doubleSided = 'Double Sided',
}

/**
 * Options to select for package type
 */
export const PaperPackagings = [PaperPackaging.rolls, PaperPackaging.sheets, PaperPackaging.doubleSided];
