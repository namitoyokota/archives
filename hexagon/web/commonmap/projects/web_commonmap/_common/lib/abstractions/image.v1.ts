/** Defines a image file that is used for an image layer on the map */
export class Image$v1 {
    /** Label or name for image */
    label: string;
    /** Uri for the image file */
    uri: string;

    constructor(params = {} as Image$v1) {
        const {
            label,
            uri
        } = params;

        this.label = label;
        this.uri = uri;
    }
}

