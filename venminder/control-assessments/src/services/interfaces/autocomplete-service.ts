export interface AutocompleteService {
    suggest(value: string): Promise<string[]>;
}