export interface IPleaseWait {
    set(waitMilliseconds?: number): IPleaseWaitOpenPromise;
    cancel(): void;
    isActive(): boolean;
    isVisible(): boolean;
    // Returns false if the pleaseWait service hasn't been set.
    setStatusText(status: string): boolean;
    // Returns false if the pleaseWait service hasn't been set.
    setProgress(status: string, currentValue: number, totalValue: number): boolean;
    completeProgress(): void;
    // Promise returns true if the progress completed and false if cancel was called.
    watchProgress(progressId: string): Promise<boolean>;
}

export interface IPleaseWaitOpenPromise extends PromiseLike<void> {
    then<TResult1 = void, TResult2 = never>(onfulfilled?: (value: void) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): PromiseLike<TResult1 | TResult2>;
    whenOpened(onfulfilled?: (() => void), onrejected?: ((reason: any) => void)): IPleaseWaitOpenPromise;
}