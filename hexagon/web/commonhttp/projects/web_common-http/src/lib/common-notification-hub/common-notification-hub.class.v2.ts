import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { CommonNotificationEvent } from './common-notification-event.class';
import { CommonWindowCommunicationService } from '../common-window-communication/common-window-communication.service';
import { WindowMessage } from '../common-window-communication/common-window-communication-msg.class';
import { filter, first } from 'rxjs/operators';
import { CommonHttpClient } from '../common-http/http.service';
import { CommonHubManagerService } from './common-hub-manager.service';
import { Guid } from '../utils/guid';

interface CommonHubConnection {
    /** The hub connection */
    hub: HubConnection;
    /** The access token */
    accessToken: string;
}

interface InvokeMethodRequest<T> {
    /** Method */
    methodName: string;
    /** Params */
    params: T;
}

interface AddEventsAsyncRequest {
    /** Event names */
    eventNames: string | string[];
    /** Child context id */
    childContextId: string;
}


/**
 * @deprecated Notification hubs are being migrated to platform packages
 * Base class that encapsulates the logic to connect to the signalR hub and the window service.
 */
export abstract class CommonNotificationHubService$v2 {

    /** Event when a notification event is triggered */
    protected event$ = new Subject<CommonNotificationEvent<any>>();

    /**The connection to the signalR hub*/
    private signalRHubConnection: CommonHubConnection = {
        hub: null,
        accessToken: null
    };

    /**The url to the signalR Hub.*/
    private signalRHubRootUrl = '';

    /**
     * Collection of events that should be listen to
     * NOTE: the event should match the signalR hub event and window event.
     */
    private events: string[] = [];

    /**Const that is appended to the context for notifications*/
    private readonly contextConst = 'COMMONNOTIFICATIONHUB';

    /** Message channel for addEventSync to listen to */
     private readonly addEventSyncContextId = '@hxgn/common-http:add-event-sync';

    /**Buffer to hold correlation ids to filter out dup messages*/
    private correlationIdBuffer: string[] = [];

    /**Access token used to access hubs*/
    private currentAccessToken: string;

    /** Buss for receiving messages from the window service */
    private receiveMessageSub: any;

    /** Flag that is true when initialization has been completed */
    private initCompleted$ = new BehaviorSubject<boolean>(false);

    /**
     * Creates a new CommonNotificationHubService object
     * @param signalRRootUrl The root url to the signalR hub
     * @param logging Logging will be enabled when true
     * @param capabilityId The capability the notification is for
     * @param windowCommSrv Reference to the global common window communication service
     * @param manager Service that manages hubs
     * @param useLegacyAuthentication Flag that is true when the legacy authentication method should be used
     */
    constructor(
        signalRRootUrl: string,
        private logging: boolean,
        private capabilityId: string,
        private windowCommSrv: CommonWindowCommunicationService,
        private httpSrv: CommonHttpClient,
        private manager: CommonHubManagerService = null,
        private useLegacyAuthentication = false) {

        this.onHubInit();

        this.signalRHubRootUrl = this.mapURL(signalRRootUrl);

        // Wait for event names to come back
        Promise.resolve(this.eventNames() as Promise<string[]>).then(events => {

            this.events = events;
            this.event$.subscribe((event: CommonNotificationEvent<any>) => {
                this.onEvent(event.eventName, event.data);
            });

            // Called when access token changes
            this.httpSrv.authenticationTokenSet$.pipe(
                filter(item => !!item),
                filter(item => item !== this.currentAccessToken)
            ).subscribe(token => {
                const initConnection = !this.currentAccessToken;

                this.currentAccessToken = token;
                if (initConnection || this.useLegacyAuthentication) {
                    this.initNotificationConnection(token);
                } else {
                    this.refreshAccessToken(token);
                }
            });
        });
    }

    /**
     * Returns a list of event names
     */
    protected eventNames(): Promise<string[]> | string[] {
        throw new Error('getEvents() is not implemented');
    }

    /**
     * Fired when a new notification is evented
     * @param eventName The string name of the event
     * @param data An associated data with event
     */
    protected onEvent(eventName: string, data: any) {
        throw new Error('onEvent() is not implemented');
    }

    /**
     * Fired when a connection is established
     */
    protected onConnectionEstablished() {
        throw new Error('onConnectionEstablished() is not implemented');
    }

    /**
     * Fired when a connection is closed
     */
    protected onConnectionClosed(hasError: boolean) {
        throw new Error('onConnectionClosed(hasError) is not implemented');
    }

    /**
    * Fired first thing when service is being stood up
    */
    protected onHubInit() {
        console.warn('HxGN Connect:: CommonHttp: onHubInit is not implemented');
    }

    /**
     * Add a new event to list of events to listen to after the hub has been initialized
     * @param eventName String name of new event to listen to. Can be a list or single event
     */
    protected async addEventAsync(eventName: string | string[]) {

        const eventNames = Array.isArray(eventName) ? eventName : [eventName];

        // If this is a child window, return a promise that will resolve when the main window
        // has added the events to the SignalR hub.
        if (this.windowCommSrv.isChildWindow()) {
            return new Promise<void>(resolve => {
                const childContextId = `${this.contextConst}:${Guid.NewGuid()}:addEventAsyncComplete`;
                const windowMsg: WindowMessage<AddEventsAsyncRequest> = {
                    data: {
                        eventNames, childContextId
                    } as AddEventsAsyncRequest,
                    contextId: this.addEventSyncContextId
                } as WindowMessage<AddEventsAsyncRequest>;

                // Need to listen for the event from the main window that the events have been wired
                // up before we resolve this promise.  Do this before we send the message to the main window.
                this.windowCommSrv.receiveMessage$.pipe(
                    filter(event => event.contextId === childContextId),
                    first()
                ).subscribe(msg => {
                    resolve();
                });

                // Send message to main window
                this.windowCommSrv.messageMaster(windowMsg);

            });
        } else {
            // The main window will wait for the initialization to be complete and then
            // wire up the events
            await this.initCompleted$.pipe(
                filter(initDone => initDone),
                first()
            ).toPromise();

            this.wireUpSignalREvents(this.signalRHubConnection.hub, eventNames);
        }

    }

    /**
     * Invokes a method on the hub.
     * @param methodName name of the method to invoke
     * @param params The params to pass to the method
     */
    async hubInvoke<T>(methodName: string, params: T): Promise<void> {
        if (this.windowCommSrv.isChildWindow()) {
            return new Promise(resolve => {
                const windowMsg: WindowMessage<InvokeMethodRequest<T>> = {
                    data: {
                        methodName, params
                    } as InvokeMethodRequest<T>,
                    contextId: `${this.contextConst}:${this.capabilityId}:method`
                } as WindowMessage<InvokeMethodRequest<T>>;
                this.windowCommSrv.messageMaster(windowMsg);
                resolve();
            });
        } else {
            // The main window will wait for the initialization to be complete and then
            // wire up the events
            await this.initCompleted$.pipe(
                filter(initDone => initDone),
                first()
            ).toPromise();

            return this.signalRHubConnection.hub.invoke(methodName, params);
        }
    }

    /**
     * Sets up connection to the signalR hub
     */
    private initSignalRConnection(accessToken: string): HubConnection {
        if (this.logging) {
            console.log('----- Init SignalR Connection -----');
        }

        let hubURL = this.signalRHubRootUrl;
        if (hubURL.includes('?')) {
            hubURL = hubURL + `&access_token=${accessToken}`;
        } else {
            hubURL = hubURL + `?access_token=${accessToken}`;
        }

        // Create the connection if this if first time through
        const signalRHubConnection = new HubConnectionBuilder()
            .withUrl(hubURL, {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.Critical)
            .build();

        // Handle signalR close events
        signalRHubConnection.onclose((err) => {
            if (this.currentAccessToken === accessToken) {
                this.onHubClosed(err);
            }
        });

        // Wire up the events
        this.wireUpSignalREvents(signalRHubConnection, this.events);

        //  Start the signalR hub connection
        this.startSignalRHub({ hub: signalRHubConnection, accessToken: accessToken });

        return signalRHubConnection;
    }

    /**
     * Sets up the correct connection based on if the windows is a child window.
     * Will wait for after authentication is ready before setting up a connection.
     * @param accessToken The access token used to create hub connection
     */
    private async initNotificationConnection(accessToken: string) {

        if (this.windowCommSrv.isChildWindow()) {
            if (this.logging) {
                console.log('----- Use Window Communication Channel -----');
            }

            // Tell manager about window comm
            if (this.manager) {
                this.manager.initHub(this.capabilityId);
            }
            this.wireUpWindowCommSrvEvents();
        } else {
            // Make sure to service invoke method request from child windows
            this.listenToChildWindowMethodInvokeRequest();

            // Service addEventAsync requests
            this.listenToChildWindowAddEventsAsyncRequest();

            if (this.logging) {
                console.log('----- Use SignalR Communication Channel -----');
            }

            if (this.signalRHubConnection.accessToken && this.signalRHubConnection.accessToken !== this.currentAccessToken) {
                this.signalRHubConnection.hub.onclose((err) => {
                    this.onConnectionClosed(false);
                    if (this.logging) {
                        console.log('SignalR closed old rolling connection');
                    }
                });
                await this.stopConnection(this.signalRHubConnection.hub);
            }

            this.signalRHubConnection.hub = this.initSignalRConnection(accessToken);
            this.signalRHubConnection.accessToken = accessToken;

        }
    }

    /**
     * Used to refresh the access token without causing a disconnect
     * @param token New access token
     */
    private refreshAccessToken(token: string): void {
        // Only the main window should do this
        if (!this.windowCommSrv.isChildWindow()) {
            this.hubInvoke<string>('RefreshAccessTokenAsync', token).catch(err => {
                console.error(`Common notification hub ${this.capabilityId}:: refreshAccessToken: Could not refresh token!`, err);

                // Need to go through the whole reconnection logic now
                this.initNotificationConnection(token);
            });
        }
    }

    /**
     * Starts a signalR hub connection
     * @param hubConn The signalR hub connection
     */
    private startSignalRHub(hubConn: CommonHubConnection): void {
        // Make sure this conn is still active
        if (hubConn.accessToken !== this.currentAccessToken) {
            return;
        }

        hubConn.hub.serverTimeoutInMilliseconds = 1800000;
        hubConn.hub.start()
            .then(() => {
                if (this.logging) {
                    console.log('SignalR connection started', this.signalRHubRootUrl);
                }

                this.onConnectionEstablished();

                if (!this.initCompleted$.getValue()) {
                    this.initCompleted$.next(true);
                }

                // Pass events to window service
                if (this.windowCommSrv.hasHandles()) {
                    this.notifyChildWindows({
                        connectionOpen: true
                    });
                }
            })
            .catch(err => {
                console.error('Error while establishing signalR connection:', err);
                // Don't try to start the connection if the error is the connection is not disconnected
                if (err.message !== `Cannot start a connection that is not in the 'Disconnected' state.`) {
                    // Try to connect again after 1 second
                    setTimeout(() => {
                        if (hubConn.hub.state === HubConnectionState.Disconnected) {
                            this.startSignalRHub(hubConn);
                        }
                    }, 1000);
                } else {
                    console.warn('SignalR: Do not start an open connection');
                }
            });
    }

    /**
     * Wire up all the signalR events to the connection
     * @param hubConn The signalR hub connection
     */
    private wireUpSignalREvents(hubConn: HubConnection, events: string[]) {
        // Warn that there are no events
        if (!events.length) {
            console.warn('"events" are empty! No notification events created.', this.signalRHubRootUrl, this.events);
        }

        events.forEach((event) => {
            if (this.logging) {
                console.log('Wire up SignalR Event: ', event);
            }

            hubConn.on(event, (data: any) => {
                if (this.logging) {
                    console.log('SignalR Event: ', event, data);
                }

                const notificationEvent: CommonNotificationEvent<any> = {
                    eventName: event,
                    data: data
                };

                if (!data.systemCorrelationId || this.isNewMsg(data.systemCorrelationId)) {
                    // Trigger events for this window
                    this.event$.next(notificationEvent);

                    // Pass events to window service
                    if (this.windowCommSrv.hasHandles()) {
                        this.notifyChildWindows(notificationEvent);
                    }

                    if (this.logging) {
                        console.log('Notification Event', notificationEvent);
                    }
                }
            });
        });
    }

    /**
     * Checks the event buffer to make sure the message has not already been sent
     * This is needed since we have a sliding signalR connection. It is possible to have
     * two different connection to the same hub open at once during authentication refresh.
     * @param correlationId The id the check if is in buffer
     */
    private isNewMsg(correlationId: string): boolean {
        // Return true for messages that do not have a correlation id
        if (!correlationId) {
            return true;
        }

        const foundId = this.correlationIdBuffer.find(id => id === correlationId);

        if (!!foundId) {
            if (this.logging) {
                console.warn('Repeated Message: ' + foundId);
            }

            return false;
        } else {
            this.correlationIdBuffer.unshift(correlationId); // Add to correlation buffer
            this.correlationIdBuffer = this.correlationIdBuffer.slice(0, 50); // Keep buffer small
            return true;
        }
    }

    /**
     * What should be done when a signalR hub connection dies
     * @param err Error that closed the signalR connection
     */
    private async onHubClosed(err?: Error) {
        if (err) {
            console.error('SignalR connection closed with error:', err);
            this.onConnectionClosed(true);

            // Pass events to window service
            if (this.windowCommSrv.hasHandles()) {
                this.notifyChildWindows({
                    connectionClose: true,
                    connectionCloseErr: false
                });
            }
        } else {
            if (this.logging) {
                console.log('SignalR connection closed', this.signalRHubRootUrl);
            }

            this.onConnectionClosed(false);
            // Pass events to window service
            if (this.windowCommSrv.hasHandles()) {
                this.notifyChildWindows({
                    connectionClose: true,
                    connectionCloseErr: true
                });
            }
        }

        // Wait 1 seconds before trying to start the connection
        setTimeout(() => {
            if (this.logging) {
                console.log('Restarting SignalR connection');
            }
            if (this.signalRHubConnection.hub.state === HubConnectionState.Disconnected &&
                this.signalRHubConnection.accessToken === this.currentAccessToken) {
                this.startSignalRHub(this.signalRHubConnection);
            }
        }, 1000);

    }

    /**
     * Set up the window communication service channel
     */
    private wireUpWindowCommSrvEvents() {
        if (!this.receiveMessageSub) {
            this.receiveMessageSub = this.windowCommSrv.receiveMessage$.pipe(
                filter((event) => {
                    if (!event.contextId || event.contextId !== `${this.contextConst}:${this.capabilityId}`) {
                        return false;
                    }
                    return true;
                })
            ).subscribe((msg: any) => {
                // Check for connection life cycle events
                if (msg.data.connectionOpen) {
                    this.onConnectionEstablished();
                } else if (msg.data.connectionClose) {
                    this.onConnectionClosed(msg.data.connectionCloseErr);
                } else {
                    this.event$.next(msg.data);
                }
            });

            // Window comm channel is connected
            setTimeout(() => {
                this.onConnectionEstablished();
            });
        }
    }

    /**
     * Sends event to child windows through the common window communication service.
     * @param event The event to send to child windows
     */
    private notifyChildWindows(event: any, contextId?: string) {
        if (!contextId) {
            contextId = `${this.contextConst}:${this.capabilityId}`;
        }
        this.windowCommSrv.getHandleIds().forEach((handleId) => {
            const windowMsg: WindowMessage<any> = {
                handleId: handleId,
                data: event,
                contextId: contextId
            };

            this.windowCommSrv.messageWindow(windowMsg);
        });
    }

    /**
     * Stops a hub connection if is is connected
     * @param conn The connection to stop
     */
    private async stopConnection(conn: HubConnection) {
        if (conn.state === HubConnectionState.Connected) {
            await conn.stop().then(() => {
                // Pass events to window service
                if (this.windowCommSrv.hasHandles()) {
                    this.notifyChildWindows({
                        connectionClose: true,
                        connectionCloseErr: false
                    });
                }
            }).catch((err) => {
                console.error('Could not stop old connection', err);

                // Wait a second and try again
                setTimeout(async () => {
                    await this.stopConnection(conn);
                }, 1000);
            });
        } else {
            console.warn('SignalR: Could not close an already closed connection');
        }
    }

    /**
     * Maps the port and url to the correct URL.
     * This allow for local development.
     * @param url The base URL to the signalR hub
     */
    private mapURL(url: string): string {
        const hostname = window.location.hostname;

        if (hostname === 'localhost.hxgnconnect.com') {
            url = `https://localhost.hxgnconnect.com/${url}`;
        } else {
            url = `/${url}`;
        }
        return url;
    }

    /**
     * Listens for child window messages to invoice a hub method
     */
    private listenToChildWindowMethodInvokeRequest(): void {
        this.windowCommSrv.receiveMessage$.pipe(
            filter((event) => {
                if (!event.contextId || event.contextId !== `${this.contextConst}:${this.capabilityId}:method`) {
                    return false;
                }
                return true;
            })
        ).subscribe((msg: any) => {
            // Check for connection life cycle events
            if (msg.data.methodName) {
                this.hubInvoke(msg.data.methodName, msg.data.params);
            } else {
                console.error(
                    `Common notification hub ${this.capabilityId}:: invokeMethod: Can not invoke a method on a closed connection`
                );
                // Not connected so method invoke can't happen
            }
        });
    }

    /**
     * Listens for child window messages to addEventsAsync so that the events can be
     * hooked up to the SignalR hub.
     */
    private listenToChildWindowAddEventsAsyncRequest(): void {
        this.windowCommSrv.receiveMessage$.pipe(
            filter((event) => {
                if (!event.contextId || event.contextId !== this.addEventSyncContextId) {
                    return false;
                }
                return true;
            })
        ).subscribe( async (msg: any) => {
            // Call the hubs addEventSync method to hook up the events with the signalR hub.
            await this.addEventAsync(msg.data.eventNames);
            // Notify the child window that sent the addEventAsync call
            this.notifyChildWindows(true, msg.data.childContextId);
        });
    }

}
