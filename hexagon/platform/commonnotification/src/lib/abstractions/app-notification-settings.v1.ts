/**
 * Setting for notifications. Set by the app notification admin.
 */
export class AppNotificationSettings$v1 {
    /** The order priority given to the notification */
    displayOrder?: number;

    /** How long the toast notification should be displayed on the screen */
    toastDuration?: number;

    /** A flag that is true when the toast notification should have animation. */
    animation?: boolean;

    /** Flag that is true if audio should be played for a notification */
    audio?: boolean;

    /** The file to play for audio notifications */
    audioFile?: string;

    /** A flag that is true if the notification should never be part of a group */
    noGrouping?: boolean;

    constructor(params: AppNotificationSettings$v1 = {} as AppNotificationSettings$v1) {
        const {
            displayOrder = 0,
            toastDuration = 15,
            animation = true,
            audio = false,
            audioFile = null,
            noGrouping = false
        } = params;

        this.displayOrder = displayOrder;
        this.toastDuration = toastDuration;
        this.animation = animation;
        this.audio = audio;
        this.audioFile = audioFile;
        this.noGrouping = noGrouping;
    }
}
