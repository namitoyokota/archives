/**
 * Represents a notification event
 */
export interface CommonNotificationEvent<T> {
    /**
     * The string name of the event. This should match
     * the signalR hub event name.
     */
    eventName: string;
    /**
     * The data that is returned from the event.
     */
    data: T;
}
