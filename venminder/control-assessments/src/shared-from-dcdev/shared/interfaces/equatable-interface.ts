export interface IEquatable<T> {
    equals(other: T, normalizeStrings: boolean): boolean;
}