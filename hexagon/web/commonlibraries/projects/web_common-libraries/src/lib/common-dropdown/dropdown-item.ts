export class DropdownItem {
    /** The text to display on the item */
    text: string;

    /** The identifier of the item */
    value: string;

    /** Path to an icon to display on the DropdownItem */
    iconPath: string;

    /** Path to an image to display on the DropdownItem */
    selectedImgSrc: string;

    /** Function to execute on a click of the DropdownItem */
    onClick: Function;

    /** The width of the item */
    width: string;

    /** The height of the item */
    height: string;

    constructor(text: string, value: string, iconPath?: string, selectedImgSrc?: string,
        onClick?: Function, width?: string, height?: string) {
        this.text = text;
        this.value = value;
        this.iconPath = iconPath;
        this.selectedImgSrc = selectedImgSrc;
        this.onClick = onClick;
        this.width = width;
        this.height = height;
    }
}
