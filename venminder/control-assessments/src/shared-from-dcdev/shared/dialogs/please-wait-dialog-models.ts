import type { IPleaseWait } from "../interfaces/please-wait-interface";

export class PleaseWaitViewModel {
    constructor(public pleaseWaitService: IPleaseWait, public statusText: string = null, public totalWork: number = null, public workCompleted: number = null) { };
}