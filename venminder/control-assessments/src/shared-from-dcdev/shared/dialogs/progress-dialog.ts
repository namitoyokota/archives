import { inject, customElement } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
//import { HubConnection, Observable as SignalRObservable, TransportType } from '@aspnet/signalr';
import { HubConnectionBuilder, HubConnection, IStreamResult, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { HubMessage, HubProgressMessageData } from "../models/hub-message";
import { AppLog } from "../../shared/utilities/globals";
import { ProgressDialogModel } from './progress-dialog-models';


@customElement('download-dialog')
export class ProgressDialog {
    public model: ProgressDialogModel;
    public title: string = "";
    public message: string = "";
    public totalWork: number = 0;
    public workCompleted: number = 0;
    public percentComplete: number = 0;
    private connection: HubConnection;
    private completeData: HubProgressMessageData;
    public isRunning: boolean = false;
    public hasCompleted: boolean = false;
    public wasCancelled: boolean = false;
    public wasError: boolean = false;
    //private streamSubscription: SignalRObservable<any> = null;
    private streamSubscription: IStreamResult<any> = null;

    constructor(
        @inject(DialogController) public controller: DialogController
    ) { }

    activate(model: ProgressDialogModel) {
        this.model = model;
        this.message = model.initialMessage;
        this.isRunning = false;
        this.hasCompleted = false;
        this.wasCancelled = false;
        this.wasError = false;
        this.connection = null;
        this.streamSubscription = null;
    }  
    //startConnection(url: string): Promise<void> {
    //    return function start(transport: TransportType, self: ProgressDialog) {
    //        AppLog.info(`Starting connection using ${TransportType[transport]} transport`);
    //        self.connection = new HubConnection(url, { transport: transport });
    //        return self.connection.start().then(function () {
    //            return self.connection;
    //        }).catch(function (error) {
    //            AppLog.warn(`Cannot start the connection use ${TransportType[transport]} transport.`);
    //            if (transport !== TransportType.LongPolling) {
    //                return start(transport + 1, self);
    //            }
    //            return Promise.reject(error);
    //        });
    //    }(TransportType.WebSockets, this);
    //}
    start() {
        this.isRunning = true;
        this.message = "Starting"

        //let startPromise = this.startConnection(this.model.hubName);
        //startPromise.then(() => {
        this.connection = new HubConnectionBuilder()
            .withUrl(this.model.hubName, { transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents })
            .configureLogging(LogLevel.Information)
            .build();
        this.connection.start().then(() => {
            this.streamSubscription = this.connection.stream(this.model.hubMethod, ...this.model.hubMethodArgs);
            this.streamSubscription.subscribe({
                next: (message: HubMessage) => {
                    if (!this.wasCancelled && message.name != "cancelled") {
                        if (message.name == "progress") {
                            let data: HubProgressMessageData = JSON.parse(message.data);
                            this.message = data.description;
                            this.totalWork = data.totalWork;
                            this.workCompleted = data.workCompleted
                            this.percentComplete = (100 * this.workCompleted) / this.totalWork;
                        }
                        else if (message.name == "complete") {
                            let data: HubProgressMessageData = JSON.parse(message.data);
                            this.completeData = data;
                            this.message = data.description;
                        }
                        else if (message.name == "error") {
                            let data: HubProgressMessageData = JSON.parse(message.data);
                            this.message = data.description;
                            this.wasError = true;
                        }
                    }
                    else if (message.name == "cancelled") {
                        let data: HubProgressMessageData = JSON.parse(message.data);
                        this.message = data.description;
                        this.wasCancelled = true;
                    }
                },
                error: err => {
                    this.stopConnection();
                    this.wasError = true;
                    console.log('Progress Dialog Error:', err);
                    // Related to several tickets (working on 7886 at the moment).  True error of doc being attached to oversight management task being covered up by hub service error
                    //this.message = (err && err.message) ? err.message : "An unknown error occurred.";  
                },
                complete: () => {
                    this.stopConnection();

                    if (this.wasError)
                        return;

                    if (this.wasCancelled) {
                        if (this.model.closeOnCancel)
                            this.controller.cancel();
                    }
                    else if (this.model.closeOnComplete)
                        this.controller.ok(this.completeData);
                }
            }); 
        }).catch(err => {
            this.stopConnection();
            this.wasError = true;
            this.message = (err && err.message) ? err.message : "An unknown error occurred.";
            AppLog.error(this.message);
        });
    }
    complete() {
        this.controller.ok(this.completeData);
    }
    cancel() {
        this.message = "Cancelled";
        this.stopConnection();
        this.wasCancelled = true;
        if (this.model.closeOnCancel)
            this.controller.cancel();
    }
    close() {
        this.controller.cancel();
    }
    stopConnection() {
        this.connection.stop();
        this.connection = null;
        this.hasCompleted = true;
        this.isRunning = false;
    }
}

