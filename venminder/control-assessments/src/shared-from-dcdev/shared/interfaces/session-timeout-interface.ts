export interface ISessionTimeout {
    start(): void;
    hasTimedOut(): boolean;
}