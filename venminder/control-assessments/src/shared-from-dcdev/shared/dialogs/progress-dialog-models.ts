export class ProgressDialogModel {
    constructor(
        public hubName: string,
        public hubMethod: string,
        public hubMethodArgs: any[],
        public dialogTitle: string,
        public initialMessage: string,
        public allowCancel: boolean,
        public closeOnCancel: boolean,
        public closeOnComplete: boolean,
        public startActionButtonTitle: string,
        public closeActionButtonTitle: string) { }
}