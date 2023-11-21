export class EllipsisOption {
    /** Identifier for the selection */
    id: string;

    /** Font awesome icon name to use */
    iconName: string;

    /** Text to display */
    text: string;

    constructor(id: string, iconName: string, text: string) {
        this.id = id;
        this.iconName = iconName;
        this.text = text;
    }
}
